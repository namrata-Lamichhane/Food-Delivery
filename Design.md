# Design.md — UI/UX Design System

> **Based on:** Verified inspection of all CSS and JSX files in `frontend/` and `admin/` (October 2026).  
> All values reflect the actual implementation.

---

## 1. Branding and Design Identity

| Property | Customer Frontend | Admin Management Panel |
|----------|-------------------|------------------------|
| **App Name** | Food Del | Food Del Admin Panel |
| **Tagline** | "Order your favourite food here" | "Restaurant Operations & Catalog Management" |
| **Primary Brand Color** | Tomato — `#FF6347` / `tomato` | Tomato & Slate Blue (`#FF6347` & `#1e293b`) |
| **Logo** | `assets/logo.png` (92px width) | `assets/logo.png` (88px width) |
| **Favicon** | `/favicon.svg` | `/favicon.svg` |
| **Typography** | `Outfit` (100–900 variable font) | `Outfit` & System Sans (`-apple-system, Segoe UI, Roboto`) |

---

## 2. Color Palette

### 2.1 Customer Facing (`frontend/`)

| Role | Color Name | Hex / Value | Description |
|------|------------|-------------|-------------|
| Primary / Accent | Tomato | `#FF6347` | Main brand color, buttons, active dots, borders |
| Primary Hover | Darker Tomato | `#e8533b` | Hover state for primary buttons |
| Light Accent | Pale Tomato | `#fff4f2` | Button hover background, soft highlight |
| Headings | Near Black | `#252525` | Page titles and dish titles |
| Body Text | Dark Gray | `#393633` | Descriptions and paragraphs |
| Muted Text | Slate Gray | `#49557e` | Navbar links and secondary indicators |
| Price Text | Muted Red | `#b95742` | Dish prices and order totals |
| Border | Light Gray | `#e6e6e6` / `#dedede` | Table dividers and input outlines |
| Card Background | Pure White | `#ffffff` | Dish cards and modal dialogs |

### 2.2 Admin Panel (`admin/`)

| Role | Hex / Value | Description |
|------|-------------|-------------|
| Admin Header | `#ffffff` with `#e2e8f0` border | Clean white navigation header |
| Sidebar Background | `#f8fafc` | Subtle off-white sidebar with active state highlights |
| Active Nav Pill | `#fff4f2` text `#ff6347` | Highlighted sidebar link with tomato border-left |
| Stat Card - Foods | `#eff6ff` with `#3b82f6` icon | Light blue metric background |
| Stat Card - Users | `#f0fdf4` with `#22c55e` icon | Light green metric background |
| Stat Card - Orders | `#fef3c7` with `#f59e0b` icon | Warm amber metric background |
| Status: Processing | `#fff7ed` text `#ea580c` | Amber badge for `Food Processing` |
| Status: Out for Delivery | `#eff6ff` text `#2563eb` | Blue badge for `Out for Delivery` |
| Status: Delivered | `#f0fdf4` text `#16a34a` | Green badge for `Delivered` |
| Status: Cancelled | `#fef2f2` text `#dc2626` | Red badge for `Cancelled` |

---

## 3. Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
```

- **Font Family:** `Outfit`, sans-serif
- **Base Size:** 16px
- **Hierarchy:**
  - Hero Display: `max(4.5vw, 22px)` / Weight 500
  - Page & Section Headings: `clamp(24px, 2vw, 30px)` / Weight 600
  - Card Titles: `clamp(17px, 1.25vw, 21px)` / Weight 500
  - Body & Form Text: 14px–16px / Weight 400
  - Badges & Microcopy: 12px–13px / Weight 500

---

## 4. Component Design Specifications

### 4.1 Navigation (`frontend/src/components/Navbar/`)
- Brand logo on left, centered hash-navigation links (`Home`, `Menu`, `Mobile app`, `Contact us`).
- Right actions: Search icon, Cart button with conditional item indicator dot (`.dot`), and Auth state.
- **Logged out:** "Sign in" pill button (`border: 1px solid tomato`, rounded 50px).
- **Logged in:** Avatar image (`profile_image.png`) with click-toggled dropdown containing "Orders" (`/orders`) and "Logout".

### 4.2 Hero Banner (`frontend/src/components/Navbar/Header/`)
- Responsive background banner (`header_img.png`, height `34vw`, min-height 240px).
- Fade-in call-to-action text overlay with smooth scroll button to `#explore-menu`.

