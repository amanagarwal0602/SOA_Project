package com.lumiere.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Field-level validation error detail, included in ApiResponse.errors[].
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ErrorDetail {
    private String field;
    private String message;
    private Object rejectedValue;
}
