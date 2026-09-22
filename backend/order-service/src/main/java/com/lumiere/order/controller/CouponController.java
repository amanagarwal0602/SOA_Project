package com.lumiere.order.controller;

import com.lumiere.common.dto.ApiResponse;
import com.lumiere.order.dto.CouponRequest;
import com.lumiere.order.model.Coupon;
import com.lumiere.order.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    @PreAuthorize("hasAuthority('view_coupons')")
    public ResponseEntity<ApiResponse<List<Coupon>>> getCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('add_coupons')")
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(
            @Valid @RequestBody CouponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(couponService.createCoupon(request), "Coupon created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('edit_coupons')")
    public ResponseEntity<ApiResponse<Coupon>> updateCoupon(
            @PathVariable String id,
            @RequestBody CouponRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                couponService.updateCoupon(id, request), "Coupon updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete_coupons')")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable String id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Coupon deleted"));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('edit_coupons')")
    public ResponseEntity<ApiResponse<Coupon>> toggleActive(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                couponService.toggleActive(id), "Coupon toggled"));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Coupon>> validateCoupon(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        return ResponseEntity.ok(ApiResponse.success(couponService.validateCoupon(code)));
    }
}
