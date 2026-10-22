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
                List<Map<String, Object>> list = objectMapper.readValue(opt.get().getContentJson(), new TypeReference<List<Map<String, Object>>>() {});
                if (list != null && !list.isEmpty()) {
                    return list;
                }
            } catch (Exception ignored) {}
        }

        // Pre-seeded artisanal offers with valid future dates
        List<Map<String, Object>> defaults = new ArrayList<>();
        Map<String, Object> o1 = new HashMap<>();
        o1.put("id", "offer_001");
        o1.put("_id", "offer_001");
        o1.put("title", "Chef's Truffle Risotto Special");
        o1.put("description", "Enjoy 20% off our signature creamy wild mushroom and black truffle risotto this week!");
        o1.put("discount", "20% OFF");
        o1.put("validUntil", java.time.LocalDate.now().plusDays(25).toString());
        o1.put("valid_until", java.time.LocalDate.now().plusDays(25).toString());
        o1.put("image", "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500&h=350&fit=crop");
        o1.put("isActive", true);
        o1.put("createdAt", LocalDateTime.now().toString());
        o1.put("created_at", LocalDateTime.now().toString());

        Map<String, Object> o2 = new HashMap<>();
        o2.put("id", "offer_002");
        o2.put("_id", "offer_002");
        o2.put("title", "Morning Coffee & Pastry Pair");
        o2.put("description", "Complimentary artisanal croissant with any double shot flat white or cappuccino.");
        o2.put("discount", "Free Pastry");
        o2.put("validUntil", java.time.LocalDate.now().plusDays(30).toString());
        o2.put("valid_until", java.time.LocalDate.now().plusDays(30).toString());
        o2.put("image", "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&h=350&fit=crop");
        o2.put("isActive", true);
        o2.put("createdAt", LocalDateTime.now().toString());
        o2.put("created_at", LocalDateTime.now().toString());

        defaults.add(o1);
        defaults.add(o2);
        saveOffersList(defaults);
        return defaults;
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
        String nowStr = LocalDateTime.now().toString();
        offer.put("created_at", nowStr);
        offer.put("createdAt", nowStr);
        offer.put("updated_at", nowStr);
        offer.put("updatedAt", nowStr);
        if (offer.containsKey("validUntil") && !offer.containsKey("valid_until")) {
            offer.put("valid_until", offer.get("validUntil"));
        } else if (offer.containsKey("valid_until") && !offer.containsKey("validUntil")) {
            offer.put("validUntil", offer.get("valid_until"));
        }
        if (!offer.containsKey("isActive") && !offer.containsKey("is_active")) {
            offer.put("isActive", true);
            offer.put("is_active", true);
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
                if (updates.containsKey("validUntil")) item.put("valid_until", updates.get("validUntil"));
                if (updates.containsKey("valid_until")) item.put("validUntil", updates.get("valid_until"));
                String nowStr = LocalDateTime.now().toString();
                item.put("updated_at", nowStr);
                item.put("updatedAt", nowStr);
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
