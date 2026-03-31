# Restaurant App

A full-stack food delivery application built with React Native (Expo) and Node.js/Express. Features multi-role support for customers, restaurant owners, delivery partners, and admins.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [User Roles & Workflows](#user-roles--workflows)
- [Payment Integration](#payment-integration)

---

## Tech Stack

### Frontend (Client)
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Mobile framework |
| Expo | 54.0 | Development platform |
| Expo Router | 6.0 | File-based routing |
| NativeWind | 4.2 | TailwindCSS for React Native |
| Stripe React Native | 0.61 | Payment processing |
| TypeScript | 5.9 | Type safety |

### Backend (Server)
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | Runtime |
| Express | 5.2.1 | Web framework |
| Drizzle ORM | 0.45.1 | Database ORM |
| PostgreSQL (Neon) | - | Database |
| JWT | 9.0.3 | Authentication |
| Stripe | 21.0.1 | Payment processing |
| Cloudinary | 1.41.3 | Image storage |
| Winston | 3.19.0 | Logging |

---

## Features

### Customer Features
- Browse restaurants and menus
- Add items to cart
- Place orders with multiple payment methods
- Real-time order tracking
- Manage delivery addresses
- View order history
- Rate and review restaurants

### Restaurant Owner Features
- Manage restaurant profile
- Add, edit, delete menu items
- Toggle item availability
- View and manage incoming orders
- Update order status

### Delivery Partner Features
- View available orders ready for pickup
- Self-assign deliveries
- Track active deliveries
- Update delivery status
- View earnings (daily, weekly, monthly)
- Delivery history

### Admin Features
- Create and manage restaurants
- Create food categories
- Manage users
- Create delivery partner accounts

---

## Project Structure

```
Restaurant/
├── client/                     # React Native Mobile App
│   ├── app/                    # Expo Router screens
│   │   ├── (auth)/             # Authentication screens
│   │   ├── (tabs)/             # Main tab navigation
│   │   ├── admin/              # Admin dashboard
│   │   ├── owner/              # Restaurant owner screens
│   │   ├── delivery/           # Delivery partner screens
│   │   ├── profile/            # User profile screens
│   │   ├── cart.tsx            # Shopping cart
│   │   ├── checkout.tsx        # Checkout flow
│   │   ├── order/              # Order details
│   │   └── restaurant/         # Restaurant details
│   ├── api/                    # API client functions
│   ├── context/                # React Context (User, Cart)
│   ├── services/               # API service layer
│   └── utils/                  # Utility functions
│
└── server/                     # Node.js Backend
    ├── src/
    │   ├── controllers/        # Request handlers
    │   │   ├── users/          # User operations
    │   │   ├── admin/          # Admin operations
    │   │   ├── owner/          # Owner operations
    │   │   ├── delivery-person/# Delivery operations
    │   │   └── webhookController.ts
    │   ├── routes/             # Express routes
    │   ├── middlewares/        # Auth & role-based middleware
    │   ├── services/           # Business logic
    │   ├── config/             # Cloudinary config
    │   ├── db/                 # Database setup & schema
    │   └── server.ts           # App entry point
    ├── drizzle/                # Database migrations
    └── types/                  # TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or Neon account)
- Stripe account
- Cloudinary account
- Expo CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Restaurant
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables** (see below)

5. **Run database migrations**
   ```bash
   cd server
   npm run drizzle:push
   ```

6. **Start the server**
   ```bash
   cd server
   npm run dev
   ```

7. **Start the client**
   ```bash
   cd client
   npx expo start
   ```

---

## Environment Variables

### Server (`server/.env`)

```env
# Database
DB_CONNECTION_URI=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-jwt-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=3000
```

### Client (`client/.env`)

```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | All app users (customers, owners, delivery, admin) |
| `addresses` | User delivery addresses |
| `restaurants` | Restaurant profiles |
| `menu_items` | Food items |
| `categories` | Food categories |
| `cart` | Shopping carts |
| `cart_items` | Items in cart |
| `orders` | Customer orders |
| `order_items` | Items in order |
| `payments` | Payment records |
| `deliveries` | Delivery assignments |
| `reviews` | Restaurant reviews |
| `favorites` | Favorite restaurants |

### Enums

```
user_role: customer, owner, delivery_person, admin
order_status: pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled
payment_status: pending, completed, failed
payment_method: card, upi, cash, wallet
delivery_status: pending, assigned, picked_up, delivered, cancelled
```

### Database Commands

```bash
# Generate migrations
npm run drizzle:generate

# Push schema to database
npm run drizzle:push

# Run migrations
npm run drizzle:migrate
```

---

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login user |
| GET | `/api/users/profile` | Get user profile |

### Addresses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/address` | Get all addresses |
| POST | `/api/users/address` | Add new address |
| PUT | `/api/users/address/:id` | Update address |
| DELETE | `/api/users/address/:id` | Delete address |
| PATCH | `/api/users/address/:id/default` | Set default address |

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/cart` | Get cart |
| POST | `/api/users/cart/add-item` | Add item to cart |
| POST | `/api/users/cart/remove-item` | Remove item |
| PATCH | `/api/users/cart/update` | Update quantity |
| DELETE | `/api/users/cart/clear` | Clear cart |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/orders/place` | Place order |
| GET | `/api/users/orders` | Get all orders |
| GET | `/api/users/orders/:id` | Get order details |
| PATCH | `/api/users/orders/:id/cancel` | Cancel order |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/payments/create-intent` | Create Stripe PaymentIntent |

### Owner Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/owner/restaurants` | Get owner's restaurants |
| GET | `/api/owner/restaurants/:id` | Get restaurant details |
| PUT | `/api/owner/restaurants/:id` | Update restaurant |
| GET | `/api/owner/restaurants/:id/menu-items` | Get menu items |
| POST | `/api/owner/restaurants/:id/menu-items` | Add menu item |
| PUT | `/api/owner/restaurants/:id/menu-items/:itemId` | Update menu item |
| DELETE | `/api/owner/restaurants/:id/menu-items/:itemId` | Delete menu item |
| PATCH | `/api/owner/restaurants/:id/menu-items/:itemId/toggle` | Toggle availability |
| GET | `/api/owner/restaurants/:id/orders` | Get restaurant orders |
| PATCH | `/api/owner/restaurants/:id/orders/:orderId/status` | Update order status |

### Delivery Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/delivery/available-orders` | Get available orders |
| POST | `/api/delivery/orders/:id/pick` | Pick an order |
| GET | `/api/delivery/my-deliveries` | Get assigned deliveries |
| GET | `/api/delivery/deliveries/:id` | Get delivery details |
| PATCH | `/api/delivery/deliveries/:id/status` | Update delivery status |
| GET | `/api/delivery/earnings` | Get earnings |
| GET | `/api/delivery/history` | Get delivery history |

### Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/category` | Create category |
| GET | `/api/admin/category` | Get all categories |
| POST | `/api/admin/app/restaurant` | Create restaurant |
| GET | `/api/admin/app/restaurants` | Get all restaurants |
| POST | `/api/admin/users/delivery-person` | Create delivery person |
| GET | `/api/admin/users` | Get all users |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhook/stripe` | Stripe payment webhooks |

---

## User Roles & Workflows

### Customer Workflow

```
1. Register/Login
2. Browse restaurants
3. View menu items
4. Add items to cart
5. Proceed to checkout
6. Select delivery address
7. Complete payment (Stripe)
8. Track order status
9. Receive delivery
10. Rate restaurant (optional)
```

### Order Status Flow

```
pending → confirmed → preparing → ready → out_for_delivery → delivered
                                                           ↘ cancelled
```

### Restaurant Owner Workflow

```
1. Login as owner
2. View restaurant dashboard
3. Manage menu items (add/edit/delete)
4. View incoming orders
5. Update order status (preparing → ready)
6. Track order pickups
```

### Delivery Partner Workflow

```
1. Login as delivery partner
2. View available orders (status = ready)
3. Pick/assign order to self
4. Pick up from restaurant
5. Update status to "picked_up"
6. Deliver to customer
7. Update status to "delivered"
8. View earnings
```

### Delivery Status Flow

```
pending → assigned → picked_up → delivered
                              ↘ cancelled
```

---

## Payment Integration

### Stripe Integration

The app uses Stripe for payment processing with webhook-based order creation.

**Payment Flow:**

1. Customer initiates checkout with selected address
2. Frontend calls `/api/users/payments/create-intent`
3. Backend creates Stripe PaymentIntent with order metadata:
   - user_id
   - cart_id
   - address_id
   - restaurant_id
   - amounts (subtotal, tax, delivery_fee, discount, total)
4. Frontend displays Stripe payment sheet
5. Customer completes payment
6. Stripe sends webhook to `/api/webhook/stripe`
7. Webhook handler:
   - Verifies webhook signature
   - Extracts order metadata
   - Creates order in database
   - Creates order items
   - Records payment
   - Clears user's cart
8. Customer sees order confirmation

**Webhook Events Handled:**
- `payment_intent.succeeded` - Creates order
- `payment_intent.payment_failed` - Logs failure

**Idempotency:** Duplicate payment intents are detected to prevent duplicate orders.

### Local Development with Stripe Webhooks

To test Stripe webhooks locally, you need to forward webhook events to your local server using the Stripe CLI:

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows (scoop)
   scoop install stripe

   # Linux
   # Download from https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```

4. **Copy the webhook signing secret** from the CLI output and add it to your `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

Keep the `stripe listen` command running in a separate terminal while testing payments locally.

---

## Security

- **Authentication:** JWT tokens with 24-hour expiry
- **Password Hashing:** bcrypt with 10 salt rounds
- **Token Storage:** expo-secure-store on client
- **Authorization:** Role-based middleware
- **Payment Security:** Stripe webhook signature verification
- **CORS:** Configured for frontend access

---

## Scripts

### Server

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server

# Database
npm run drizzle:generate  # Generate migrations
npm run drizzle:push      # Push schema to DB
npm run drizzle:pull      # Pull schema from DB
npm run drizzle:migrate   # Run migrations
```

### Client

```bash
npx expo start     # Start Expo development server
npx expo start --ios      # Start on iOS simulator
npx expo start --android  # Start on Android emulator
npm run build      # Build for production
```

---

## Logging

The server uses Winston for logging:
- Log file: `app.log`
- Log levels: info, error, debug, warn

---

## Testing

```bash
cd server
npm test
```


