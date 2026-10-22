package com.lumiere.soa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    private String id;

    @Builder.Default
    @JsonProperty("table_type")
    private String tableType = "reservation";

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("guest_name")
    private String guestName;

    @JsonProperty("guest_email")
    private String guestEmail;

    @JsonProperty("guest_phone")
    private String guestPhone;

    @JsonProperty("number_of_guests")
    @Builder.Default
    private int numberOfGuests = 2;

    private String date;

    @JsonProperty("time_slot")
    private String timeSlot;

    @Column(length = 2000)
    @JsonProperty("special_requests")
    private String specialRequests;

    @Builder.Default
    private String status = "confirmed";

    @JsonProperty("table_number")
    @Builder.Default
    private int tableNumber = 1;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = "res_" + System.currentTimeMillis();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now().toString();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now().toString();
        }
    }

    @PreUpdate
    public void onPreUpdate() {
        updatedAt = LocalDateTime.now().toString();
    }

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id;
    }

    @JsonProperty("reservationNumber")
    public String getReservationNumber() {
        return id;
    }

    @JsonProperty("guestName")
    public String getGuestNameCamel() {
        return guestName;
    }

    @JsonProperty("name")
    public String getNameAlias() {
        return guestName;
    }

    @JsonProperty("guestEmail")
    public String getGuestEmailCamel() {
        return guestEmail;
    }

    @JsonProperty("userEmail")
    public String getUserEmailAlias() {
        return guestEmail;
    }

    @JsonProperty("email")
    public String getEmailAlias() {
        return guestEmail;
    }

    @JsonProperty("guestPhone")
    public String getGuestPhoneCamel() {
        return guestPhone;
    }

    @JsonProperty("phone")
    public String getPhoneAlias() {
        return guestPhone;
    }

    @JsonProperty("numberOfGuests")
    public int getNumberOfGuestsCamel() {
        return numberOfGuests;
    }

    @JsonProperty("guests")
    public int getGuestsAlias() {
        return numberOfGuests;
    }

    @JsonProperty("timeSlot")
    public String getTimeSlotCamel() {
        return timeSlot;
    }

    @JsonProperty("time")
    public String getTimeAlias() {
        return timeSlot;
    }

    @JsonProperty("specialRequests")
    public String getSpecialRequestsCamel() {
        return specialRequests;
    }

    @JsonProperty("tableNumber")
    public int getTableNumberCamel() {
        return tableNumber;
    }

    @JsonProperty("userId")
    public String getUserIdCamel() {
        return userId;
    }

    @JsonProperty("createdAt")
    public String getCreatedAtAlias() {
        return createdAt;
    }

    @JsonProperty("createdAt")
    public void setCreatedAtAlias(String val) {
        if (this.createdAt == null) {
            this.createdAt = val;
        }
    }

    @JsonProperty("updatedAt")
    public String getUpdatedAtAlias() {
        return updatedAt;
    }

    @JsonProperty("updatedAt")
    public void setUpdatedAtAlias(String val) {
        if (this.updatedAt == null) {
            this.updatedAt = val;
        }
    }

    @JsonProperty("timeSlot")
    public void setTimeSlotCamel(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    @JsonProperty("time")
    public void setTimeAlias(String time) {
        this.timeSlot = time;
    }
}
