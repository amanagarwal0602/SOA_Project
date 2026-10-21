package com.lumiere.soa.controller;

import com.lumiere.soa.model.GalleryImage;
import com.lumiere.soa.repository.GalleryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/gallery")
@CrossOrigin(origins = "*")
public class GalleryController {

    private final GalleryRepository galleryRepository;

    public GalleryController(GalleryRepository galleryRepository) {
        this.galleryRepository = galleryRepository;
    }

    @GetMapping
    public ResponseEntity<?> getGallery(@RequestParam(required = false) String category) {
        List<GalleryImage> list;
        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            list = galleryRepository.findByCategoryIgnoreCase(category.trim());
        } else {
            list = galleryRepository.findAll();
        }
        return ResponseEntity.ok(Map.of("data", list));
    }

    @PostMapping
    public ResponseEntity<?> createGalleryImage(@RequestBody Map<String, Object> body) {
        String id = body.get("id") != null ? body.get("id").toString() : "gallery_" + System.currentTimeMillis();
        String url = (String) (body.get("image") != null ? body.get("image") : body.get("url"));
        String title = (String) body.get("title");
        String description = (String) body.get("description");
        String category = (String) body.getOrDefault("category", "food");

        boolean isFeatured = true;
        if (body.containsKey("isPublished")) isFeatured = Boolean.parseBoolean(body.get("isPublished").toString());
        else if (body.containsKey("isFeatured")) isFeatured = Boolean.parseBoolean(body.get("isFeatured").toString());
        else if (body.containsKey("is_featured")) isFeatured = Boolean.parseBoolean(body.get("is_featured").toString());

        GalleryImage image = GalleryImage.builder()
                .id(id)
                .url(url)
                .title(title)
                .description(description)
                .category(category)
                .isFeatured(isFeatured)
                .build();

        GalleryImage saved = galleryRepository.save(image);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGalleryImage(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Optional<GalleryImage> opt = galleryRepository.findById(id);
        GalleryImage existing;
        if (opt.isEmpty()) {
            existing = GalleryImage.builder().id(id).build();
        } else {
            existing = opt.get();
        }

        if (body.containsKey("image") || body.containsKey("url")) {
            existing.setUrl((String) body.getOrDefault("image", body.get("url")));
        }
        if (body.containsKey("title")) existing.setTitle((String) body.get("title"));
        if (body.containsKey("description")) existing.setDescription((String) body.get("description"));
        if (body.containsKey("category")) existing.setCategory((String) body.get("category"));

        if (body.containsKey("isPublished")) {
            existing.setFeatured(Boolean.parseBoolean(body.get("isPublished").toString()));
        } else if (body.containsKey("isFeatured")) {
            existing.setFeatured(Boolean.parseBoolean(body.get("isFeatured").toString()));
        }

        GalleryImage saved = galleryRepository.save(existing);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGalleryImage(@PathVariable String id) {
        galleryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("data", Map.of("id", id, "deleted", true)));
    }
}
