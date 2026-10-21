package com.lumiere.soa.controller;

import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Skill 2: API Gateway for E-Commerce / Service Routing
 */
@RestController
@RequestMapping("/gateway")
@CrossOrigin(origins = "*")
public class GatewayController {

    private final DiscoveryClient discoveryClient;

    public GatewayController(DiscoveryClient discoveryClient) {
        this.discoveryClient = discoveryClient;
    }

    @GetMapping("/routes")
    public Map<String, Object> getRoutes() {
        Map<String, Object> routes = new HashMap<>();
        routes.put("services", discoveryClient != null ? discoveryClient.getServices() : "standalone");
        routes.put("status", "Gateway routing active");
        return routes;
    }

    @RequestMapping("/{service}/{endpoint}")
    public Map<String, Object> getService(@PathVariable String service,
                                          @PathVariable String endpoint) {
        Map<String, Object> response = new HashMap<>();
        response.put("service", service);
        response.put("endpoint", endpoint);
        response.put("message", "Routed through SOA API Gateway to " + service);
        return response;
    }
}
