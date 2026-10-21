package com.lumiere.soa.controller;

import com.lumiere.soa.model.Feature;
import com.lumiere.soa.repository.FeatureRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class FeatureController {

    private final FeatureRepository featureRepository;

    public FeatureController(FeatureRepository featureRepository) {
        this.featureRepository = featureRepository;
    }

    @GetMapping({"/api/features", "/api/features/all"})
    public ResponseEntity<List<Feature>> getFeatures() {
        List<Feature> list = featureRepository.findAllByOrderByDisplayOrderAsc();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/api/features")
    public ResponseEntity<?> createFeature(@RequestBody Feature feature) {
        if (feature.getId() == null || feature.getId().isBlank()) {
            feature.setId("feature_" + System.currentTimeMillis());
        }
        Feature saved = featureRepository.save(feature);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PutMapping("/api/features/{id}")
    public ResponseEntity<?> updateFeature(@PathVariable String id, @RequestBody Feature updated) {
        Optional<Feature> opt = featureRepository.findById(id);
        if (opt.isEmpty()) {
            updated.setId(id);
            Feature saved = featureRepository.save(updated);
            return ResponseEntity.ok(Map.of("data", saved));
        }

        Feature existing = opt.get();
        if (updated.getTitle() != null) existing.setTitle(updated.getTitle());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getIcon() != null) existing.setIcon(updated.getIcon());
        existing.setActive(updated.isActive());

        Feature saved = featureRepository.save(existing);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @DeleteMapping("/api/features/{id}")
    public ResponseEntity<?> deleteFeature(@PathVariable String id) {
        featureRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("data", Map.of("id", id, "deleted", true)));
    }
}
