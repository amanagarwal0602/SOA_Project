package com.lumiere.menu.repository;

import com.lumiere.menu.model.TodaysOffer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TodaysOfferRepository extends MongoRepository<TodaysOffer, String> {

    List<TodaysOffer> findByActiveTrue();

    List<TodaysOffer> findByMenuItemId(String menuItemId);
}
