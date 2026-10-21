package com.lumiere.soa.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Skill 9: Unit Testing for Payment Service
 */
@Service
public class PaymentService {

    public Map<String, Object> processPayment(double amount, String paymentMethod, String orderId) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new IllegalArgumentException("Payment method cannot be empty");
        }

        Map<String, Object> result = new HashMap<>();
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        result.put("transactionId", transactionId);
        result.put("orderId", orderId);
        result.put("amount", amount);
        result.put("paymentMethod", paymentMethod);
        result.put("status", "SUCCESS");
        result.put("message", "Payment processed successfully");
        return result;
    }

    public boolean validatePaymentDetails(String paymentMethod, String cardNumber, double amount) {
        if (amount <= 0) return false;
        if (paymentMethod == null) return false;

        if ("card".equalsIgnoreCase(paymentMethod) || "credit_card".equalsIgnoreCase(paymentMethod)) {
            return cardNumber != null && cardNumber.replaceAll("\\s+", "").length() >= 12;
        }
        return true;
    }

    public Map<String, Object> refundPayment(String transactionId, double amount) {
        if (transactionId == null || transactionId.isBlank()) {
            throw new IllegalArgumentException("Invalid transaction ID");
        }
        if (amount <= 0) {
            throw new IllegalArgumentException("Refund amount must be greater than zero");
        }

        Map<String, Object> refundResult = new HashMap<>();
        refundResult.put("refundId", "REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        refundResult.put("originalTransactionId", transactionId);
        refundResult.put("refundAmount", amount);
        refundResult.put("status", "REFUNDED");
        return refundResult;
    }
}
