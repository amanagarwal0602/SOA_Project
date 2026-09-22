package com.lumiere.order.service;

import com.lumiere.common.exception.*;
import com.lumiere.order.dto.CouponRequest;
import com.lumiere.order.model.Coupon;
import com.lumiere.order.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon createCoupon(CouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new ConflictException("Coupon code already exists: " + request.getCode());
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscount(request.getMaxDiscount())
                .usageLimit(request.getUsageLimit())
                .expiresAt(request.getExpiresAt() != null ? LocalDateTime.parse(request.getExpiresAt()) : null)
                .active(true)
                .build();

        coupon = couponRepository.save(coupon);
        log.info("Coupon created: {}", coupon.getCode());
        return coupon;
    }

    public Coupon updateCoupon(String id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));

        if (request.getDescription() != null) coupon.setDescription(request.getDescription());
        if (request.getDiscountType() != null) coupon.setDiscountType(request.getDiscountType());
        if (request.getDiscountValue() != null) coupon.setDiscountValue(request.getDiscountValue());
        if (request.getMinOrderAmount() != null) coupon.setMinOrderAmount(request.getMinOrderAmount());
        if (request.getMaxDiscount() != null) coupon.setMaxDiscount(request.getMaxDiscount());
        coupon.setUsageLimit(request.getUsageLimit());
        if (request.getExpiresAt() != null) coupon.setExpiresAt(LocalDateTime.parse(request.getExpiresAt()));

        coupon = couponRepository.save(coupon);
        return coupon;
    }

    public void deleteCoupon(String id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        couponRepository.delete(coupon);
        log.info("Coupon deleted: {}", coupon.getCode());
    }

    public Coupon toggleActive(String id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        coupon.setActive(!coupon.isActive());
        coupon = couponRepository.save(coupon);
        return coupon;
    }

    public Coupon validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new BadRequestException("Invalid coupon code"));

        if (!coupon.isActive()) throw new BadRequestException("Coupon is inactive");
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Coupon has expired");
        }
        if (coupon.getUsageLimit() > 0 && coupon.getUsageCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit reached");
        }
        return coupon;
    }
}
