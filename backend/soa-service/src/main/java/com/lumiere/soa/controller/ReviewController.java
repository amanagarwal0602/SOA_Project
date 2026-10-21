package com.lumiere.soa.controller;

import com.lumiere.soa.model.Review;
import com.lumiere.soa.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/api/reviews")
    public ResponseEntity<?> getPublicReviews() {
        List<Review> reviews = reviewRepository.findByIsPublishedTrueOrderByCreatedAtDesc();
        return ResponseEntity.ok(Map.of("data", Map.of("reviews", reviews)));
    }

    @GetMapping("/api/admin/reviews")
    public ResponseEntity<?> getAdminReviews() {
        List<Review> reviews = reviewRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(Map.of("data", reviews));
    }

    @PostMapping("/api/reviews")
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> body) {
        String id = body.get("id") != null ? body.get("id").toString() : "review_" + System.currentTimeMillis();
        String menuItemId = (String) (body.get("menuItem") != null ? body.get("menuItem") :
                (body.get("menu_item_id") != null ? body.get("menu_item_id") : body.get("menuItemId")));
        String orderId = (String) (body.get("order") != null ? body.get("order") :
                (body.get("order_id") != null ? body.get("order_id") : body.get("orderId")));
        String title = (String) body.get("title");
        String comment = (String) (body.get("comment") != null ? body.get("comment") : body.get("review"));

        int rating = 5;
        if (body.get("rating") != null) {
            rating = Integer.parseInt(body.get("rating").toString());
        }

        String userId = (String) (body.get("userId") != null ? body.get("userId") : body.get("user_id"));
        String userName = (String) (body.get("userName") != null ? body.get("userName") : body.get("user_name"));
        if (userName == null || userName.isBlank()) {
            userName = "Customer";
        }

        Review review = Review.builder()
                .id(id)
                .menuItemId(menuItemId)
                .orderId(orderId)
                .title(title)
                .comment(comment)
                .rating(rating)
                .userId(userId)
                .userName(userName)
                .isPublished(true)
                .showOnHomepage(true)
                .build();

        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PutMapping("/api/reviews/{id}")
    public ResponseEntity<?> updateReview(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Optional<Review> existingOpt = reviewRepository.findById(id);
        Review existing;
        if (existingOpt.isEmpty()) {
            existing = Review.builder().id(id).build();
        } else {
            existing = existingOpt.get();
        }

        if (body.get("rating") != null) existing.setRating(Integer.parseInt(body.get("rating").toString()));
        if (body.get("comment") != null) existing.setComment((String) body.get("comment"));
        if (body.get("title") != null) existing.setTitle((String) body.get("title"));
        if (body.get("response") != null) existing.setResponse((String) body.get("response"));

        if (body.containsKey("isPublished")) {
            existing.setPublished(Boolean.parseBoolean(body.get("isPublished").toString()));
        } else if (body.containsKey("is_published")) {
            existing.setPublished(Boolean.parseBoolean(body.get("is_published").toString()));
        }

        if (body.containsKey("showOnHomepage")) {
            existing.setShowOnHomepage(Boolean.parseBoolean(body.get("showOnHomepage").toString()));
        } else if (body.containsKey("show_on_homepage")) {
            existing.setShowOnHomepage(Boolean.parseBoolean(body.get("show_on_homepage").toString()));
        }

        Review saved = reviewRepository.save(existing);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PutMapping("/api/reviews/{id}/toggle-homepage")
    public ResponseEntity<?> toggleHomepage(@PathVariable String id) {
        Optional<Review> revOpt = reviewRepository.findById(id);
        if (revOpt.isPresent()) {
            Review r = revOpt.get();
            r.setShowOnHomepage(!r.isShowOnHomepage());
            Review saved = reviewRepository.save(r);
            return ResponseEntity.ok(Map.of("data", saved));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/api/reviews/{id}/respond")
    public ResponseEntity<?> respondReview(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<Review> revOpt = reviewRepository.findById(id);
        if (revOpt.isPresent()) {
            Review r = revOpt.get();
            r.setResponse(body.get("response"));
            Review saved = reviewRepository.save(r);
            return ResponseEntity.ok(Map.of("data", saved));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/api/admin/reviews/{id}/toggle-publish")
    public ResponseEntity<?> togglePublish(@PathVariable String id) {
        Optional<Review> revOpt = reviewRepository.findById(id);
        if (revOpt.isPresent()) {
            Review r = revOpt.get();
            r.setPublished(!r.isPublished());
            Review saved = reviewRepository.save(r);
            return ResponseEntity.ok(Map.of("data", saved));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/api/reviews/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable String id) {
        reviewRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("data", Map.of("id", id, "deleted", true)));
    }
}
