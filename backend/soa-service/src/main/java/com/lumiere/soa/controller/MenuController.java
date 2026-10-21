package com.lumiere.soa.controller;

import com.lumiere.soa.model.MenuItem;
import com.lumiere.soa.repository.MenuItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Skill 1: Designing a Food Delivery SOA System — Restaurant Menu Catalog
 */
@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    private final MenuItemRepository menuItemRepository;

    public MenuController(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    @GetMapping
    public ResponseEntity<?> getMenuItems(@RequestParam(required = false) String category) {
        List<MenuItem> items;
        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            items = menuItemRepository.findByCategoryIgnoreCase(category.trim());
        } else {
            items = menuItemRepository.findAll();
        }

        Map<String, Object> data = new HashMap<>();
        data.put("items", items);
        return ResponseEntity.ok(Map.of("data", data));
    }

    @GetMapping("/categories/list")
    public ResponseEntity<?> getCategories() {
        List<MenuItem> all = menuItemRepository.findAll();
        Set<String> unique = all.stream()
                .map(MenuItem::getCategory)
                .filter(Objects::nonNull)
                .filter(c -> !c.isBlank())
                .collect(Collectors.toCollection(TreeSet::new));

        List<Map<String, String>> result = unique.stream()
                .map(c -> Map.of("category", c))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", result));
    }

    @PostMapping
    public ResponseEntity<?> createMenuItem(@RequestBody MenuItem item) {
        if (item.getId() == null || item.getId().isBlank()) {
            item.setId("menu_" + System.currentTimeMillis());
        }
        MenuItem saved = menuItemRepository.save(item);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Optional<MenuItem> existingOpt = menuItemRepository.findById(id);
        MenuItem existing = existingOpt.orElseGet(() -> MenuItem.builder().id(id).build());

        if (body.containsKey("name") && body.get("name") != null) existing.setName((String) body.get("name"));
        if (body.containsKey("description") && body.get("description") != null) existing.setDescription((String) body.get("description"));
        if (body.containsKey("price") && body.get("price") != null) {
            try {
                existing.setPrice(Double.parseDouble(body.get("price").toString()));
            } catch (Exception ignored) {}
        }
        if (body.containsKey("category") && body.get("category") != null) existing.setCategory((String) body.get("category"));
        if (body.containsKey("image") && body.get("image") != null) existing.setImage((String) body.get("image"));

        if (body.containsKey("isAvailable")) existing.setAvailable(Boolean.parseBoolean(body.get("isAvailable").toString()));
        else if (body.containsKey("is_available")) existing.setAvailable(Boolean.parseBoolean(body.get("is_available").toString()));

        if (body.containsKey("isVeg")) existing.setVeg(Boolean.parseBoolean(body.get("isVeg").toString()));
        else if (body.containsKey("is_veg")) existing.setVeg(Boolean.parseBoolean(body.get("is_veg").toString()));

        if (body.containsKey("showOnHomepage")) existing.setShowOnHomepage(Boolean.parseBoolean(body.get("showOnHomepage").toString()));
        else if (body.containsKey("show_on_homepage")) existing.setShowOnHomepage(Boolean.parseBoolean(body.get("show_on_homepage").toString()));

        MenuItem saved = menuItemRepository.save(existing);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @RequestMapping(value = "/{id}/toggle", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<?> toggleAvailable(@PathVariable String id) {
        Optional<MenuItem> itemOpt = menuItemRepository.findById(id);
        if (itemOpt.isPresent()) {
            MenuItem item = itemOpt.get();
            item.setAvailable(!item.isAvailable());
            MenuItem saved = menuItemRepository.save(item);
            return ResponseEntity.ok(Map.of("data", saved));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/toggle-homepage")
    public ResponseEntity<?> toggleHomepage(@PathVariable String id) {
        Optional<MenuItem> itemOpt = menuItemRepository.findById(id);
        if (itemOpt.isPresent()) {
            MenuItem item = itemOpt.get();
            item.setShowOnHomepage(!item.isShowOnHomepage());
            MenuItem saved = menuItemRepository.save(item);
            return ResponseEntity.ok(Map.of("data", saved));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable String id) {
        menuItemRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("data", Map.of("id", id, "deleted", true)));
    }
}
