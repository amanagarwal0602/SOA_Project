package com.lumiere.soa.repository;

import com.lumiere.soa.model.Feature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeatureRepository extends JpaRepository<Feature, String> {
    List<Feature> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<Feature> findAllByOrderByDisplayOrderAsc();
}
