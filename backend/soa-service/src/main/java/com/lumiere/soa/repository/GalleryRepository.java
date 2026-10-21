package com.lumiere.soa.repository;

import com.lumiere.soa.model.GalleryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryRepository extends JpaRepository<GalleryImage, String> {
    List<GalleryImage> findByCategoryIgnoreCase(String category);
}
