package com.lumiere.menu.controller;

import com.lumiere.common.dto.ApiResponse;
import com.lumiere.menu.dto.*;
import com.lumiere.menu.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Menu item CRUD + CSV import/export endpoints.
 * GET /api/menu is public (gateway whitelist). Write operations require auth + permissions.
 */
@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    // ── GET /api/menu ────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isVeg) {

        List<MenuItemResponse> items;
        if (category != null || search != null || isVeg != null) {
            items = menuService.getFilteredMenuItems(category, search, isVeg);
        } else {
            items = menuService.getAllMenuItems();
        }
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    // ── GET /api/menu/{id} ───────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getMenuItem(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(menuService.getMenuItemById(id)));
    }

    // ── POST /api/menu ───────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAuthority('add_menu')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> createMenuItem(
            @Valid @RequestBody CreateMenuItemRequest request) {
        MenuItemResponse item = menuService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(item, "Menu item created"));
    }

    // ── PUT /api/menu/{id} ───────────────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('edit_menu')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateMenuItem(
            @PathVariable String id,
            @RequestBody UpdateMenuItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                menuService.updateMenuItem(id, request), "Menu item updated"));
    }

    // ── DELETE /api/menu/{id} ────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete_menu')")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable String id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Menu item deleted"));
    }

    // ── PATCH /api/menu/{id}/toggle ──────────────────────────────────────────

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('toggle_availability')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> toggleAvailability(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                menuService.toggleAvailability(id), "Availability toggled"));
    }

    // ── PATCH /api/menu/{id}/toggle-homepage ─────────────────────────────────

    @PatchMapping("/{id}/toggle-homepage")
    @PreAuthorize("hasAuthority('edit_menu')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> toggleHomepage(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                menuService.toggleHomepage(id), "Homepage visibility toggled"));
    }

    // ── GET /api/menu/categories ─────────────────────────────────────────────
    // Handled by CategoryController

    // ── POST /api/menu/import ────────────────────────────────────────────────

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('add_menu')")
    public ResponseEntity<ApiResponse<Integer>> importCsv(
            @RequestParam("file") MultipartFile file) throws IOException {
        int count = menuService.importCsv(file.getInputStream());
        return ResponseEntity.ok(ApiResponse.success(count, count + " items imported"));
    }

    // ── GET /api/menu/export ─────────────────────────────────────────────────

    @GetMapping(value = "/export", produces = "text/csv")
    @PreAuthorize("hasAuthority('export_csv')")
    public ResponseEntity<String> exportCsv() {
        String csv = menuService.exportCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=menu_export.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
