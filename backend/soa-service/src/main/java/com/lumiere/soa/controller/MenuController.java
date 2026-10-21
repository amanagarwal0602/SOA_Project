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
    public ResponseEntity<?> updateMenuItem(@PathVariable String id, @RequestBody MenuItem updated) {
        Optional<MenuItem> existingOpt = menuItemRepository.findById(id);
        if (existingOpt.isEmpty()) {
            updated.setId(id);
            MenuItem saved = menuItemRepository.save(updated);
            return ResponseEntity.ok(Map.of("data", saved));
        }

        MenuItem existing = existingOpt.get();
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getPrice() > 0) existing.setPrice(updated.getPrice());
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        if (updated.getImage() != null) existing.setImage(updated.getImage());
        existing.setAvailable(updated.isAvailable());
        existing.setVeg(updated.isVeg());
        existing.setShowOnHomepage(updated.isShowOnHomepage());

        MenuItem saved = menuItemRepository.save(existing);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PatchMapping("/{id}/toggle")
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
