package com.lumiere.soa.controller;

import com.lumiere.soa.model.Coupon;
import com.lumiere.soa.repository.CouponRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "*")
public class CouponController {

    private final CouponRepository couponRepository;

    public CouponController(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @GetMapping
    public ResponseEntity<?> getCoupons() {
        List<Coupon> list = couponRepository.findAll();
        return ResponseEntity.ok(Map.of("data", list));
    }

    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        String id = body.get("id") != null ? body.get("id").toString() : "coupon_" + System.currentTimeMillis();
        String description = (String) body.get("description");

        String discountType = (String) (body.get("discountType") != null ? body.get("discountType") : body.getOrDefault("discount_type", "percentage"));
        double discountValue = 10.0;
        if (body.get("discountValue") != null) {
            discountValue = Double.parseDouble(body.get("discountValue").toString());
        } else if (body.get("discount_value") != null) {
            discountValue = Double.parseDouble(body.get("discount_value").toString());
        }

        double minOrderValue = 0.0;
        if (body.get("minOrderAmount") != null) {
            minOrderValue = Double.parseDouble(body.get("minOrderAmount").toString());
        } else if (body.get("min_order_value") != null) {
            minOrderValue = Double.parseDouble(body.get("min_order_value").toString());
        }

        double maxDiscount = 100.0;
        if (body.get("maxDiscountAmount") != null) {
            maxDiscount = Double.parseDouble(body.get("maxDiscountAmount").toString());
        } else if (body.get("max_discount") != null) {
            maxDiscount = Double.parseDouble(body.get("max_discount").toString());
        }

        boolean isActive = true;
        if (body.containsKey("isActive")) {
            isActive = Boolean.parseBoolean(body.get("isActive").toString());
        } else if (body.containsKey("is_active")) {
            isActive = Boolean.parseBoolean(body.get("is_active").toString());
        }

        Coupon coupon = Coupon.builder()
                .id(id)
                .code(code)
                .description(description)
                .discountType(discountType)
                .discountValue(discountValue)
                .minOrderValue(minOrderValue)
                .maxDiscount(maxDiscount)
                .validFrom((String) body.get("validFrom"))
                .validUntil((String) body.get("validUntil"))
                .isActive(isActive)
                .build();

        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Coupon code required"));
        }

        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(code.trim());
        if (couponOpt.isEmpty() || !couponOpt.get().isActive()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid or inactive coupon code"));
        }

        return ResponseEntity.ok(Map.of("data", couponOpt.get(), "success", true));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Optional<Coupon> existingOpt = couponRepository.findById(id);
        Coupon existing;
        if (existingOpt.isEmpty()) {
            existing = Coupon.builder().id(id).build();
        } else {
            existing = existingOpt.get();
        }

        if (body.containsKey("code")) existing.setCode((String) body.get("code"));
        if (body.containsKey("description")) existing.setDescription((String) body.get("description"));

        if (body.containsKey("discountType") || body.containsKey("discount_type")) {
            existing.setDiscountType((String) body.getOrDefault("discountType", body.get("discount_type")));
        }
        if (body.containsKey("discountValue")) {
            existing.setDiscountValue(Double.parseDouble(body.get("discountValue").toString()));
        } else if (body.containsKey("discount_value")) {
            existing.setDiscountValue(Double.parseDouble(body.get("discount_value").toString()));
        }
        if (body.containsKey("minOrderAmount")) {
            existing.setMinOrderValue(Double.parseDouble(body.get("minOrderAmount").toString()));
        } else if (body.containsKey("min_order_value")) {
            existing.setMinOrderValue(Double.parseDouble(body.get("min_order_value").toString()));
        }
        if (body.containsKey("maxDiscountAmount")) {
            existing.setMaxDiscount(Double.parseDouble(body.get("maxDiscountAmount").toString()));
        } else if (body.containsKey("max_discount")) {
            existing.setMaxDiscount(Double.parseDouble(body.get("max_discount").toString()));
        }
        if (body.containsKey("isActive")) {
            existing.setActive(Boolean.parseBoolean(body.get("isActive").toString()));
        } else if (body.containsKey("is_active")) {
            existing.setActive(Boolean.parseBoolean(body.get("is_active").toString()));
        }

        Coupon saved = couponRepository.save(existing);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggleCoupon(@PathVariable String id) {
        Optional<Coupon> couponOpt = couponRepository.findById(id);
        if (couponOpt.isPresent()) {
            Coupon coupon = couponOpt.get();
            coupon.setActive(!coupon.isActive());
            Coupon saved = couponRepository.save(coupon);
            return ResponseEntity.ok(Map.of("data", saved));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable String id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("data", Map.of("id", id, "deleted", true)));
    }
}
