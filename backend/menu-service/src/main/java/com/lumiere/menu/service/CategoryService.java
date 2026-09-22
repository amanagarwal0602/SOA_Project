package com.lumiere.menu.service;

import com.lumiere.common.exception.ConflictException;
import com.lumiere.common.exception.ResourceNotFoundException;
import com.lumiere.menu.dto.CategoryRequest;
import com.lumiere.menu.model.Category;
import com.lumiere.menu.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll(Sort.by("displayOrder"));
    }

    public Category createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Category already exists: " + request.getName());
        }
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .image(request.getImage())
                .displayOrder(request.getDisplayOrder())
                .build();
        category = categoryRepository.save(category);
        log.info("Category created: {}", category.getName());
        return category;
    }

    public Category updateCategory(String id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (request.getName() != null) category.setName(request.getName());
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getImage() != null) category.setImage(request.getImage());
        category.setDisplayOrder(request.getDisplayOrder());

        category = categoryRepository.save(category);
        log.info("Category updated: {}", category.getName());
        return category;
    }

    public void deleteCategory(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
        log.info("Category deleted: {}", category.getName());
    }
}
