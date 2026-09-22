package com.lumiere.menu.controller;

import com.lumiere.common.dto.ApiResponse;
import com.lumiere.menu.dto.CategoryRequest;
import com.lumiere.menu.model.Category;
import com.lumiere.menu.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('add_menu')")
    public ResponseEntity<ApiResponse<Category>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        Category cat = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(cat, "Category created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('edit_menu')")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @PathVariable String id,
            @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                categoryService.updateCategory(id, request), "Category updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete_menu')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted"));
    }
}
