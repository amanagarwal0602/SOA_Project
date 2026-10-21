package com.lumiere.soa;

import com.lumiere.soa.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Skill 9: Unit Testing for Payment Service
 * Uses JUnit 5 to test payment processing, card validation, and refunds.
 */
class PaymentServiceTest {

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService();
    }

    @Test
    @DisplayName("Process payment with valid details should succeed")
    void testProcessPayment_Success() {
        Map<String, Object> result = paymentService.processPayment(150.00, "card", "ORD-12345");

        assertNotNull(result);
        assertEquals("SUCCESS", result.get("status"));
        assertEquals(150.00, result.get("amount"));
        assertTrue(result.containsKey("transactionId"));
    }

    @Test
    @DisplayName("Process payment with zero or negative amount should throw IllegalArgumentException")
    void testProcessPayment_InvalidAmount_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            paymentService.processPayment(0, "card", "ORD-12345");
        });

        assertThrows(IllegalArgumentException.class, () -> {
            paymentService.processPayment(-25.50, "card", "ORD-12345");
        });
    }

    @Test
    @DisplayName("Validate card number length and amount")
    void testValidatePaymentDetails() {
        assertTrue(paymentService.validatePaymentDetails("card", "1234567890123456", 50.0));
        assertFalse(paymentService.validatePaymentDetails("card", "1234", 50.0));
        assertFalse(paymentService.validatePaymentDetails("card", "1234567890123456", -10.0));
    }

    @Test
    @DisplayName("Refund payment with valid transaction ID should return refunded status")
    void testRefundPayment_Success() {
        Map<String, Object> refund = paymentService.refundPayment("TXN-ABC12345", 75.00);

        assertNotNull(refund);
        assertEquals("REFUNDED", refund.get("status"));
        assertEquals(75.00, refund.get("refundAmount"));
        assertEquals("TXN-ABC12345", refund.get("originalTransactionId"));
    }
}
