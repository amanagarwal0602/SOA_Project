package com.lumiere.menu.controller;

import com.lumiere.common.dto.ApiResponse;
import com.lumiere.menu.dto.TodaysOfferRequest;
import com.lumiere.menu.model.TodaysOffer;
import com.lumiere.menu.service.TodaysOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todays-offers")
@RequiredArgsConstructor
public class TodaysOfferController {

    private final TodaysOfferService offerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TodaysOffer>>> getOffers() {
        return ResponseEntity.ok(ApiResponse.success(offerService.getActiveOffers()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('edit_menu')")
    public ResponseEntity<ApiResponse<TodaysOffer>> createOffer(
            @RequestBody TodaysOfferRequest request) {
        TodaysOffer offer = offerService.createOffer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(offer, "Offer created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('edit_menu')")
    public ResponseEntity<ApiResponse<TodaysOffer>> updateOffer(
            @PathVariable String id,
            @RequestBody TodaysOfferRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                offerService.updateOffer(id, request), "Offer updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('delete_menu')")
    public ResponseEntity<ApiResponse<Void>> deleteOffer(@PathVariable String id) {
        offerService.deleteOffer(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Offer deleted"));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('edit_menu')")
    public ResponseEntity<ApiResponse<TodaysOffer>> toggleActive(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                offerService.toggleActive(id), "Offer toggled"));
    }
}
