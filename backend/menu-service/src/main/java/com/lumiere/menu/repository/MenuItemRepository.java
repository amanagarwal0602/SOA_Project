package com.lumiere.menu.repository;

import com.lumiere.menu.model.MenuItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MenuItemRepository extends MongoRepository<MenuItem, String> {

    List<MenuItem> findByCategory(String category);

    List<MenuItem> findByCategoryAndAvailableTrue(String category);

    List<MenuItem> findByAvailableTrue();

    List<MenuItem> findByShowOnHomepageTrue();

    List<MenuItem> findByVegTrue();

    List<MenuItem> findByNameContainingIgnoreCase(String name);

    List<MenuItem> findByIdIn(List<String> ids);

    List<MenuItem> findByCategoryIn(List<String> categories);
}
