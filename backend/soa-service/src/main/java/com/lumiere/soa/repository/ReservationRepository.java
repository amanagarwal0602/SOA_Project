package com.lumiere.soa.repository;

import com.lumiere.soa.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {
    List<Reservation> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Reservation> findAllByOrderByCreatedAtDesc();
}
