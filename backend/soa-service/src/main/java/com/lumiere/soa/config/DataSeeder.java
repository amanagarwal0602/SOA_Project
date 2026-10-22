package com.lumiere.soa.config;

import com.lumiere.soa.model.*;
import com.lumiere.soa.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final CouponRepository couponRepository;
    private final FeatureRepository featureRepository;
    private final TeamRepository teamRepository;
    private final ReviewRepository reviewRepository;
    private final GalleryRepository galleryRepository;
    private final BookRepository bookRepository;
    private final CafeContentRepository cafeContentRepository;
    private final OrderRepository orderRepository;
    private final ReservationRepository reservationRepository;

    public DataSeeder(UserRepository userRepository,
                      MenuItemRepository menuItemRepository,
                      CouponRepository couponRepository,
                      FeatureRepository featureRepository,
                      TeamRepository teamRepository,
                      ReviewRepository reviewRepository,
                      GalleryRepository galleryRepository,
                      BookRepository bookRepository,
                      CafeContentRepository cafeContentRepository,
                      OrderRepository orderRepository,
                      ReservationRepository reservationRepository) {
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
        this.couponRepository = couponRepository;
        this.featureRepository = featureRepository;
        this.teamRepository = teamRepository;
        this.reviewRepository = reviewRepository;
        this.galleryRepository = galleryRepository;
        this.bookRepository = bookRepository;
        this.cafeContentRepository = cafeContentRepository;
        this.orderRepository = orderRepository;
        this.reservationRepository = reservationRepository;
    }

    @Override
    public void run(String... args) {
        if (!cafeContentRepository.existsById("system_seeded_v2")) {
            seedUsers();
            seedMenuItems();
            seedCoupons();
            seedFeatures();
            seedTeam();
            seedReviews();
            seedGallery();
            seedBooks();
            cafeContentRepository.save(CafeContent.builder()
                    .contentKey("system_seeded_v2")
                    .contentJson("{\"seeded\":true}")
                    .build());
        }
        if (orderRepository.count() == 0) {
            seedOrders();
        }
        if (reservationRepository.count() == 0) {
            seedReservations();
        }

        // Heal existing coupons with valid expiry dates if missing
        couponRepository.findAll().forEach(c -> {
            if (c.getValidUntil() == null || c.getValidUntil().isBlank()) {
                c.setValidFrom(java.time.LocalDate.now().minusDays(5).toString());
                c.setValidUntil(java.time.LocalDate.now().plusMonths(6).toString());
                couponRepository.save(c);
            }
        });

        // Heal existing reviews with valid timestamps if missing
        reviewRepository.findAll().forEach(r -> {
            if (r.getCreatedAt() == null || r.getCreatedAt().isBlank()) {
                r.setCreatedAt(java.time.LocalDateTime.now().minusDays(2).toString());
                r.setDate(java.time.LocalDate.now().minusDays(2).toString());
                reviewRepository.save(r);
            }
        });
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .id("admin000")
                    .name("Admin")
                    .email("admin@admin.com")
                    .username("admin")
                    .password("admin")
                    .role("admin")
                    .phone("+91-98765-43211")
                    .avatar("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100")
                    .addressStreet("123 Admin Avenue")
                    .addressCity("Mumbai")
                    .addressState("Maharashtra")
                    .addressZipcode("400001")
                    .addressCountry("India")
                    .permissions("[\"all\"]")
                    .isActive(true)
                    .emailVerified(true)
                    .build();

            User demo = User.builder()
                    .id("demo001")
                    .name("Demo User")
                    .email("demo@demo.com")
                    .username("demo")
                    .password("demo")
                    .role("customer")
                    .phone("+91-98765-43210")
                    .avatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100")
                    .addressStreet("456 Demo Street")
                    .addressCity("Mumbai")
                    .addressState("Maharashtra")
                    .addressZipcode("400001")
                    .addressCountry("India")
                    .permissions("[\"view_dashboard\",\"view_orders\",\"view_menu\",\"view_reservations\"]")
                    .isActive(true)
                    .emailVerified(true)
                    .build();

            userRepository.saveAll(List.of(admin, demo));
        }
    }

    private void seedMenuItems() {
        if (menuItemRepository.count() == 0) {
            List<MenuItem> items = List.of(
                MenuItem.builder()
                        .id("menu001")
                        .name("Margherita Pizza")
                        .description("Classic Italian pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil.")
                        .price(14.99)
                        .category("Pizza")
                        .image("https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&h=350&fit=crop")
                        .isAvailable(true).isVeg(true).spicyLevel(1).prepTime(20).rating(4.8).ratingCount(42).orderCount(120).showOnHomepage(true).build(),
                MenuItem.builder()
                        .id("menu002")
                        .name("Truffle Mushroom Risotto")
                        .description("Creamy Arborio rice with wild forest mushrooms, Parmigiano-Reggiano, and black truffle drizzle.")
                        .price(18.50)
                        .category("Pasta")
                        .image("https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500&h=350&fit=crop")
                        .isAvailable(true).isVeg(true).spicyLevel(1).prepTime(25).rating(4.9).ratingCount(35).orderCount(95).showOnHomepage(true).build(),
                MenuItem.builder()
                        .id("menu003")
                        .name("Artisanal Flat White")
                        .description("Double espresso shot blended with silky micro-foam steamed whole milk.")
                        .price(5.50)
                        .category("Coffee")
                        .image("https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&h=350&fit=crop")
                        .isAvailable(true).isVeg(true).spicyLevel(0).prepTime(5).rating(4.7).ratingCount(88).orderCount(310).showOnHomepage(true).build(),
                MenuItem.builder()
                        .id("menu004")
                        .name("Belgian Chocolate Soufflé")
                        .description("Warm molten dark chocolate cake served with vanilla bean gelato and berry compote.")
                        .price(9.00)
                        .category("Desserts")
                        .image("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=350&fit=crop")
                        .isAvailable(true).isVeg(true).spicyLevel(0).prepTime(15).rating(4.9).ratingCount(64).orderCount(180).showOnHomepage(true).build(),
                MenuItem.builder()
                        .id("menu005")
                        .name("Mediterranean Falafel Bowl")
                        .description("Crispy herb falafels, roasted chickpeas, avocado, baby spinach, hummus, and tahini dressing.")
                        .price(13.25)
                        .category("Salads")
                        .image("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=350&fit=crop")
                        .isAvailable(true).isVeg(true).spicyLevel(1).prepTime(12).rating(4.6).ratingCount(29).orderCount(85).showOnHomepage(false).build(),
                MenuItem.builder()
                        .id("menu006")
                        .name("Cold Brew Tonic")
                        .description("18-hour steeped single-origin cold brew poured over citrus tonic and garnished with rosemary.")
                        .price(6.00)
                        .category("Beverages")
                        .image("https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&h=350&fit=crop")
                        .isAvailable(true).isVeg(true).spicyLevel(0).prepTime(5).rating(4.8).ratingCount(52).orderCount(140).showOnHomepage(true).build()
            );
            menuItemRepository.saveAll(items);
        }
    }

    private void seedCoupons() {
        if (couponRepository.count() == 0) {
            java.time.LocalDate today = java.time.LocalDate.now();
            List<Coupon> coupons = List.of(
                Coupon.builder().id("c1").code("WELCOME10").description("10% off your first online order").discountType("percentage").discountValue(10).minOrderValue(150).maxDiscount(50).validFrom(today.minusDays(5).toString()).validUntil(today.plusMonths(6).toString()).isActive(true).build(),
                Coupon.builder().id("c2").code("FLAT50").description("Flat ₹50 off orders above ₹300").discountType("fixed").discountValue(50).minOrderValue(300).maxDiscount(50).validFrom(today.minusDays(5).toString()).validUntil(today.plusMonths(6).toString()).isActive(true).build(),
                Coupon.builder().id("c3").code("LUMIERE20").description("Special 20% discount on orders above ₹500").discountType("percentage").discountValue(20).minOrderValue(500).maxDiscount(100).validFrom(today.minusDays(5).toString()).validUntil(today.plusMonths(6).toString()).isActive(true).build()
            );
            couponRepository.saveAll(coupons);
        }
    }

    private void seedFeatures() {
        if (featureRepository.count() == 0) {
            List<Feature> features = List.of(
                Feature.builder().id("f1").title("Organic & Artisanal").description("Every ingredient is handpicked from certified organic farms, with freshly roasted specialty coffee beans.").icon("FiAward").displayOrder(1).isActive(true).build(),
                Feature.builder().id("f2").title("Master Culinary Chefs").description("Our dishes are designed by seasoned chefs bringing authentic Mediterranean and European gastronomy to life.").icon("FiCoffee").displayOrder(2).isActive(true).build(),
                Feature.builder().id("f3").title("Lightning Fast Delivery").description("Temperature-controlled packaging ensures piping hot food arrives in under 30 minutes.").icon("FiTruck").displayOrder(3).isActive(true).build()
            );
            featureRepository.saveAll(features);
        }
    }

    private void seedTeam() {
        if (teamRepository.count() == 0) {
            List<TeamMember> team = List.of(
                TeamMember.builder().id("t1").name("Jean-Pierre Dupont").role("Executive Chef").bio("Over 18 years of culinary excellence across Paris and Milan.").image("https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400").showOnAbout(true).displayOrder(1).build(),
                TeamMember.builder().id("t2").name("Elena Rostova").role("Head Barista & Roaster").bio("Q-Grader certified barista specializing in single-origin specialty roast profiles.").image("https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400").showOnAbout(true).displayOrder(2).build(),
                TeamMember.builder().id("t3").name("Marco Rossi").role("Master Patissier").bio("Crafts delicate French viennoiseries and decadent artisan desserts every morning.").image("https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400").showOnAbout(true).displayOrder(3).build()
            );
            teamRepository.saveAll(team);
        }
    }

    private void seedReviews() {
        if (reviewRepository.count() == 0) {
            String nowIso = java.time.LocalDateTime.now().minusDays(2).toString();
            List<Review> reviews = List.of(
                Review.builder().id("r1").userId("demo001").userName("Sophia Miller").rating(5).comment("The Margherita pizza was exceptional! Crust was crisp with the perfect char, and the Flat White was perfection.").isPublished(true).showOnHomepage(true).createdAt(nowIso).date(java.time.LocalDate.now().minusDays(2).toString()).build(),
                Review.builder().id("r2").userId("demo001").userName("Alexander Wright").rating(5).comment("Lumière Café sets the gold standard for dining ambiance and food quality in the city. Highly recommended!").isPublished(true).showOnHomepage(true).createdAt(nowIso).date(java.time.LocalDate.now().minusDays(2).toString()).build(),
                Review.builder().id("r3").userId("demo001").userName("Priya Sharma").rating(5).comment("The Truffle Risotto was creamy, flavorful and aromatic. Fast delivery and delightful eco-friendly packaging.").isPublished(true).showOnHomepage(true).createdAt(nowIso).date(java.time.LocalDate.now().minusDays(2).toString()).build()
            );
            reviewRepository.saveAll(reviews);
        }
    }

    private void seedGallery() {
        if (galleryRepository.count() == 0) {
            List<GalleryImage> gallery = List.of(
                GalleryImage.builder().id("g1").title("Artisanal Brewing").description("Hand-poured V60 specialty drip coffee").url("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600").category("Coffee").isFeatured(true).build(),
                GalleryImage.builder().id("g2").title("Woodfired Pizza Oven").description("Neapolitan style pizzas baked fresh in our volcanic stone oven").url("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600").category("Food").isFeatured(true).build(),
                GalleryImage.builder().id("g3").title("Cozy Bistro Ambiance").description("Warm rustic interiors and candlelit evening seating").url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600").category("Interior").isFeatured(true).build()
            );
            galleryRepository.saveAll(gallery);
        }
    }

    private void seedBooks() {
        if (bookRepository.count() == 0) {
            List<Book> books = List.of(
                new Book(1L, "Microservices Architecture in Practice", 49.99, "Martin Fowler"),
                new Book(2L, "Spring Boot in Action", 39.99, "Craig Walls"),
                new Book(3L, "Designing Data-Intensive Applications", 55.00, "Martin Kleppmann")
            );
            bookRepository.saveAll(books);
        }
    }

    private void seedOrders() {
        if (orderRepository.count() == 0) {
            String itemsJson1 = "[{\"id\":\"menu001\",\"name\":\"Margherita Pizza\",\"price\":14.99,\"quantity\":1,\"image\":\"https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&h=350&fit=crop\"},{\"id\":\"menu003\",\"name\":\"Artisanal Flat White\",\"price\":5.50,\"quantity\":1,\"image\":\"https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&h=350&fit=crop\"}]";
            String itemsJson2 = "[{\"id\":\"menu002\",\"name\":\"Truffle Mushroom Risotto\",\"price\":18.50,\"quantity\":1,\"image\":\"https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500&h=350&fit=crop\"},{\"id\":\"menu004\",\"name\":\"Belgian Chocolate Soufflé\",\"price\":9.00,\"quantity\":1,\"image\":\"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=350&fit=crop\"}]";
            String itemsJson3 = "[{\"id\":\"menu005\",\"name\":\"Mediterranean Falafel Bowl\",\"price\":13.25,\"quantity\":1,\"image\":\"https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=350&fit=crop\"},{\"id\":\"menu006\",\"name\":\"Cold Brew Tonic\",\"price\":6.00,\"quantity\":1,\"image\":\"https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&h=350&fit=crop\"}]";

            java.time.LocalDateTime now = java.time.LocalDateTime.now();

            List<Order> orders = List.of(
                Order.builder()
                    .id("ord001")
                    .orderNumber("ORD-1001")
                    .userId("demo001")
                    .userName("Demo User")
                    .userEmail("demo@demo.com")
                    .userPhone("+91-98765-43210")
                    .items(itemsJson1)
                    .totalPrice(20.49)
                    .deliveryAddress("456 Demo Street, Bandra West, Mumbai 400050")
                    .paymentMethod("UPI")
                    .paymentStatus("paid")
                    .utrNumber("UPI982347102938")
                    .transactionId("TXN_1001_982347")
                    .status("delivered")
                    .createdAt(now.minusHours(3).toString())
                    .build(),

                Order.builder()
                    .id("ord002")
                    .orderNumber("ORD-1002")
                    .userId("user_aman")
                    .userName("Aman Agarwal")
                    .userEmail("aman@example.com")
                    .userPhone("+91-98765-11223")
                    .items(itemsJson2)
                    .totalPrice(27.50)
                    .deliveryAddress("Suite 402, Sea Green Heights, Worli, Mumbai 400018")
                    .paymentMethod("UPI")
                    .paymentStatus("pending")
                    .utrNumber("UPI837492019283")
                    .transactionId("TXN_1002_837492")
                    .status("pending")
                    .createdAt(now.minusMinutes(25).toString())
                    .build(),

                Order.builder()
                    .id("ord003")
                    .orderNumber("ORD-1003")
                    .userId("user_sarah")
                    .userName("Sarah Jenkins")
                    .userEmail("sarah.j@example.com")
                    .userPhone("+91-98765-55443")
                    .items(itemsJson3)
                    .totalPrice(19.25)
                    .deliveryAddress("Bungalow 7, Pali Hill, Mumbai 400050")
                    .paymentMethod("UPI")
                    .paymentStatus("paid")
                    .utrNumber("UPI492018472910")
                    .transactionId("TXN_1003_492018")
                    .status("confirmed")
                    .createdAt(now.minusMinutes(50).toString())
                    .build()
            );
            orderRepository.saveAll(orders);
        }
    }

    private void seedReservations() {
        if (reservationRepository.count() == 0) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            List<Reservation> reservations = List.of(
                Reservation.builder()
                    .id("res001")
                    .userId("demo001")
                    .guestName("Demo User")
                    .guestEmail("demo@demo.com")
                    .guestPhone("+91-98765-43210")
                    .numberOfGuests(2)
                    .date(java.time.LocalDate.now().plusDays(2).toString())
                    .timeSlot("19:30")
                    .specialRequests("Window booth table preferred")
                    .status("confirmed")
                    .tableNumber(4)
                    .createdAt(now.minusHours(5).toString())
                    .build(),

                Reservation.builder()
                    .id("res002")
                    .userId("user_aman")
                    .guestName("Aman Agarwal")
                    .guestEmail("aman@example.com")
                    .guestPhone("+91-98765-11223")
                    .numberOfGuests(4)
                    .date(java.time.LocalDate.now().plusDays(3).toString())
                    .timeSlot("20:00")
                    .specialRequests("Celebrating anniversary - quiet corner table")
                    .status("confirmed")
                    .tableNumber(12)
                    .createdAt(now.minusHours(2).toString())
                    .build()
            );
            reservationRepository.saveAll(reservations);
        }
    }
}
