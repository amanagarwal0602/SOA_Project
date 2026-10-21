package com.lumiere.soa.repository;

import com.lumiere.soa.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByIsPublishedTrueOrderByCreatedAtDesc();
    List<Review> findByShowOnHomepageTrueAndIsPublishedTrue();
    List<Review> findAllByOrderByCreatedAtDesc();
}
