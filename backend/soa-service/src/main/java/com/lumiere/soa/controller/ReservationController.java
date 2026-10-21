package com.lumiere.soa.controller;

import com.lumiere.soa.model.Reservation;
import com.lumiere.soa.repository.ReservationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class ReservationController {

    private final ReservationRepository reservationRepository;

    public ReservationController(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @GetMapping({"/api/reservations", "/api/admin/reservations"})
    public ResponseEntity<?> getReservations(@RequestParam(required = false) String userId) {
        List<Reservation> list;
        if (userId != null && !userId.isBlank()) {
            list = reservationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
            list = reservationRepository.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(Map.of("data", list));
    }

    @PostMapping("/api/reservations")
    public ResponseEntity<?> createReservation(@RequestBody Map<String, Object> data) {
        int guests = 2;
        if (data.get("numberOfGuests") != null) {
            guests = Integer.parseInt(data.get("numberOfGuests").toString());
        } else if (data.get("number_of_guests") != null) {
            guests = Integer.parseInt(data.get("number_of_guests").toString());
        } else if (data.get("guests") != null) {
            guests = Integer.parseInt(data.get("guests").toString());
        }

        String userId = (String) (data.get("userId") != null ? data.get("userId") : data.get("user_id"));
        String guestName = (String) (data.get("guestName") != null ? data.get("guestName") :
                (data.get("guest_name") != null ? data.get("guest_name") : data.get("name")));
        String guestEmail = (String) (data.get("guestEmail") != null ? data.get("guestEmail") :
                (data.get("guest_email") != null ? data.get("guest_email") :
                (data.get("userEmail") != null ? data.get("userEmail") : data.get("email"))));
        String guestPhone = (String) (data.get("guestPhone") != null ? data.get("guestPhone") :
                (data.get("guest_phone") != null ? data.get("guest_phone") :
                (data.get("userPhone") != null ? data.get("userPhone") : data.get("phone"))));
        String timeSlot = (String) (data.get("timeSlot") != null ? data.get("timeSlot") :
                (data.get("time_slot") != null ? data.get("time_slot") : data.get("time")));
        String specialRequests = (String) (data.get("specialRequests") != null ? data.get("specialRequests") :
                (data.get("special_requests") != null ? data.get("special_requests") : data.get("notes")));

        Reservation res = Reservation.builder()
                .id("res_" + System.currentTimeMillis())
                .userId(userId)
                .guestName(guestName)
                .guestEmail(guestEmail)
                .guestPhone(guestPhone)
                .numberOfGuests(guests)
                .date((String) data.get("date"))
                .timeSlot(timeSlot)
                .specialRequests(specialRequests)
                .status((String) data.getOrDefault("status", "confirmed"))
                .build();

        Reservation saved = reservationRepository.save(res);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @PutMapping({"/api/reservations/{id}", "/api/reservations/{id}/status", "/api/admin/reservations/{id}/status"})
    public ResponseEntity<?> updateReservation(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        Optional<Reservation> resOpt = reservationRepository.findById(id);
        if (resOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Reservation res = resOpt.get();
        if (updates.containsKey("status")) {
            res.setStatus((String) updates.get("status"));
        }
        if (updates.containsKey("table_number") || updates.containsKey("tableNumber")) {
            Object t = updates.containsKey("table_number") ? updates.get("table_number") : updates.get("tableNumber");
            res.setTableNumber(Integer.parseInt(t.toString()));
        }

        Reservation saved = reservationRepository.save(res);
        return ResponseEntity.ok(Map.of("data", saved));
    }

    @DeleteMapping("/api/reservations/{id}")
    public ResponseEntity<?> deleteReservation(@PathVariable String id) {
        reservationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("data", Map.of("id", id, "deleted", true)));
    }
}
