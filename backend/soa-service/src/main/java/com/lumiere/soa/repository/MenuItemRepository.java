package com.lumiere.soa.repository;

import com.lumiere.soa.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, String> {
    List<MenuItem> findByCategoryIgnoreCase(String category);
    List<MenuItem> findByShowOnHomepageTrue();
}
