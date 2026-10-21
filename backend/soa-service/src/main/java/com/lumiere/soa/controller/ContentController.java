package com.lumiere.soa.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lumiere.soa.model.CafeContent;
import com.lumiere.soa.model.ContactMessage;
import com.lumiere.soa.repository.CafeContentRepository;
import com.lumiere.soa.repository.ContactMessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class ContentController {

    private final CafeContentRepository cafeContentRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final ObjectMapper objectMapper;

    public ContentController(CafeContentRepository cafeContentRepository,
                             ContactMessageRepository contactMessageRepository,
                             ObjectMapper objectMapper) {
        this.cafeContentRepository = cafeContentRepository;
        this.contactMessageRepository = contactMessageRepository;
        this.objectMapper = objectMapper;
    }

    private Map<String, Object> getContent(String key, Map<String, Object> defaultMap) {
        Optional<CafeContent> opt = cafeContentRepository.findById(key);
        if (opt.isPresent() && opt.get().getContentJson() != null && !opt.get().getContentJson().isBlank()) {
            try {
                return objectMapper.readValue(opt.get().getContentJson(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception ignored) {}
        }
        return defaultMap;
    }

    private void saveContent(String key, Map<String, Object> map) {
        try {
            String json = objectMapper.writeValueAsString(map);
            CafeContent content = CafeContent.builder()
                    .contentKey(key)
                    .contentJson(json)
                    .build();
            cafeContentRepository.save(content);
        } catch (Exception ignored) {}
    }

    // --- Health Check for GCP Cloud Run / Load Balancer ---

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "soa-service",
                "timestamp", System.currentTimeMillis()
        ));
    }

    // --- Hero ---

    @GetMapping("/api/hero")
    public ResponseEntity<Map<String, Object>> getHero() {
        Map<String, Object> defaults = new HashMap<>();
        defaults.put("title", "Authentic Culinary Experience");
        defaults.put("subtitle", "Artisanal Coffee & Gourmet Bistro");
        defaults.put("description", "Handcrafted delights made with passion, fresh local ingredients, and timeless European recipes.");
        defaults.put("ctaText", "Explore Menu");
        defaults.put("primaryButtonText", "Explore Menu");
        defaults.put("ctaLink", "/menu");
        defaults.put("primaryButtonLink", "/menu");
        defaults.put("secondaryCtaText", "Book a Table");
        defaults.put("secondaryButtonText", "Book a Table");
        defaults.put("secondaryCtaLink", "/reservations");
        defaults.put("secondaryButtonLink", "/reservations");
        defaults.put("backgroundImage", "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600");
        defaults.put("isActive", true);
        return ResponseEntity.ok(getContent("hero", defaults));
    }

    @PutMapping("/api/hero")
    public ResponseEntity<?> updateHero(@RequestBody Map<String, Object> data) {
        saveContent("hero", data);
        return ResponseEntity.ok(Map.of("data", data));
    }

    // --- About ---

    @GetMapping("/api/about")
    public ResponseEntity<Map<String, Object>> getAbout() {
        Map<String, Object> defaults = new HashMap<>();
        defaults.put("title", "Our Story & Tradition");
        defaults.put("heading", "Where Passion Meets Flavor");
        defaults.put("description", "Founded with a mission to bring world-class dining into a cozy neighborhood cafe ambiance. From signature brews to artisanal delicacies, every dish tells a story.");
        defaults.put("story", "Founded with a mission to bring world-class dining into a cozy neighborhood cafe ambiance. From signature brews to artisanal delicacies, every dish tells a story.");
        defaults.put("content", "Founded with a mission to bring world-class dining into a cozy neighborhood cafe ambiance. From signature brews to artisanal delicacies, every dish tells a story.\n\nEvery day our master baristas roast single-origin beans and our patissiers craft delicate European pastries with zero compromises on quality.");
        defaults.put("mission", "To craft unforgettable dining moments through exceptional food, sustainable sourcing, and genuine hospitality.");
        defaults.put("experienceYears", "15+ Years");
        defaults.put("happyCustomers", "50,000+");
        defaults.put("menuItemsCount", "100+");
        defaults.put("image", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800");
        return ResponseEntity.ok(getContent("about", defaults));
    }

    @PutMapping("/api/about")
    public ResponseEntity<?> updateAbout(@RequestBody Map<String, Object> data) {
        saveContent("about", data);
        return ResponseEntity.ok(Map.of("data", data));
    }

    // --- Contact Info ---

    @GetMapping("/api/contact-info")
    public ResponseEntity<Map<String, Object>> getContactInfo() {
        Map<String, Object> defaults = new HashMap<>();
        defaults.put("cafeName", "Lumière Café & Bistro");
        defaults.put("addressStreet", "123 Gourmet Boulevard, Bandra West");
        defaults.put("addressCity", "Mumbai");
        defaults.put("addressState", "Maharashtra");
        defaults.put("addressZipcode", "400050");
        defaults.put("addressCountry", "India");
        defaults.put("phone", "+91 98765 43210");
        defaults.put("email", "contact@lumierecafe.com");

        Map<String, String> defaultHours = new LinkedHashMap<>();
        defaultHours.put("monday", "8:00 AM – 11:00 PM");
        defaultHours.put("tuesday", "8:00 AM – 11:00 PM");
        defaultHours.put("wednesday", "8:00 AM – 11:00 PM");
        defaultHours.put("thursday", "8:00 AM – 11:00 PM");
        defaultHours.put("friday", "8:00 AM – 11:00 PM");
        defaultHours.put("saturday", "8:00 AM – 11:00 PM");
        defaultHours.put("sunday", "8:00 AM – 11:00 PM");

        defaults.put("openingHours", defaultHours);
        defaults.put("hours", defaultHours);
        defaults.put("socialInstagram", "https://instagram.com/lumierecafe");
        defaults.put("socialFacebook", "https://facebook.com/lumierecafe");
        defaults.put("socialTwitter", "https://twitter.com/lumierecafe");

        Map<String, String> socialMedia = new HashMap<>();
        socialMedia.put("facebook", "https://facebook.com/lumierecafe");
        socialMedia.put("instagram", "https://instagram.com/lumierecafe");
        socialMedia.put("twitter", "https://twitter.com/lumierecafe");
        defaults.put("socialMedia", socialMedia);

        return ResponseEntity.ok(getContent("contact_info", defaults));
    }

    @PutMapping("/api/contact-info")
    public ResponseEntity<?> updateContactInfo(@RequestBody Map<String, Object> data) {
        saveContent("contact_info", data);
        return ResponseEntity.ok(Map.of("data", data));
    }

    // --- Contact Messages ---

    @PostMapping("/api/contact-info/send-message")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> data) {
        ContactMessage msg = ContactMessage.builder()
                .id("msg_" + System.currentTimeMillis())
                .name((String) data.get("name"))
                .email((String) data.get("email"))
                .phone((String) data.get("phone"))
                .subject((String) data.get("subject"))
                .message((String) data.get("message"))
                .isRead(false)
                .build();
        ContactMessage saved = contactMessageRepository.save(msg);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", saved);
        res.put("message", "Thank you for your message! We will get back to you soon.");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/api/contact-info/messages")
    public ResponseEntity<?> getContactMessages() {
        List<ContactMessage> messages = contactMessageRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(Map.of("data", Map.of("messages", messages)));
    }

    @PutMapping("/api/contact-info/messages/{id}")
    public ResponseEntity<?> updateMessageStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Optional<ContactMessage> msgOpt = contactMessageRepository.findById(id);
        if (msgOpt.isPresent()) {
            ContactMessage msg = msgOpt.get();
            if (body.containsKey("isRead") || body.containsKey("is_read")) {
                boolean read = Boolean.TRUE.equals(body.get("isRead")) || Boolean.TRUE.equals(body.get("is_read"));
                msg.setRead(read);
            }
            ContactMessage saved = contactMessageRepository.save(msg);
            return ResponseEntity.ok(Map.of("data", saved));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/api/contact-info/messages/{id}")
    public ResponseEntity<?> deleteContactMessage(@PathVariable String id) {
        contactMessageRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("data", Map.of("id", id, "deleted", true)));
    }

    // --- Site Settings ---

    @GetMapping("/api/site-settings")
    public ResponseEntity<Map<String, Object>> getSiteSettings() {
        Map<String, Object> defaults = new HashMap<>();
        defaults.put("siteName", "Lumière Café");
        defaults.put("logo", "");
        defaults.put("favicon", "");
        defaults.put("primaryColor", "#e0533c");
        defaults.put("secondaryColor", "#2c3e50");
        defaults.put("accentColor", "#f39c12");
        defaults.put("maintenanceMode", Map.of("enabled", false, "message", ""));

        Map<String, Object> announcement = new HashMap<>();
        announcement.put("enabled", true);
        announcement.put("message", "Welcome to Lumière Café! 15% off your first online order with code WELCOME10");
        announcement.put("text", "Welcome to Lumière Café! 15% off your first online order with code WELCOME10");
        announcement.put("backgroundColor", "#3b82f6");
        announcement.put("textColor", "#ffffff");
        defaults.put("announcementBar", announcement);

        return ResponseEntity.ok(getContent("site_settings", defaults));
    }

    @PutMapping("/api/site-settings")
    public ResponseEntity<?> updateSiteSettings(@RequestBody Map<String, Object> data) {
        saveContent("site_settings", data);
        return ResponseEntity.ok(Map.of("data", data));
    }

    // --- SEO ---

    @GetMapping({"/api/seo", "/seo", "/api/seo/{page}", "/seo/{page}"})
    public ResponseEntity<Map<String, Object>> getSeo(@PathVariable(required = false) String page) {
        String key = (page != null && !page.isBlank()) ? "seo_" + page.toLowerCase() : "seo";
        Map<String, Object> defaults = new HashMap<>();
        String pageName = (page != null && !page.isBlank()) ? page.substring(0, 1).toUpperCase() + page.substring(1) : "Home";
        defaults.put("title", "Lumière Café — " + pageName);
        defaults.put("description", "Experience artisanal coffee, gourmet bistro dishes, and delightful ambiance at Lumière Café.");
        defaults.put("keywords", List.of("cafe", "bistro", "food delivery", "coffee", "gourmet", pageName.toLowerCase()));
        return ResponseEntity.ok(getContent(key, defaults));
    }

    @PutMapping({"/api/seo", "/seo", "/api/seo/{page}", "/seo/{page}"})
    public ResponseEntity<?> updateSeo(@PathVariable(required = false) String page, @RequestBody Map<String, Object> data) {
        String key = (page != null && !page.isBlank()) ? "seo_" + page.toLowerCase() : "seo";
        saveContent(key, data);
        return ResponseEntity.ok(Map.of("data", data));
    }

    // --- Navigation & Social Links (for EditModal) ---

    @GetMapping("/api/navigation")
    public ResponseEntity<?> getNavigation() {
        Map<String, Object> defaults = new HashMap<>();
        defaults.put("links", List.of(
                Map.of("name", "Home", "path", "/"),
                Map.of("name", "Menu", "path", "/menu"),
                Map.of("name", "About", "path", "/about"),
                Map.of("name", "Gallery", "path", "/gallery"),
                Map.of("name", "Contact", "path", "/contact"),
                Map.of("name", "Reserve", "path", "/reservations")
        ));
        return ResponseEntity.ok(getContent("navigation", defaults));
    }

    @PutMapping("/api/navigation")
    public ResponseEntity<?> updateNavigation(@RequestBody Map<String, Object> data) {
        saveContent("navigation", data);
        return ResponseEntity.ok(Map.of("data", data));
    }

    @GetMapping("/api/social-links")
    public ResponseEntity<?> getSocialLinks() {
        Map<String, Object> defaults = new HashMap<>();
        defaults.put("facebook", "https://facebook.com/lumierecafe");
        defaults.put("instagram", "https://instagram.com/lumierecafe");
        defaults.put("twitter", "https://twitter.com/lumierecafe");
        return ResponseEntity.ok(getContent("social_links", defaults));
    }

    @PutMapping("/api/social-links")
    public ResponseEntity<?> updateSocialLinks(@RequestBody Map<String, Object> data) {
        saveContent("social_links", data);
        return ResponseEntity.ok(Map.of("data", data));
    }

    // --- Skill 1: Food Delivery Restaurant info ---

    @GetMapping({"/api/restaurant", "/restaurant"})
    public ResponseEntity<?> getRestaurantInfo() {
        Map<String, Object> restaurant = new HashMap<>();
        restaurant.put("id", "rest_001");
        restaurant.put("name", "Lumière Café & Restaurant");
        restaurant.put("cuisine", "Continental & Italian");
        restaurant.put("rating", 4.8);
        restaurant.put("address", "123 Gourmet Boulevard, Mumbai, India");
        restaurant.put("isOpen", true);
        return ResponseEntity.ok(restaurant);
    }
}
