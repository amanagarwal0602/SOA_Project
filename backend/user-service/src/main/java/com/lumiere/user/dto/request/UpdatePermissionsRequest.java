package com.lumiere.user.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class UpdatePermissionsRequest {
    private List<String> permissions;
}
