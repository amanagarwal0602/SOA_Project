package com.lumiere.order.repository;

import com.lumiere.order.model.KitchenTicket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface KitchenTicketRepository extends MongoRepository<KitchenTicket, String> {

    List<KitchenTicket> findByOrderId(String orderId);

    List<KitchenTicket> findByStatusIn(List<String> statuses);

    List<KitchenTicket> findByPrepStation(String prepStation);

    List<KitchenTicket> findByPrepStationAndStatusIn(String prepStation, List<String> statuses);
}
