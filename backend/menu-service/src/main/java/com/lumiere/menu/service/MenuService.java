package com.lumiere.menu.service;

import com.lumiere.common.exception.*;
import com.lumiere.menu.dto.*;
import com.lumiere.menu.model.MenuItem;
import com.lumiere.menu.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.io.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Menu item service — CRUD, filtering, cache, CSV import/export, internal stock API.
 *
 * Caffeine cache "menuItems" TTL 5 min (configured in application.yml).
 * All write operations evict the cache.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    // ── Read (cached) ────────────────────────────────────────────────────────

    @Cacheable(value = "menuItems", key = "'all'")
    public List<MenuItemResponse> getAllMenuItems() {
        return menuItemRepository.findAll().stream()
                .map(MenuItemResponse::from)
                .collect(Collectors.toList());
    }

    public List<MenuItemResponse> getFilteredMenuItems(String category, String search, Boolean isVeg) {
        List<MenuItem> items;

        if (category != null && !category.isBlank()) {
            items = menuItemRepository.findByCategory(category);
        } else if (search != null && !search.isBlank()) {
            items = menuItemRepository.findByNameContainingIgnoreCase(search);
        } else if (Boolean.TRUE.equals(isVeg)) {
            items = menuItemRepository.findByVegTrue();
        } else {
            items = menuItemRepository.findAll();
        }

        return items.stream()
                .map(MenuItemResponse::from)
                .collect(Collectors.toList());
    }

    public MenuItemResponse getMenuItemById(String id) {
        MenuItem item = findOrThrow(id);
        return MenuItemResponse.from(item);
    }

    // ── Create ───────────────────────────────────────────────────────────────

    @CacheEvict(value = "menuItems", allEntries = true)
    public MenuItemResponse createMenuItem(CreateMenuItemRequest request) {
        MenuItem item = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .image(request.getImage())
                .veg(request.isVeg())
                .spicyLevel(request.getSpicyLevel())
                .ingredients(request.getIngredients() != null ? request.getIngredients() : new ArrayList<>())
                .allergens(request.getAllergens() != null ? request.getAllergens() : new ArrayList<>())
                .nutrition(mapNutrition(request.getNutrition()))
                .prepTime(request.getPrepTime())
                .stockQty(request.getStockQty())
                .showOnHomepage(request.isShowOnHomepage())
                .prepStation(request.getPrepStation() != null ? request.getPrepStation() : "general")
                .dietaryTags(request.getDietaryTags() != null ? request.getDietaryTags() : new ArrayList<>())
                .available(true)
                .build();

        item = menuItemRepository.save(item);
        log.info("Menu item created: {} ({})", item.getName(), item.getId());
        return MenuItemResponse.from(item);
    }

    // ── Update ───────────────────────────────────────────────────────────────

    @CacheEvict(value = "menuItems", allEntries = true)
    public MenuItemResponse updateMenuItem(String id, UpdateMenuItemRequest request) {
        MenuItem item = findOrThrow(id);

        if (request.getName() != null) item.setName(request.getName());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getPrice() != null) item.setPrice(request.getPrice());
        if (request.getCategory() != null) item.setCategory(request.getCategory());
        if (request.getImage() != null) item.setImage(request.getImage());
        if (request.getVeg() != null) item.setVeg(request.getVeg());
        if (request.getSpicyLevel() != null) item.setSpicyLevel(request.getSpicyLevel());
        if (request.getIngredients() != null) item.setIngredients(request.getIngredients());
        if (request.getAllergens() != null) item.setAllergens(request.getAllergens());
        if (request.getNutrition() != null) item.setNutrition(mapNutrition(request.getNutrition()));
        if (request.getPrepTime() != null) item.setPrepTime(request.getPrepTime());
        if (request.getStockQty() != null) item.setStockQty(request.getStockQty());
        if (request.getShowOnHomepage() != null) item.setShowOnHomepage(request.getShowOnHomepage());
        if (request.getPrepStation() != null) item.setPrepStation(request.getPrepStation());
        if (request.getDietaryTags() != null) item.setDietaryTags(request.getDietaryTags());

        item = menuItemRepository.save(item);
        log.info("Menu item updated: {} ({})", item.getName(), item.getId());
        return MenuItemResponse.from(item);
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    @CacheEvict(value = "menuItems", allEntries = true)
    public void deleteMenuItem(String id) {
        MenuItem item = findOrThrow(id);
        menuItemRepository.delete(item);
        log.info("Menu item deleted: {} ({})", item.getName(), item.getId());
    }

    // ── Toggle availability ──────────────────────────────────────────────────

    @CacheEvict(value = "menuItems", allEntries = true)
    public MenuItemResponse toggleAvailability(String id) {
        MenuItem item = findOrThrow(id);
        item.setAvailable(!item.isAvailable());
        item = menuItemRepository.save(item);
        return MenuItemResponse.from(item);
    }

    // ── Toggle show on homepage ──────────────────────────────────────────────

    @CacheEvict(value = "menuItems", allEntries = true)
    public MenuItemResponse toggleHomepage(String id) {
        MenuItem item = findOrThrow(id);
        item.setShowOnHomepage(!item.isShowOnHomepage());
        item = menuItemRepository.save(item);
        return MenuItemResponse.from(item);
    }

    // ── CSV Export ───────────────────────────────────────────────────────────

    public String exportCsv() {
        List<MenuItem> items = menuItemRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("id,name,description,price,category,image,isAvailable,isVeg,spicyLevel,prepTime,prepStation\n");
        for (MenuItem item : items) {
            sb.append(csvEscape(item.getId())).append(",");
            sb.append(csvEscape(item.getName())).append(",");
            sb.append(csvEscape(item.getDescription())).append(",");
            sb.append(item.getPrice()).append(",");
            sb.append(csvEscape(item.getCategory())).append(",");
            sb.append(csvEscape(item.getImage())).append(",");
            sb.append(item.isAvailable()).append(",");
            sb.append(item.isVeg()).append(",");
            sb.append(item.getSpicyLevel()).append(",");
            sb.append(item.getPrepTime()).append(",");
            sb.append(csvEscape(item.getPrepStation())).append("\n");
        }
        return sb.toString();
    }

    // ── CSV Import ──────────────────────────────────────────────────────────

    @CacheEvict(value = "menuItems", allEntries = true)
    public int importCsv(InputStream csvStream) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(csvStream));
        String header = reader.readLine(); // skip header
        if (header == null) return 0;

        int count = 0;
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.isBlank()) continue;
            String[] cols = parseCsvLine(line);
            if (cols.length < 5) continue;

            MenuItem item = MenuItem.builder()
                    .name(cols[0].trim())
                    .description(cols.length > 1 ? cols[1].trim() : "")
                    .price(new BigDecimal(cols[2].trim()))
                    .category(cols[3].trim())
                    .image(cols.length > 4 ? cols[4].trim() : "")
                    .available(true)
                    .build();
            menuItemRepository.save(item);
            count++;
        }
        log.info("CSV import: {} items imported", count);
        return count;
    }

    // ── Internal: batch fetch by IDs ─────────────────────────────────────────

    public List<MenuItemResponse> getMenuItemsByIds(List<String> ids) {
        return menuItemRepository.findByIdIn(ids).stream()
                .map(MenuItemResponse::from)
                .collect(Collectors.toList());
    }

    // ── Internal: stock reservation ──────────────────────────────────────────

    @CacheEvict(value = "menuItems", allEntries = true)
    public List<StockReservation> reserveStock(List<StockReservation> reservations) {
        List<StockReservation> results = new ArrayList<>();
        for (StockReservation req : reservations) {
            MenuItem item = menuItemRepository.findById(req.getMenuItemId()).orElse(null);
            if (item == null) {
                results.add(StockReservation.builder()
                        .menuItemId(req.getMenuItemId())
                        .qty(req.getQty())
                        .success(false)
                        .available(0)
                        .build());
                continue;
            }

            if (!item.isAvailable()) {
                results.add(StockReservation.builder()
                        .menuItemId(req.getMenuItemId())
                        .qty(req.getQty())
                        .success(false)
                        .available(0)
                        .build());
                continue;
            }

            // If stockQty is null, unlimited stock
            if (item.getStockQty() != null) {
                if (item.getStockQty() < req.getQty()) {
                    results.add(StockReservation.builder()
                            .menuItemId(req.getMenuItemId())
                            .qty(req.getQty())
                            .success(false)
                            .available(item.getStockQty())
                            .build());
                    continue;
                }
                item.setStockQty(item.getStockQty() - req.getQty());
                menuItemRepository.save(item);
            }

            // Increment order count
            item.setOrderCount(item.getOrderCount() + req.getQty());
            menuItemRepository.save(item);

            results.add(StockReservation.builder()
                    .menuItemId(req.getMenuItemId())
                    .qty(req.getQty())
                    .success(true)
                    .available(item.getStockQty())
                    .build());
        }
        return results;
    }

    @CacheEvict(value = "menuItems", allEntries = true)
    public void releaseStock(List<StockReservation> reservations) {
        for (StockReservation req : reservations) {
            menuItemRepository.findById(req.getMenuItemId()).ifPresent(item -> {
                if (item.getStockQty() != null) {
                    item.setStockQty(item.getStockQty() + req.getQty());
                    menuItemRepository.save(item);
                }
            });
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private MenuItem findOrThrow(String id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));
    }

    private MenuItem.Nutrition mapNutrition(NutritionDto dto) {
        if (dto == null) return new MenuItem.Nutrition();
        return MenuItem.Nutrition.builder()
                .calories(dto.getCalories())
                .protein(dto.getProtein())
                .carbs(dto.getCarbs())
                .fat(dto.getFat())
                .build();
    }

    private String csvEscape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private String[] parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();
        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        result.add(current.toString());
        return result.toArray(new String[0]);
    }
}
