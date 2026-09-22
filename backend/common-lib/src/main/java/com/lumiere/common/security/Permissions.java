package com.lumiere.common.security;

import java.util.List;

/**
 * Permission string constants — exact 1-to-1 mapping with client/src/utils/permissions.js.
 * DO NOT rename any constant string value without updating the frontend simultaneously.
 *
 * 42 permissions total across admin/chef/waiter/customer roles.
 */
public final class Permissions {

    // ── Dashboard ─────────────────────────────────────────────────────────────
    public static final String VIEW_DASHBOARD = "view_dashboard";
    public static final String VIEW_ANALYTICS = "view_analytics";

    // ── Orders ────────────────────────────────────────────────────────────────
    public static final String VIEW_ORDERS   = "view_orders";
    public static final String EDIT_ORDERS   = "edit_orders";
    public static final String DELETE_ORDERS = "delete_orders";

    // ── Menu ──────────────────────────────────────────────────────────────────
    public static final String VIEW_MENU           = "view_menu";
    public static final String ADD_MENU            = "add_menu";
    public static final String EDIT_MENU           = "edit_menu";
    public static final String DELETE_MENU         = "delete_menu";
    public static final String TOGGLE_AVAILABILITY = "toggle_availability";

    // ── Reservations ──────────────────────────────────────────────────────────
    public static final String VIEW_RESERVATIONS   = "view_reservations";
    public static final String EDIT_RESERVATIONS   = "edit_reservations";
    public static final String DELETE_RESERVATIONS = "delete_reservations";

    // ── Gallery ───────────────────────────────────────────────────────────────
    public static final String VIEW_GALLERY   = "view_gallery";
    public static final String ADD_GALLERY    = "add_gallery";
    public static final String EDIT_GALLERY   = "edit_gallery";
    public static final String DELETE_GALLERY = "delete_gallery";

    // ── Users ─────────────────────────────────────────────────────────────────
    public static final String VIEW_USERS   = "view_users";
    public static final String EDIT_USERS   = "edit_users";
    public static final String DELETE_USERS = "delete_users";
    public static final String MANAGE_ROLES = "manage_roles";

    // ── Coupons ───────────────────────────────────────────────────────────────
    public static final String VIEW_COUPONS   = "view_coupons";
    public static final String ADD_COUPONS    = "add_coupons";
    public static final String EDIT_COUPONS   = "edit_coupons";
    public static final String DELETE_COUPONS = "delete_coupons";

    // ── Reviews ───────────────────────────────────────────────────────────────
    public static final String VIEW_REVIEWS   = "view_reviews";
    public static final String EDIT_REVIEWS   = "edit_reviews";
    public static final String DELETE_REVIEWS = "delete_reviews";

    // ── CMS ───────────────────────────────────────────────────────────────────
    public static final String VIEW_CMS      = "view_cms";
    public static final String EDIT_HERO     = "edit_hero";
    public static final String EDIT_ABOUT    = "edit_about";
    public static final String EDIT_FEATURES = "edit_features";
    public static final String EDIT_TEAM     = "edit_team";
    // NOTE: frontend uses "edit_contact" (not "edit_contact_info") — do not change
    public static final String EDIT_CONTACT  = "edit_contact";
    // NOTE: frontend uses "edit_settings" (not "edit_site_settings") — do not change
    public static final String EDIT_SETTINGS = "edit_settings";
    public static final String EDIT_SEO      = "edit_seo";

    // ── Operations ────────────────────────────────────────────────────────────
    public static final String PRINT_BILL              = "print_bill";
    public static final String EXPORT_CSV              = "export_csv";
    public static final String MANAGE_ANNOUNCEMENTS    = "manage_announcements";
    public static final String MANAGE_MAINTENANCE      = "manage_maintenance";
    public static final String MANAGE_PRIVACY_POLICY   = "manage_privacy_policy";
    public static final String MANAGE_TERMS_OF_SERVICE = "manage_terms_of_service";
    public static final String TOGGLE_DARK_MODE        = "toggle_dark_mode";

    // ── Role permission sets ──────────────────────────────────────────────────

    public static final List<String> ADMIN_PERMISSIONS = List.of(
            VIEW_DASHBOARD, VIEW_ANALYTICS,
            VIEW_ORDERS, EDIT_ORDERS, DELETE_ORDERS,
            VIEW_MENU, ADD_MENU, EDIT_MENU, DELETE_MENU, TOGGLE_AVAILABILITY,
            VIEW_RESERVATIONS, EDIT_RESERVATIONS, DELETE_RESERVATIONS,
            VIEW_GALLERY, ADD_GALLERY, EDIT_GALLERY, DELETE_GALLERY,
            VIEW_USERS, EDIT_USERS, DELETE_USERS, MANAGE_ROLES,
            VIEW_COUPONS, ADD_COUPONS, EDIT_COUPONS, DELETE_COUPONS,
            VIEW_REVIEWS, EDIT_REVIEWS, DELETE_REVIEWS,
            VIEW_CMS, EDIT_HERO, EDIT_ABOUT, EDIT_FEATURES, EDIT_TEAM,
            EDIT_CONTACT, EDIT_SETTINGS, EDIT_SEO,
            PRINT_BILL, EXPORT_CSV,
            MANAGE_ANNOUNCEMENTS, MANAGE_MAINTENANCE,
            MANAGE_PRIVACY_POLICY, MANAGE_TERMS_OF_SERVICE,
            TOGGLE_DARK_MODE
    );

    /** Kitchen operations: view kitchen queue, update ticket status, view menu. */
    public static final List<String> CHEF_PERMISSIONS = List.of(
            VIEW_DASHBOARD, VIEW_ORDERS, EDIT_ORDERS,
            VIEW_MENU, TOGGLE_AVAILABILITY
    );

    /** Table service: take orders, manage reservations, basic customer ops. */
    public static final List<String> WAITER_PERMISSIONS = List.of(
            VIEW_DASHBOARD, VIEW_ORDERS, EDIT_ORDERS,
            VIEW_RESERVATIONS, EDIT_RESERVATIONS
    );

    /** Customer self-service portal access. */
    public static final List<String> CUSTOMER_PERMISSIONS = List.of(
            VIEW_DASHBOARD, VIEW_ORDERS, VIEW_MENU, VIEW_RESERVATIONS
    );

    private Permissions() { /* no instances */ }
}
