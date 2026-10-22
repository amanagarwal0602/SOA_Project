package com.lumiere.soa.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lumiere.soa.model.*;
import com.lumiere.soa.repository.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Live Relational Database Inspector & Faculty Assessment Portal
 * Provides a read-only, real-time database table viewer for faculty evaluation.
 * Displays all JPA entities, BCrypt password hashes, roles, menu items, orders, etc.
 */
@RestController
@CrossOrigin(origins = "*")
public class DatabaseViewerController {

    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;
    private final ReservationRepository reservationRepository;
    private final ReviewRepository reviewRepository;
    private final CouponRepository couponRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final GalleryRepository galleryRepository;
    private final FeatureRepository featureRepository;
    private final TeamRepository teamRepository;
    private final BookRepository bookRepository;
    private final ObjectMapper objectMapper;

    public DatabaseViewerController(UserRepository userRepository,
                                    MenuItemRepository menuItemRepository,
                                    OrderRepository orderRepository,
                                    ReservationRepository reservationRepository,
                                    ReviewRepository reviewRepository,
                                    CouponRepository couponRepository,
                                    ContactMessageRepository contactMessageRepository,
                                    GalleryRepository galleryRepository,
                                    FeatureRepository featureRepository,
                                    TeamRepository teamRepository,
                                    BookRepository bookRepository,
                                    ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
        this.orderRepository = orderRepository;
        this.reservationRepository = reservationRepository;
        this.reviewRepository = reviewRepository;
        this.couponRepository = couponRepository;
        this.contactMessageRepository = contactMessageRepository;
        this.galleryRepository = galleryRepository;
        this.featureRepository = featureRepository;
        this.teamRepository = teamRepository;
        this.bookRepository = bookRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping(value = {"/api/db/all", "/api/database/tables", "/api/db/tables"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getDatabaseJson() {
        return ResponseEntity.ok(buildDatabasePayload());
    }

    @GetMapping(value = {"/", "/db", "/database", "/tables"}, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getDatabaseHtml() {
        Map<String, Object> data = buildDatabasePayload();
        String jsonPayload = "{}";
        try {
            jsonPayload = objectMapper.writeValueAsString(data);
        } catch (Exception ignored) {}

        String html = renderHtmlDashboard(jsonPayload);
        return ResponseEntity.ok(html);
    }

    private Map<String, Object> buildDatabasePayload() {
        List<User> users = userRepository.findAll();
        List<MenuItem> menuItems = menuItemRepository.findAll();
        List<Order> orders = orderRepository.findAll();
        List<Reservation> reservations = reservationRepository.findAll();
        List<Review> reviews = reviewRepository.findAll();
        List<Coupon> coupons = couponRepository.findAll();
        List<ContactMessage> contactMessages = contactMessageRepository.findAll();
        List<GalleryImage> galleryImages = galleryRepository.findAll();
        List<Feature> features = featureRepository.findAll();
        List<TeamMember> teamMembers = teamRepository.findAll();
        List<Book> books = bookRepository.findAll();

        double totalRevenue = orders.stream()
                .filter(o -> "paid".equalsIgnoreCase(o.getPaymentStatus()) || "delivered".equalsIgnoreCase(o.getStatus()) || "completed".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(Order::getTotal)
                .sum();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("usersCount", users.size());
        summary.put("menuCount", menuItems.size());
        summary.put("ordersCount", orders.size());
        summary.put("reservationsCount", reservations.size());
        summary.put("reviewsCount", reviews.size());
        summary.put("couponsCount", coupons.size());
        summary.put("messagesCount", contactMessages.size());
        summary.put("galleryCount", galleryImages.size());
        summary.put("featuresCount", features.size());
        summary.put("teamCount", teamMembers.size());
        summary.put("booksCount", books.size());
        summary.put("totalRevenue", totalRevenue);
        summary.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        Map<String, Object> tables = new LinkedHashMap<>();
        tables.put("users", users);
        tables.put("menu_items", menuItems);
        tables.put("orders", orders);
        tables.put("reservations", reservations);
        tables.put("reviews", reviews);
        tables.put("coupons", coupons);
        tables.put("contact_messages", contactMessages);
        tables.put("gallery_images", galleryImages);
        tables.put("features", features);
        tables.put("team_members", teamMembers);
        tables.put("books", books);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("database", "soadb (H2 Persistent File Store / Spring Data JPA)");
        response.put("service", "soa-service (Spring Boot 3.2.5 - Java 21)");
        response.put("course", "24SDCS03: SOA Programming & Microservices");
        response.put("problemStatement", "PS002: Artisanal Cafe SOA Architecture");
        response.put("summary", summary);
        response.put("tables", tables);

        return response;
    }

    private String renderHtmlDashboard(String initialJson) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\" class=\"dark\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>Lumière SOA - Live Relational Database Inspector</title>\n" +
                "  <script src=\"https://cdn.tailwindcss.com\"></script>\n" +
                "  <script>\n" +
                "    tailwind.config = {\n" +
                "      darkMode: 'class',\n" +
                "      theme: {\n" +
                "        extend: {\n" +
                "          colors: {\n" +
                "            slate: { 850: '#151e2e', 900: '#0f172a', 950: '#0a0f1d' }\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    }\n" +
                "  </script>\n" +
                "  <style>\n" +
                "    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }\n" +
                "    .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }\n" +
                "    .custom-scroll::-webkit-scrollbar-track { background: #0f172a; }\n" +
                "    .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }\n" +
                "    .custom-scroll::-webkit-scrollbar-thumb:hover { background: #475569; }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body class=\"bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans\">\n" +
                "\n" +
                "  <!-- TOP BAR -->\n" +
                "  <header class=\"bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-xl\">\n" +
                "    <div class=\"max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3\">\n" +
                "      <div class=\"flex items-center gap-3\">\n" +
                "        <div class=\"w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-teal-500/20 text-white\">\n" +
                "          ⚡\n" +
                "        </div>\n" +
                "        <div>\n" +
                "          <div class=\"flex items-center gap-2\">\n" +
                "            <h1 class=\"text-lg font-bold tracking-tight text-white\">Lumière Microservices — Live Database Inspector</h1>\n" +
                "            <span class=\"px-2 py-0.5 text-[10px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-full\">READ ONLY</span>\n" +
                "            <span class=\"px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full\">PS002 / 24SDCS03</span>\n" +
                "          </div>\n" +
                "          <p class=\"text-xs text-slate-400\">Spring Boot 3.2.5 • Spring Data JPA • H2 In-Memory/Persistent Store • Real-Time Dual Aliases</p>\n" +
                "        </div>\n" +
                "      </div>\n" +
                "\n" +
                "      <div class=\"flex items-center flex-wrap gap-2.5\">\n" +
                "        <!-- Live Status Pill -->\n" +
                "        <div class=\"flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg\">\n" +
                "          <span class=\"relative flex h-2.5 w-2.5\">\n" +
                "            <span class=\"animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75\"></span>\n" +
                "            <span class=\"relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500\"></span>\n" +
                "          </span>\n" +
                "          <span class=\"text-xs font-semibold text-emerald-300\">LIVE JPA SYNC</span>\n" +
                "        </div>\n" +
                "\n" +
                "        <!-- Auto-Refresh Toggle -->\n" +
                "        <label class=\"flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 text-xs text-slate-200 select-none\">\n" +
                "          <input type=\"checkbox\" id=\"auto-refresh-toggle\" checked class=\"accent-teal-500 w-3.5 h-3.5 rounded\">\n" +
                "          <span>Auto Refresh (3s)</span>\n" +
                "        </label>\n" +
                "\n" +
                "        <!-- Refresh Button -->\n" +
                "        <button id=\"manual-refresh-btn\" onclick=\"fetchLatestData()\" class=\"bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition\">\n" +
                "          <svg id=\"refresh-spinner\" class=\"w-3.5 h-3.5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15\"/></svg>\n" +
                "          <span>Refresh</span>\n" +
                "        </button>\n" +
                "\n" +
                "        <!-- Open Frontend -->\n" +
                "        <a href=\"https://soa-frontend-470517179980.asia-south1.run.app\" target=\"_blank\" class=\"bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition\">\n" +
                "          <span>Frontend App</span>\n" +
                "          <svg class=\"w-3 h-3 text-slate-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14\"/></svg>\n" +
                "        </a>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </header>\n" +
                "\n" +
                "  <!-- BANNER -->\n" +
                "  <div class=\"bg-gradient-to-r from-teal-950/70 via-slate-900 to-indigo-950/70 border-b border-slate-800 py-3 px-4\">\n" +
                "    <div class=\"max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between text-xs gap-2\">\n" +
                "      <div class=\"flex items-center gap-2 text-teal-300\">\n" +
                "        <span class=\"text-base\">🎓</span>\n" +
                "        <span class=\"font-semibold\">Faculty Evaluation Portal:</span>\n" +
                "        <span class=\"text-slate-300\">Live H2 database tables update in real time as actions are performed on the customer or admin frontend.</span>\n" +
                "      </div>\n" +
                "      <div class=\"flex items-center gap-3 text-slate-400\">\n" +
                "        <span>Last Synced: <span id=\"last-synced-time\" class=\"text-teal-400 font-mono font-bold\">Just now</span></span>\n" +
                "        <span>•</span>\n" +
                "        <a href=\"/health\" target=\"_blank\" class=\"text-indigo-400 hover:underline\">Health Probe /health</a>\n" +
                "        <span>•</span>\n" +
                "        <a href=\"/api/db/all\" target=\"_blank\" class=\"text-indigo-400 hover:underline\">Raw JSON /api/db/all</a>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "\n" +
                "  <!-- SUMMARY METRICS CARDS -->\n" +
                "  <div class=\"max-w-7xl mx-auto px-4 py-5 w-full\">\n" +
                "    <div class=\"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5\" id=\"metrics-grid\">\n" +
                "      <!-- Dynamically filled by JS -->\n" +
                "    </div>\n" +
                "  </div>\n" +
                "\n" +
                "  <!-- MAIN LAYOUT (TABS & TABLE) -->\n" +
                "  <main class=\"max-w-7xl mx-auto px-4 pb-12 flex-1 w-full\">\n" +
                "    <div class=\"bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col\">\n" +
                "\n" +
                "      <!-- TABLE SELECTOR TABS -->\n" +
                "      <div class=\"bg-slate-950/70 border-b border-slate-800 px-4 pt-3 flex items-center gap-1.5 overflow-x-auto custom-scroll select-none\" id=\"table-tabs\">\n" +
                "        <!-- Tabs rendered by JS -->\n" +
                "      </div>\n" +
                "\n" +
                "      <!-- TABLE HEADER CONTROLS -->\n" +
                "      <div class=\"p-4 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3\">\n" +
                "        <div class=\"flex items-center gap-3\">\n" +
                "          <div>\n" +
                "            <h2 id=\"active-table-title\" class=\"text-lg font-bold font-mono text-white flex items-center gap-2\">\n" +
                "              TABLE: <span class=\"text-teal-400\">users</span>\n" +
                "            </h2>\n" +
                "            <p id=\"active-table-desc\" class=\"text-xs text-slate-400\">User credentials, roles, and salted BCrypt password hashes</p>\n" +
                "          </div>\n" +
                "          <span id=\"active-table-count\" class=\"text-xs px-2.5 py-1 bg-slate-800 text-teal-300 font-mono font-bold rounded-lg border border-slate-700\">0 rows</span>\n" +
                "        </div>\n" +
                "\n" +
                "        <div class=\"flex items-center gap-2\">\n" +
                "          <!-- Search Filter -->\n" +
                "          <div class=\"relative w-full md:w-64\">\n" +
                "            <input type=\"text\" id=\"table-search\" oninput=\"filterCurrentTable()\" placeholder=\"Search in table...\" class=\"w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-teal-500 font-mono\">\n" +
                "            <svg class=\"w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\"/></svg>\n" +
                "          </div>\n" +
                "\n" +
                "          <!-- Export CSV -->\n" +
                "          <button onclick=\"exportCurrentTableCSV()\" class=\"bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium border border-slate-700 flex items-center gap-1.5 whitespace-nowrap transition\">\n" +
                "            <svg class=\"w-3.5 h-3.5 text-teal-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4\"/></svg>\n" +
                "            <span>Export CSV</span>\n" +
                "          </button>\n" +
                "        </div>\n" +
                "      </div>\n" +
                "\n" +
                "      <!-- DATA TABLE CONTAINER -->\n" +
                "      <div class=\"overflow-x-auto custom-scroll max-h-[68vh] min-h-[380px] relative\">\n" +
                "        <table class=\"w-full text-left border-collapse text-xs\" id=\"main-data-table\">\n" +
                "          <thead class=\"sticky top-0 z-10 bg-slate-950 text-slate-400 uppercase text-[11px] font-mono border-b border-slate-800 shadow\">\n" +
                "            <tr id=\"table-header-row\">\n" +
                "              <!-- Rendered by JS -->\n" +
                "            </tr>\n" +
                "          </thead>\n" +
                "          <tbody id=\"table-body-rows\" class=\"divide-y divide-slate-800/60 bg-slate-900/60 font-sans\">\n" +
                "            <!-- Rendered by JS -->\n" +
                "          </tbody>\n" +
                "        </table>\n" +
                "        <div id=\"empty-table-state\" class=\"hidden py-16 text-center text-slate-500 font-mono text-sm\">\n" +
                "          No records found in this table or matching your search filter.\n" +
                "        </div>\n" +
                "      </div>\n" +
                "\n" +
                "      <!-- TABLE FOOTER -->\n" +
                "      <div class=\"p-3 bg-slate-950 border-t border-slate-800 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-2\">\n" +
                "        <div class=\"flex items-center gap-2\">\n" +
                "          <span class=\"w-2 h-2 rounded-full bg-teal-500\"></span>\n" +
                "          <span class=\"font-mono\">JPA Entity Schema Active</span>\n" +
                "          <span class=\"text-slate-600\">|</span>\n" +
                "          <span id=\"footer-row-counter\" class=\"text-slate-300 font-mono\">0 of 0 records displayed</span>\n" +
                "        </div>\n" +
                "        <div class=\"text-slate-500 font-mono text-[11px]\">\n" +
                "          Spring Data JPA • Hibernate H2 Dialect • UTF-8 Dual Jackson Serialization\n" +
                "        </div>\n" +
                "      </div>\n" +
                "\n" +
                "    </div>\n" +
                "  </main>\n" +
                "\n" +
                "  <!-- JSON INSPECTOR MODAL -->\n" +
                "  <div id=\"json-modal\" class=\"fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden items-center justify-center p-4\">\n" +
                "    <div class=\"bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 shadow-2xl flex flex-col max-h-[85vh]\">\n" +
                "      <div class=\"flex items-center justify-between pb-3 border-b border-slate-800\">\n" +
                "        <h3 id=\"modal-record-title\" class=\"text-sm font-bold font-mono text-teal-400\">Row Record Details</h3>\n" +
                "        <button onclick=\"closeJsonModal()\" class=\"text-slate-400 hover:text-white text-lg font-bold px-2 py-1\">✕</button>\n" +
                "      </div>\n" +
                "      <pre id=\"modal-json-content\" class=\"p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-auto custom-scroll my-4 flex-1 border border-slate-800\"></pre>\n" +
                "      <div class=\"flex justify-end gap-2\">\n" +
                "        <button onclick=\"copyModalJson()\" id=\"copy-json-btn\" class=\"px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition\">Copy JSON</button>\n" +
                "        <button onclick=\"closeJsonModal()\" class=\"px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition\">Close</button>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "\n" +
                "  <!-- INITIAL EMBEDDED DATA -->\n" +
                "  <script id=\"embedded-data\" type=\"application/json\">\n" +
                initialJson + "\n" +
                "  </script>\n" +
                "\n" +
                "  <!-- DASHBOARD CONTROLLER JS -->\n" +
                "  <script>\n" +
                "    let dbData = null;\n" +
                "    let currentTable = 'users';\n" +
                "    let autoRefreshTimer = null;\n" +
                "    let activeModalJsonString = '';\n" +
                "\n" +
                "    const tableConfigs = {\n" +
                "      users: {\n" +
                "        title: 'users',\n" +
                "        desc: 'User identity, roles, and BCrypt salted cryptographic password hashes',\n" +
                "        icon: '👤',\n" +
                "        columns: [\n" +
                "          { key: 'id', label: 'id', type: 'VARCHAR (PK)', mono: true },\n" +
                "          { key: 'name', label: 'name', type: 'VARCHAR' },\n" +
                "          { key: 'email', label: 'email', type: 'VARCHAR (UNIQUE)' },\n" +
                "          { key: 'password', label: 'password_hash', type: 'VARCHAR [BCrypt HASH]', isPassword: true },\n" +
                "          { key: 'role', label: 'role', type: 'VARCHAR', isRole: true },\n" +
                "          { key: 'phone', label: 'phone', type: 'VARCHAR' },\n" +
                "          { key: 'is_active', label: 'is_active', type: 'BOOLEAN', isBool: true },\n" +
                "          { key: 'created_at', label: 'created_at', type: 'TIMESTAMP', mono: true }\n" +
                "        ]\n" +
                "      },\n" +
                "      menu_items: {\n" +
                "        title: 'menu_items',\n" +
                "        desc: 'Artisanal dishes, pricing, dietary flags, and star ratings',\n" +
                "        icon: '🍽️',\n" +
                "        columns: [\n" +
                "          { key: 'id', label: 'id', type: 'VARCHAR (PK)', mono: true },\n" +
                "          { key: 'name', label: 'name', type: 'VARCHAR', isBold: true },\n" +
                "          { key: 'category', label: 'category', type: 'VARCHAR' },\n" +
                "          { key: 'price', label: 'price (₹)', type: 'DOUBLE', isCurrency: true },\n" +
                "          { key: 'is_veg', label: 'is_veg', type: 'BOOLEAN', isBool: true },\n" +
                "          { key: 'is_available', label: 'is_available', type: 'BOOLEAN', isBool: true },\n" +
                "          { key: 'rating', label: 'rating', type: 'DOUBLE', isRating: true },\n" +
                "          { key: 'rating_count', label: 'rating_count', type: 'INTEGER' },\n" +
                "          { key: 'show_on_homepage', label: 'show_on_home', type: 'BOOLEAN', isBool: true }\n" +
                "        ]\n" +
                "      },\n" +
                "      orders: {\n" +
                "        title: 'orders',\n" +
                "        desc: 'Customer orders, payment verification status, UPI UTR numbers, and line items',\n" +
                "        icon: '📦',\n" +
                "        columns: [\n" +
                "          { key: 'id', label: 'id', type: 'VARCHAR (PK)', mono: true },\n" +
                "          { key: 'daily_order_number', label: 'daily_order#', type: 'INTEGER', mono: true },\n" +
                "          { key: 'user_name', label: 'customer_name', type: 'VARCHAR' },\n" +
                "          { key: 'user_email', label: 'customer_email', type: 'VARCHAR' },\n" +
                "          { key: 'total', label: 'total (₹)', type: 'DOUBLE', isCurrency: true },\n" +
                "          { key: 'payment_status', label: 'payment_status', type: 'VARCHAR', isPaymentStatus: true },\n" +
                "          { key: 'utr_number', label: 'utr_number / tx_id', type: 'VARCHAR', mono: true, isUtr: true },\n" +
                "          { key: 'status', label: 'status', type: 'VARCHAR', isOrderStatus: true },\n" +
                "          { key: 'created_at', label: 'created_at', type: 'TIMESTAMP', mono: true }\n" +
                "        ]\n" +
                "      },\n" +
                "      reservations: {\n" +
                "        title: 'reservations',\n" +
                "        desc: 'Table bookings, guest parties, scheduled time slots, and status',\n" +
                "        icon: '📅',\n" +
                "        columns: [\n" +
                "          { key: 'id', label: 'id', type: 'VARCHAR (PK)', mono: true },\n" +
                "          { key: 'name', label: 'guest_name', type: 'VARCHAR' },\n" +
                "          { key: 'email', label: 'guest_email', type: 'VARCHAR' },\n" +
                "          { key: 'phone', label: 'phone', type: 'VARCHAR' },\n" +
                "          { key: 'date', label: 'date', type: 'VARCHAR', mono: true },\n" +
                "          { key: 'time_slot', label: 'time_slot', type: 'VARCHAR', mono: true },\n" +
                "          { key: 'number_of_guests', label: 'party_size', type: 'INTEGER' },\n" +
                "          { key: 'status', label: 'status', type: 'VARCHAR', isResStatus: true },\n" +
                "          { key: 'created_at', label: 'created_at', type: 'TIMESTAMP', mono: true }\n" +
                "        ]\n" +
                "      },\n" +
                "      reviews: {\n" +
                "        title: 'reviews',\n" +
                "        desc: 'Customer ratings, dining comments, homepage flags, and admin replies',\n" +
                "        icon: '⭐',\n" +
                "        columns: [\n" +
                "          { key: 'id', label: 'id', type: 'VARCHAR (PK)', mono: true },\n" +
                "          { key: 'user_name', label: 'user_name', type: 'VARCHAR' },\n" +
                "          { key: 'rating', label: 'rating', type: 'INTEGER', isRating: true },\n" +
                "          { key: 'title', label: 'title', type: 'VARCHAR', isBold: true },\n" +
                "          { key: 'comment', label: 'comment', type: 'VARCHAR' },\n" +
                "          { key: 'is_published', label: 'is_published', type: 'BOOLEAN', isBool: true },\n" +
                "          { key: 'show_on_homepage', label: 'show_on_home', type: 'BOOLEAN', isBool: true },\n" +
                "          { key: 'created_at', label: 'created_at', type: 'TIMESTAMP', mono: true }\n" +
                "        ]\n" +
                "      },\n" +
                "      coupons: {\n" +
                "        title: 'coupons',\n" +
                "        desc: 'Promotional discount codes, validity windows, and limits',\n" +
                "        icon: '🎟️',\n" +
                "        columns: [\n" +
                "          { key: 'id', label: 'id', type: 'VARCHAR (PK)', mono: true },\n" +
                "          { key: 'code', label: 'code', type: 'VARCHAR (UNIQUE)', mono: true, isBold: true },\n" +
                "          { key: 'discount_type', label: 'discount_type', type: 'VARCHAR' },\n" +
                "          { key: 'discount_value', label: 'discount_value', type: 'DOUBLE' },\n" +
                "          { key: 'min_order_value', label: 'min_order (₹)', type: 'DOUBLE' },\n" +
                "          { key: 'valid_from', label: 'valid_from', type: 'TIMESTAMP', mono: true },\n" +
                "          { key: 'valid_until', label: 'valid_until', type: 'TIMESTAMP', mono: true },\n" +
                "          { key: 'is_active', label: 'is_active', type: 'BOOLEAN', isBool: true }\n" +
                "        ]\n" +
                "      },\n" +
                "      contact_messages: {\n" +
                "        title: 'contact_messages',\n" +
                "        desc: 'Customer feedback, event inquiries, and administrative replies',\n" +
                "        icon: '✉️',\n" +
                "        columns: [\n" +
                "          { key: 'id', label: 'id', type: 'VARCHAR (PK)', mono: true },\n" +
                "          { key: 'name', label: 'name', type: 'VARCHAR' },\n" +
                "          { key: 'email', label: 'email', type: 'VARCHAR' },\n" +
                "          { key: 'message', label: 'message', type: 'TEXT' },\n" +
                "          { key: 'status', label: 'status', type: 'VARCHAR', isMsgStatus: true },\n" +
                "          { key: 'created_at', label: 'created_at', type: 'TIMESTAMP', mono: true }\n" +
                "        ]\n" +
                "      },\n" +
                "      gallery_images: {\n" +
                "        title: 'gallery_images',\n" +
                "        desc: 'Cafe visual showcase images and featured homepage gallery tags',\n" +
                "        icon: '🖼️',\n" +
                "        columns: [\n" +
                "          { key: 'id', label: 'id', type: 'VARCHAR (PK)', mono: true },\n" +
                "          { key: 'title', label: 'title', type: 'VARCHAR' },\n" +
                "          { key: 'url', label: 'image_url', type: 'VARCHAR', isUrl: true },\n" +
                "          { key: 'category', label: 'category', type: 'VARCHAR' },\n" +
                "          { key: 'is_featured', label: 'is_featured', type: 'BOOLEAN', isBool: true }\n" +
                "        ]\n" +
                "      },\n" +
                "      features: {\n" +
                "        title: 'features',\n" +
                "        desc: 'Core service highlights (Artisanal brews, organic ingredients, etc.)',\n" +
                "        icon: '✨',\n" +
                "        columns: [\n" +
                "          { key: 'id', label: 'id', type: 'VARCHAR (PK)', mono: true },\n" +
                "          { key: 'title', label: 'title', type: 'VARCHAR', isBold: true },\n" +
                "          { key: 'description', label: 'description', type: 'VARCHAR' },\n" +
                "          { key: 'icon', label: 'icon', type: 'VARCHAR' }\n" +
                "        ]\n" +
                "      },\n" +
                "      team_members: {\n" +
                "        title: 'team_members',\n" +
                "        desc: 'Culinary and barista team roster',\n" +
                "        icon: '👨‍🍳',\n" +
                "        columns: [\n" +
                "          { key: 'id', label: 'id', type: 'VARCHAR (PK)', mono: true },\n" +
                "          { key: 'name', label: 'name', type: 'VARCHAR', isBold: true },\n" +
                "          { key: 'role', label: 'role', type: 'VARCHAR' },\n" +
                "          { key: 'image', label: 'image_url', type: 'VARCHAR', isUrl: true }\n" +
                "        ]\n" +
                "      },\n" +
                "      books: {\n" +
                "        title: 'books',\n" +
                "        desc: 'Library Management Microservice Entity (Course Workbook Skill 6 & 7)',\n" +
                "        icon: '📚',\n" +
                "        columns: [\n" +
                "          { key: 'bookId', label: 'book_id (PK)', type: 'BIGINT (AUTO_INCREMENT)', mono: true },\n" +
                "          { key: 'bookName', label: 'book_name', type: 'VARCHAR', isBold: true },\n" +
                "          { key: 'author', label: 'author', type: 'VARCHAR' },\n" +
                "          { key: 'bookPrice', label: 'price (₹)', type: 'DOUBLE', isCurrency: true }\n" +
                "        ]\n" +
                "      }\n" +
                "    };\n" +
                "\n" +
                "    function init() {\n" +
                "      try {\n" +
                "        const embeddedText = document.getElementById('embedded-data').textContent.trim();\n" +
                "        if (embeddedText) {\n" +
                "          dbData = JSON.parse(embeddedText);\n" +
                "        }\n" +
                "      } catch (e) {\n" +
                "        console.warn('Could not parse embedded data', e);\n" +
                "      }\n" +
                "\n" +
                "      renderTabs();\n" +
                "      renderMetrics();\n" +
                "      renderTable(currentTable);\n" +
                "\n" +
                "      // Setup auto-refresh\n" +
                "      setupAutoRefresh();\n" +
                "      document.getElementById('auto-refresh-toggle').addEventListener('change', setupAutoRefresh);\n" +
                "    }\n" +
                "\n" +
                "    function setupAutoRefresh() {\n" +
                "      if (autoRefreshTimer) clearInterval(autoRefreshTimer);\n" +
                "      const isChecked = document.getElementById('auto-refresh-toggle').checked;\n" +
                "      if (isChecked) {\n" +
                "        autoRefreshTimer = setInterval(fetchLatestData, 3000);\n" +
                "      }\n" +
                "    }\n" +
                "\n" +
                "    async function fetchLatestData() {\n" +
                "      const spinner = document.getElementById('refresh-spinner');\n" +
                "      spinner.classList.add('animate-spin');\n" +
                "      try {\n" +
                "        const res = await fetch('/api/db/all');\n" +
                "        if (res.ok) {\n" +
                "          dbData = await res.json();\n" +
                "          document.getElementById('last-synced-time').textContent = new Date().toLocaleTimeString();\n" +
                "          renderMetrics();\n" +
                "          updateTabBadges();\n" +
                "          renderTable(currentTable);\n" +
                "        }\n" +
                "      } catch (err) {\n" +
                "        console.error('Auto-refresh failed', err);\n" +
                "      } finally {\n" +
                "        setTimeout(() => spinner.classList.remove('animate-spin'), 400);\n" +
                "      }\n" +
                "    }\n" +
                "\n" +
                "    function renderTabs() {\n" +
                "      const container = document.getElementById('table-tabs');\n" +
                "      container.innerHTML = '';\n" +
                "      Object.keys(tableConfigs).forEach(key => {\n" +
                "        const cfg = tableConfigs[key];\n" +
                "        const count = (dbData && dbData.tables && dbData.tables[key]) ? dbData.tables[key].length : 0;\n" +
                "        const isActive = key === currentTable;\n" +
                "        const btn = document.createElement('button');\n" +
                "        btn.id = 'tab-btn-' + key;\n" +
                "        btn.className = `px-3.5 py-2.5 rounded-t-xl font-mono text-xs font-semibold flex items-center gap-2 border-t border-x transition whitespace-nowrap ${\n" +
                "          isActive \n" +
                "            ? 'bg-slate-900 text-teal-400 border-slate-700 shadow-lg'\n" +
                "            : 'bg-slate-950/40 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/60'\n" +
                "        }`;\n" +
                "        btn.onclick = () => switchTable(key);\n" +
                "        btn.innerHTML = `<span>${cfg.icon}</span><span>${key}</span><span id=\"tab-badge-${key}\" class=\"px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'}\">${count}</span>`;\n" +
                "        container.appendChild(btn);\n" +
                "      });\n" +
                "    }\n" +
                "\n" +
                "    function updateTabBadges() {\n" +
                "      if (!dbData || !dbData.tables) return;\n" +
                "      Object.keys(tableConfigs).forEach(key => {\n" +
                "        const badge = document.getElementById('tab-badge-' + key);\n" +
                "        const count = dbData.tables[key] ? dbData.tables[key].length : 0;\n" +
                "        if (badge) badge.textContent = count;\n" +
                "      });\n" +
                "    }\n" +
                "\n" +
                "    function switchTable(key) {\n" +
                "      currentTable = key;\n" +
                "      renderTabs();\n" +
                "      document.getElementById('table-search').value = '';\n" +
                "      renderTable(key);\n" +
                "    }\n" +
                "\n" +
                "    function renderMetrics() {\n" +
                "      const grid = document.getElementById('metrics-grid');\n" +
                "      if (!dbData || !dbData.summary) return;\n" +
                "      const s = dbData.summary;\n" +
                "      const cards = [\n" +
                "        { label: 'USERS', count: s.usersCount, icon: '👤', color: 'from-blue-500 to-indigo-600', sub: 'Accounts' },\n" +
                "        { label: 'MENU ITEMS', count: s.menuCount, icon: '🍽️', color: 'from-teal-500 to-emerald-600', sub: 'Dishes' },\n" +
                "        { label: 'ORDERS', count: s.ordersCount, icon: '📦', color: 'from-amber-500 to-orange-600', sub: 'Transactions' },\n" +
                "        { label: 'RESERVATIONS', count: s.reservationsCount, icon: '📅', color: 'from-cyan-500 to-blue-600', sub: 'Bookings' },\n" +
                "        { label: 'REVIEWS', count: s.reviewsCount, icon: '⭐', color: 'from-yellow-400 to-amber-500', sub: 'Ratings' },\n" +
                "        { label: 'TOTAL REVENUE', count: '₹' + Math.round(s.totalRevenue || 0).toLocaleString(), icon: '💰', color: 'from-emerald-400 to-teal-500', sub: 'Verified Sales' }\n" +
                "      ];\n" +
                "      grid.innerHTML = cards.map(c => `\n" +
                "        <div class=\"bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition\">\n" +
                "          <div class=\"flex items-center justify-between\">\n" +
                "            <span class=\"text-[10px] font-mono font-bold text-slate-400 tracking-wider\">${c.label}</span>\n" +
                "            <span class=\"text-base\">${c.icon}</span>\n" +
                "          </div>\n" +
                "          <p class=\"text-xl font-bold font-mono text-white mt-1\">${c.count}</p>\n" +
                "          <p class=\"text-[10px] text-slate-500 mt-0.5\">${c.sub}</p>\n" +
                "        </div>\n" +
                "      `).join('');\n" +
                "    }\n" +
                "\n" +
                "    function renderTable(tableKey) {\n" +
                "      const cfg = tableConfigs[tableKey];\n" +
                "      if (!cfg) return;\n" +
                "\n" +
                "      document.getElementById('active-table-title').innerHTML = `TABLE: <span class=\"text-teal-400\">${cfg.title}</span>`;\n" +
                "      document.getElementById('active-table-desc').textContent = cfg.desc;\n" +
                "\n" +
                "      // Render Header\n" +
                "      const thead = document.getElementById('table-header-row');\n" +
                "      thead.innerHTML = cfg.columns.map(c => `\n" +
                "        <th class=\"px-4 py-3 whitespace-nowrap\">\n" +
                "          <div class=\"flex flex-col\">\n" +
                "            <span class=\"text-slate-200 font-bold\">${c.label}</span>\n" +
                "            <span class=\"text-[9px] text-teal-400/90 lowercase\">${c.type}</span>\n" +
                "          </div>\n" +
                "        </th>\n" +
                "      `).join('') + '<th class=\"px-4 py-3 text-right\">ACTION</th>';\n" +
                "\n" +
                "      filterCurrentTable();\n" +
                "    }\n" +
                "\n" +
                "    function filterCurrentTable() {\n" +
                "      const cfg = tableConfigs[currentTable];\n" +
                "      const query = (document.getElementById('table-search').value || '').toLowerCase().trim();\n" +
                "      const allRows = (dbData && dbData.tables && dbData.tables[currentTable]) ? dbData.tables[currentTable] : [];\n" +
                "      const tbody = document.getElementById('table-body-rows');\n" +
                "      const emptyState = document.getElementById('empty-table-state');\n" +
                "\n" +
                "      const filtered = allRows.filter(row => {\n" +
                "        if (!query) return true;\n" +
                "        return Object.values(row).some(v => {\n" +
                "          if (v === null || v === undefined) return false;\n" +
                "          if (typeof v === 'object') return JSON.stringify(v).toLowerCase().includes(query);\n" +
                "          return String(v).toLowerCase().includes(query);\n" +
                "        });\n" +
                "      });\n" +
                "\n" +
                "      document.getElementById('active-table-count').textContent = `${allRows.length} rows (${filtered.length} filtered)`;\n" +
                "      document.getElementById('footer-row-counter').textContent = `${filtered.length} of ${allRows.length} records displayed`;\n" +
                "\n" +
                "      if (filtered.length === 0) {\n" +
                "        tbody.innerHTML = '';\n" +
                "        emptyState.classList.remove('hidden');\n" +
                "        return;\n" +
                "      }\n" +
                "      emptyState.classList.add('hidden');\n" +
                "\n" +
                "      tbody.innerHTML = filtered.map((row, idx) => `\n" +
                "        <tr class=\"hover:bg-slate-800/40 transition group\">\n" +
                "          ${cfg.columns.map(c => {\n" +
                "            const val = getRowValue(row, c.key);\n" +
                "            return `<td class=\"px-4 py-3 whitespace-nowrap text-slate-300 font-sans\">${formatCellValue(val, c, row)}</td>`;\n" +
                "          }).join('')}\n" +
                "          <td class=\"px-4 py-3 text-right whitespace-nowrap\">\n" +
                "            <button onclick=\"openJsonModal(${idx})\" class=\"px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 rounded font-mono text-[11px] font-semibold border border-slate-700/80 transition\">\n" +
                "              JSON ↗\n" +
                "            </button>\n" +
                "          </td>\n" +
                "        </tr>\n" +
                "      `).join('');\n" +
                "\n" +
                "      window.currentFilteredRows = filtered;\n" +
                "    }\n" +
                "\n" +
                "    function getRowValue(row, key) {\n" +
                "      if (row[key] !== undefined) return row[key];\n" +
                "      // camelCase fallback\n" +
                "      const camel = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());\n" +
                "      if (row[camel] !== undefined) return row[camel];\n" +
                "      // snake_case fallback\n" +
                "      const snake = key.replace(/([A-Z])/g, \"_$1\").toLowerCase();\n" +
                "      if (row[snake] !== undefined) return row[snake];\n" +
                "      return null;\n" +
                "    }\n" +
                "\n" +
                "    function formatCellValue(val, col, row) {\n" +
                "      if (val === null || val === undefined) return '<span class=\"text-slate-600 italic\">NULL</span>';\n" +
                "\n" +
                "      if (col.isPassword) {\n" +
                "        return `<div class=\"flex items-center gap-1.5\">\n" +
                "          <span class=\"px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-mono text-[11px] tracking-tight max-w-[220px] truncate\" title=\"BCrypt Encoded Salt + Hash: ${val}\">\n" +
                "            🔑 ${val}\n" +
                "          </span>\n" +
                "          <button onclick=\"navigator.clipboard.writeText('${val}'); alert('Password hash copied!')\" class=\"text-slate-500 hover:text-amber-300 text-xs\" title=\"Copy Hash\">📋</button>\n" +
                "        </div>`;\n" +
                "      }\n" +
                "\n" +
                "      if (col.isUtr) {\n" +
                "        return val ? `<span class=\"px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800 text-blue-300 font-mono font-bold text-[11px]\">${val}</span>` : '<span class=\"text-slate-600 italic\">NONE</span>';\n" +
                "      }\n" +
                "\n" +
                "      if (col.isRole) {\n" +
                "        const isAdm = String(val).toLowerCase() === 'admin';\n" +
                "        return `<span class=\"px-2 py-0.5 rounded text-[11px] font-bold ${isAdm ? 'bg-purple-900/60 text-purple-300 border border-purple-700' : 'bg-blue-900/40 text-blue-300 border border-blue-800'}\">${val}</span>`;\n" +
                "      }\n" +
                "\n" +
                "      if (col.isPaymentStatus) {\n" +
                "        const isPaid = String(val).toLowerCase() === 'paid';\n" +
                "        return `<span class=\"px-2 py-0.5 rounded text-[11px] font-bold ${isPaid ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-amber-900/60 text-amber-300 border border-amber-700'}\">${String(val).toUpperCase()}</span>`;\n" +
                "      }\n" +
                "\n" +
                "      if (col.isOrderStatus || col.isResStatus || col.isMsgStatus) {\n" +
                "        return `<span class=\"px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 capitalize\">${val}</span>`;\n" +
                "      }\n" +
                "\n" +
                "      if (col.isBool) {\n" +
                "        const b = (val === true || val === 'true');\n" +
                "        return `<span class=\"inline-flex items-center gap-1 font-mono font-bold text-[11px] ${b ? 'text-emerald-400' : 'text-slate-500'}\">${b ? '● true' : '○ false'}</span>`;\n" +
                "      }\n" +
                "\n" +
                "      if (col.isCurrency) {\n" +
                "        return `<span class=\"font-mono font-bold text-teal-400\">₹${Number(val).toFixed(2)}</span>`;\n" +
                "      }\n" +
                "\n" +
                "      if (col.isRating) {\n" +
                "        const r = Math.min(5, Math.max(0, Math.round(Number(val) || 5)));\n" +
                "        return `<span class=\"text-yellow-400 font-bold font-mono\">${'★'.repeat(r)}${'☆'.repeat(5 - r)} <span class=\"text-slate-400 text-xs\">(${val})</span></span>`;\n" +
                "      }\n" +
                "\n" +
                "      if (col.isUrl) {\n" +
                "        return `<a href=\"${val}\" target=\"_blank\" class=\"text-teal-400 hover:underline max-w-[180px] truncate block font-mono text-[11px]\">${val}</a>`;\n" +
                "      }\n" +
                "\n" +
                "      if (col.mono) {\n" +
                "        return `<span class=\"font-mono text-slate-300 text-[11px]\">${val}</span>`;\n" +
                "      }\n" +
                "\n" +
                "      if (col.isBold) {\n" +
                "        return `<span class=\"font-semibold text-white\">${val}</span>`;\n" +
                "      }\n" +
                "\n" +
                "      return `<span class=\"truncate max-w-[280px] block\">${String(val)}</span>`;\n" +
                "    }\n" +
                "\n" +
                "    function openJsonModal(idx) {\n" +
                "      const row = window.currentFilteredRows ? window.currentFilteredRows[idx] : null;\n" +
                "      if (!row) return;\n" +
                "      activeModalJsonString = JSON.stringify(row, null, 2);\n" +
                "      document.getElementById('modal-record-title').textContent = `${currentTable.toUpperCase()} RECORD: ${row.id || row.bookId || idx}`;\n" +
                "      document.getElementById('modal-json-content').textContent = activeModalJsonString;\n" +
                "      document.getElementById('json-modal').classList.remove('hidden');\n" +
                "      document.getElementById('json-modal').classList.add('flex');\n" +
                "    }\n" +
                "\n" +
                "    function closeJsonModal() {\n" +
                "      document.getElementById('json-modal').classList.add('hidden');\n" +
                "      document.getElementById('json-modal').classList.remove('flex');\n" +
                "    }\n" +
                "\n" +
                "    function copyModalJson() {\n" +
                "      navigator.clipboard.writeText(activeModalJsonString);\n" +
                "      const btn = document.getElementById('copy-json-btn');\n" +
                "      btn.textContent = '✓ Copied!';\n" +
                "      setTimeout(() => btn.textContent = 'Copy JSON', 1500);\n" +
                "    }\n" +
                "\n" +
                "    function exportCurrentTableCSV() {\n" +
                "      const rows = window.currentFilteredRows || [];\n" +
                "      if (rows.length === 0) {\n" +
                "        alert('No rows to export.');\n" +
                "        return;\n" +
                "      }\n" +
                "      const cfg = tableConfigs[currentTable];\n" +
                "      const headers = cfg.columns.map(c => c.key);\n" +
                "      const csvRows = [\n" +
                "        headers.join(','),\n" +
                "        ...rows.map(r => headers.map(h => JSON.stringify(getRowValue(r, h) || '')).join(','))\n" +
                "      ];\n" +
                "      const blob = new Blob([csvRows.join('\\r\\n')], { type: 'text/csv' });\n" +
                "      const url = window.URL.createObjectURL(blob);\n" +
                "      const a = document.createElement('a');\n" +
                "      a.href = url;\n" +
                "      a.download = `${currentTable}_${new Date().toISOString().slice(0, 10)}.csv`;\n" +
                "      a.click();\n" +
                "      window.URL.revokeObjectURL(url);\n" +
                "    }\n" +
                "\n" +
                "    window.onload = init;\n" +
                "  </script>\n" +
                "</body>\n" +
                "</html>";
    }
}
