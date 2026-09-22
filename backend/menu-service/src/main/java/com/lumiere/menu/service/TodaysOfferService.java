package com.lumiere.menu.service;

import com.lumiere.common.exception.ResourceNotFoundException;
import com.lumiere.menu.dto.TodaysOfferRequest;
import com.lumiere.menu.model.TodaysOffer;
import com.lumiere.menu.repository.TodaysOfferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TodaysOfferService {

    private final TodaysOfferRepository offerRepository;

    public List<TodaysOffer> getActiveOffers() {
        return offerRepository.findByActiveTrue();
    }

    public List<TodaysOffer> getAllOffers() {
        return offerRepository.findAll();
    }

    public TodaysOffer createOffer(TodaysOfferRequest request) {
        TodaysOffer offer = TodaysOffer.builder()
                .menuItemId(request.getMenuItemId())
                .title(request.getTitle())
                .description(request.getDescription())
                .image(request.getImage())
                .originalPrice(request.getOriginalPrice())
                .offerPrice(request.getOfferPrice())
                .discountPercent(request.getDiscountPercent())
                .startDate(request.getStartDate() != null ? LocalDateTime.parse(request.getStartDate()) : null)
                .endDate(request.getEndDate() != null ? LocalDateTime.parse(request.getEndDate()) : null)
                .active(true)
                .build();
        offer = offerRepository.save(offer);
        log.info("Offer created: {}", offer.getTitle());
        return offer;
    }

    public TodaysOffer updateOffer(String id, TodaysOfferRequest request) {
        TodaysOffer offer = findOrThrow(id);
        if (request.getTitle() != null) offer.setTitle(request.getTitle());
        if (request.getDescription() != null) offer.setDescription(request.getDescription());
        if (request.getImage() != null) offer.setImage(request.getImage());
        if (request.getOriginalPrice() != null) offer.setOriginalPrice(request.getOriginalPrice());
        if (request.getOfferPrice() != null) offer.setOfferPrice(request.getOfferPrice());
        if (request.getDiscountPercent() > 0) offer.setDiscountPercent(request.getDiscountPercent());
        if (request.getStartDate() != null) offer.setStartDate(LocalDateTime.parse(request.getStartDate()));
        if (request.getEndDate() != null) offer.setEndDate(LocalDateTime.parse(request.getEndDate()));
        offer = offerRepository.save(offer);
        log.info("Offer updated: {}", offer.getTitle());
        return offer;
    }

    public void deleteOffer(String id) {
        TodaysOffer offer = findOrThrow(id);
        offerRepository.delete(offer);
        log.info("Offer deleted: {}", offer.getTitle());
    }

    public TodaysOffer toggleActive(String id) {
        TodaysOffer offer = findOrThrow(id);
        offer.setActive(!offer.isActive());
        offer = offerRepository.save(offer);
        return offer;
    }

    private TodaysOffer findOrThrow(String id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TodaysOffer", "id", id));
    }
}
