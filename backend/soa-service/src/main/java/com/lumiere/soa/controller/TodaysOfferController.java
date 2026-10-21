package com.lumiere.soa.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lumiere.soa.model.CafeContent;
import com.lumiere.soa.repository.CafeContentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class TodaysOfferController {

    private final CafeContentRepository cafeContentRepository;
    private final ObjectMapper objectMapper;

    public TodaysOfferController(CafeContentRepository cafeContentRepository, ObjectMapper objectMapper) {
        this.cafeContentRepository = cafeContentRepository;
        this.objectMapper = objectMapper;
    }

    private List<Map<String, Object>> getOffersList() {
        Optional<CafeContent> opt = cafeContentRepository.findById("todays_offers");
        if (opt.isPresent() && opt.get().getContentJson() != null && !opt.get().getContentJson().isBlank()) {
            try {
                return objectMapper.readValue(opt.get().getContentJson(), new TypeReference<List<Map<String, Object>>>() {});
            } catch (Exception e) {
                return new ArrayList<>();
            }
        }
        return new ArrayList<>();
    }

    private void saveOffersList(List<Map<String, Object>> list) {
        try {
            String json = objectMapper.writeValueAsString(list);
            CafeContent content = CafeContent.builder()
                    .contentKey("todays_offers")
                    .contentJson(json)
                    .build();
            cafeContentRepository.save(content);
        } catch (Exception ignored) {}
    }

    @GetMapping({"/api/todays-offers", "/api/todays-offers/all", "/todays-offers", "/todays-offers/all"})
    public ResponseEntity<?> getOffers() {
        List<Map<String, Object>> list = getOffersList();
        return ResponseEntity.ok(Map.of("data", list));
    }

    @PostMapping({"/api/todays-offers", "/todays-offers"})
    public ResponseEntity<?> createOffer(@RequestBody Map<String, Object> offer) {
        List<Map<String, Object>> list = getOffersList();
        String id = offer.get("id") != null ? offer.get("id").toString() : "offer_" + System.currentTimeMillis();
        offer.put("id", id);
        offer.put("_id", id);
        offer.put("created_at", LocalDateTime.now().toString());
        offer.put("updated_at", LocalDateTime.now().toString());
        if (!offer.containsKey("isActive") && !offer.containsKey("is_active")) {
            offer.put("isActive", true);
        }
        list.add(offer);
        saveOffersList(list);
        return ResponseEntity.ok(Map.of("data", offer));
    }

    @PutMapping({"/api/todays-offers/{id}", "/todays-offers/{id}"})
    public ResponseEntity<?> updateOffer(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        List<Map<String, Object>> list = getOffersList();
        Map<String, Object> found = null;
        for (Map<String, Object> item : list) {
            if (id.equals(item.get("id")) || id.equals(item.get("_id"))) {
                item.putAll(updates);
                item.put("updated_at", LocalDateTime.now().toString());
                found = item;
                break;
            }
        }
        if (found != null) {
            saveOffersList(list);
            return ResponseEntity.ok(Map.of("data", found));
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping({"/api/todays-offers/{id}/toggle", "/todays-offers/{id}/toggle"})
    public ResponseEntity<?> toggleOffer(@PathVariable String id) {
        List<Map<String, Object>> list = getOffersList();
        Map<String, Object> found = null;
        for (Map<String, Object> item : list) {
            if (id.equals(item.get("id")) || id.equals(item.get("_id"))) {
                boolean cur = Boolean.TRUE.equals(item.get("isActive")) || Boolean.TRUE.equals(item.get("is_active"));
                item.put("isActive", !cur);
                item.put("is_active", !cur);
                item.put("updated_at", LocalDateTime.now().toString());
                found = item;
                break;
            }
        }
        if (found != null) {
            saveOffersList(list);
            return ResponseEntity.ok(Map.of("data", found));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping({"/api/todays-offers/{id}", "/todays-offers/{id}"})
    public ResponseEntity<?> deleteOffer(@PathVariable String id) {
        List<Map<String, Object>> list = getOffersList();
        list.removeIf(item -> id.equals(item.get("id")) || id.equals(item.get("_id")));
        saveOffersList(list);
        return ResponseEntity.ok(Map.of("data", Map.of("id", id, "deleted", true)));
    }
}
