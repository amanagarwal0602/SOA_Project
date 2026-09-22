package com.lumiere.common.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Paginated response wrapper used by list endpoints.
 */
@Data
@Builder
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
    private boolean first;
}
