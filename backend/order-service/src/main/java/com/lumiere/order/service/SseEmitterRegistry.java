package com.lumiere.order.service;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * In-memory registry for Server-Sent Events emitters.
 * Manages two channels: order tracking and kitchen updates.
 */
@Component
public class SseEmitterRegistry {

    private final ConcurrentHashMap<String, SseEmitter> orderEmitters = new ConcurrentHashMap<>();
    private final CopyOnWriteArrayList<SseEmitter> kitchenEmitters = new CopyOnWriteArrayList<>();

    // ── Order tracking ───────────────────────────────────────────────────────

    public SseEmitter createOrderEmitter(String userId) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout
        orderEmitters.put(userId, emitter);
        emitter.onCompletion(() -> orderEmitters.remove(userId));
        emitter.onTimeout(() -> orderEmitters.remove(userId));
        emitter.onError(e -> orderEmitters.remove(userId));
        return emitter;
    }

    public void sendOrderUpdate(String userId, Object data) {
        SseEmitter emitter = orderEmitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("order-update").data(data));
            } catch (IOException e) {
                orderEmitters.remove(userId);
            }
        }
    }

    // ── Kitchen stream ───────────────────────────────────────────────────────

    public SseEmitter createKitchenEmitter() {
        SseEmitter emitter = new SseEmitter(0L);
        kitchenEmitters.add(emitter);
        emitter.onCompletion(() -> kitchenEmitters.remove(emitter));
        emitter.onTimeout(() -> kitchenEmitters.remove(emitter));
        emitter.onError(e -> kitchenEmitters.remove(emitter));
        return emitter;
    }

    public void sendKitchenUpdate(Object data) {
        List<SseEmitter> dead = new java.util.ArrayList<>();
        for (SseEmitter emitter : kitchenEmitters) {
            try {
                emitter.send(SseEmitter.event().name("kitchen-update").data(data));
            } catch (IOException e) {
                dead.add(emitter);
            }
        }
        kitchenEmitters.removeAll(dead);
    }
}
