package com.lumiere.order.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Dashboard analytics aggregation response.
 */
@Data
@Builder
public class DashboardAnalytics {
    private long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal averageOrderValue;
    private Map<String, Long> ordersByStatus;
    private Map<String, BigDecimal> revenueByDay;
    private long todayOrders;
    private BigDecimal todayRevenue;
}