### 4.3 Category Menu (`frontend/src/components/ExploreMenu/`)
- Horizontal flex row displaying 8 category icons (`Salad`, `Rolls`, `Desserts`, `Sandwich`, `Cake`, `Pure Veg`, `Pasta`, `Noodles`).
- Active category highlights with a circular tomato ring border.
- Clicking an active category resets filter to `'All'`.

### 4.4 Food Display & Dish Cards (`frontend/src/components/FoodDisplay/`)
- Auto-fitting responsive grid (`grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr))`).
- Card lift on hover (`translateY(-4px)`), smooth image zoom (`scale(1.035)`).
- Circular Add button over card corner; transitions to a pill-shaped counter (`-` / qty / `+`) when quantity > 0.
- Rating stars and price display in Nepali Rupees (`Rs. {price}`).

### 4.5 Cart Page (`frontend/src/pages/Cart/`)
- Table grid showing item thumbnail, name, unit price, quantity, line total, and quick remove `×`.
- Two-column bottom section: Cart Totals card (Subtotal, Delivery Fee Rs. 50, Total) and Promo Code input.
- Empty state: Friendly prompt with direct link back to menu.

### 4.6 Place Order & Checkout (`frontend/src/pages/PlaceOrder/`)
- Two-column layout with delivery address form (9 fields) and Order Summary sidebar.
- Order confirmation state: displays confirmed Order Reference ID, total amount, Cash on Delivery note, and navigation links.

### 4.7 My Orders History (`frontend/src/pages/MyOrders/`)
- Lists historical customer orders with package icon, item summary (`{name} x {qty}`), order date, formatted price, item count, and status badge.
- Interactive "Track Order" button revealing shipment status timeline.

### 4.8 Toast Notification System (`frontend/src/context/ToastContext.jsx`)
- Lightweight, custom React toast alert rendering at bottom-right of viewport.
- Auto-dismisses after 3000ms with fade-in and slide-out transitions.

---

## 5. Admin Panel Design Specifications

### 5.1 Admin Portal Layout (`admin/src/App.jsx`)
- Fixed top navigation header (`Navbar.jsx`) with mobile drawer toggle, admin name, avatar, and logout.
- Responsive sidebar navigation (`Sidebar.jsx`) with Dashboard, Add Food, Manage Food, Manage Orders, and Manage Users.
- Content area with responsive padding and fluid layout.

### 5.2 Dashboard (`admin/src/Dashboard/`)
- 3 Metric Summary Cards:
  1. **Total Food Items:** Displays catalog size, links to Manage Food.
  2. **Total Registered Customers:** Displays customer count, links to Users.
  3. **Total Orders:** Displays total orders and computed non-cancelled revenue.
- Order Status Distribution badges with live counts.
- Recent Orders quick-table with customer names, items, and status indicators.

### 5.3 Food Catalog Management (`admin/src/List/` and `admin/src/Add/`)
- Search bar and category dropdown filters.
- Food table displaying image, name, category, price, and action buttons (`Edit` and `Delete`).
- Modal forms with real-time image preview (`URL.createObjectURL`) and file validation (max 5MB, JPEG/PNG/WebP).
- Safe deletion modal requiring explicit confirmation.

### 5.4 Order Management (`admin/src/Orders/`)
- Order cards showing customer details, full address, contact phone, item breakdowns, and total amounts.
- Live status dropdown allowing instant PATCH updates to `Food Processing`, `Out for Delivery`, `Delivered`, or `Cancelled`.
- Full Customer Delivery Details inspector modal.

### 5.5 Customer Account Directory (`admin/src/Users/`)
- Customer directory table displaying user names, registered emails, join dates, and account roles.
- Filter and search bar for quick customer lookup.
- Safe projection: passwords and private cart state are never displayed or transmitted.

---

## 6. Responsive Breakpoints

| Breakpoint | Applied Styles |
|------------|----------------|
| `> 1050px` | Standard full desktop view. |
| `<= 1050px`| Navbar brand and link gap scale down smoothly. |
| `<= 900px` | Compact table layouts; admin sidebar optimizes padding. |
| `<= 750px` | Customer navbar collapses menu links; admin sidebar turns into a sliding drawer overlay. |
| `<= 700px` | Cart table switches from table columns to responsive vertical card layout. |
| `<= 680px` | Place Order checkout collapses from 2 columns to a single vertical column. |
| `<= 480px` | Food display switches to full-width cards; mobile touch targets expanded to 44px+. |
