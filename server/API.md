# Restaurant Delivery App - API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## User Endpoints (`/api/users`)

### Authentication

#### Register User
```
POST /users/register
```
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "role": "customer" | "owner" | "delivery_person" (optional, default: "customer")
}
```
**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": { ... },
  "token": "jwt_token"
}
```

#### Login
```
POST /users/login
```
**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "jwt_token"
}
```

#### Get Profile
```
GET /users/profile
```
**Auth:** Required
**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "customer"
  }
}
```

---

### Address Management

#### Get All Addresses
```
GET /users/address
```
**Auth:** Required
**Response:** `200 OK`
```json
{
  "addresses": [
    {
      "id": 1,
      "full_name": "string",
      "phone": "string",
      "address_line1": "string",
      "address_line2": "string",
      "city": "string",
      "state": "string",
      "postal_code": "string",
      "is_default": true
    }
  ]
}
```

#### Add Address
```
POST /users/address
```
**Auth:** Required
**Body:**
```json
{
  "full_name": "string",
  "phone": "string",
  "address_line1": "string",
  "address_line2": "string (optional)",
  "city": "string",
  "state": "string",
  "postal_code": "string",
  "is_default": false
}
```

#### Update Address
```
PUT /users/address/:id
```
**Auth:** Required
**Body:** Same as Add Address

#### Delete Address
```
DELETE /users/address/:id
```
**Auth:** Required

#### Set Default Address
```
PATCH /users/address/:id/default
```
**Auth:** Required

---

### Cart Management

#### Get Cart
```
GET /users/cart
```
**Auth:** Required
**Response:** `200 OK`
```json
{
  "cart": {
    "id": 1,
    "restaurant_id": 1,
    "items": [
      {
        "id": 1,
        "menu_item_id": 1,
        "name": "string",
        "price": "10.00",
        "quantity": 2,
        "image": "url"
      }
    ],
    "subtotal": "20.00"
  }
}
```

#### Add Item to Cart
```
POST /users/cart/add-item
```
**Auth:** Required
**Body:**
```json
{
  "menu_item_id": 1,
  "quantity": 1
}
```

#### Update Cart Item Quantity
```
PATCH /users/cart/update
```
**Auth:** Required
**Body:**
```json
{
  "menu_item_id": 1,
  "quantity": 3
}
```

#### Remove Item from Cart
```
POST /users/cart/remove-item
```
**Auth:** Required
**Body:**
```json
{
  "menu_item_id": 1
}
```

#### Clear Cart
```
DELETE /users/cart/clear
```
**Auth:** Required

---

### Orders

#### Place Order
```
POST /users/orders/place
```
**Auth:** Required
**Body:**
```json
{
  "address_id": 1,
  "payment_method": "card" | "upi" | "cash" | "wallet"
}
```
**Response:** `201 Created`
```json
{
  "message": "Order placed successfully",
  "order": {
    "id": 1,
    "total_amount": "150.00",
    "status": "pending"
  }
}
```

#### Get My Orders
```
GET /users/orders
```
**Auth:** Required
**Response:** `200 OK`
```json
{
  "orders": [
    {
      "id": 1,
      "restaurant_name": "string",
      "total_amount": "150.00",
      "status": "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled",
      "created_at": "timestamp"
    }
  ]
}
```

#### Get Order Details
```
GET /users/orders/:id
```
**Auth:** Required
**Response:** `200 OK`
```json
{
  "order": {
    "id": 1,
    "status": "preparing",
    "total_amount": "150.00",
    "subtotal": "130.00",
    "delivery_fee": "20.00",
    "tax": "0.00",
    "items": [...],
    "address": {...},
    "restaurant": {...}
  }
}
```

#### Cancel Order
```
PATCH /users/orders/:id/cancel
```
**Auth:** Required

---

### Payments

#### Create Payment Intent
```
POST /users/payments/create-intent
```
**Auth:** Required
**Body:**
```json
{
  "order_id": 1
}
```

---

## Public Endpoints (`/api/admin`)

### Categories

#### Get All Categories
```
GET /admin/category
```
**Auth:** Not required
**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Pizza",
    "img_url": "url"
  }
]
```

### Restaurants

#### Get All Restaurants
```
GET /admin/app/restaurants
```
**Auth:** Not required
**Query Parameters:**
- `category` (optional): Filter by category ID

**Response:** `200 OK`
```json
{
  "message": "Restaurants fetched successfully",
  "restaurants": [
    {
      "id": 1,
      "name": "string",
      "address": "string",
      "image_url": "url",
      "rating": "4.5",
      "is_open": true,
      "delivery_time": 30,
      "delivery_fee": "20.00"
    }
  ]
}
```

#### Get Restaurant Details
```
GET /admin/app/restaurants/:id
```
**Auth:** Not required
**Response:** `200 OK`
```json
{
  "success": true,
  "restaurant": {
    "id": 1,
    "name": "string",
    "address": "string",
    "description": "string",
    "image_url": "url",
    "rating": "4.5",
    "phone": "string",
    "is_open": true,
    "delivery_time": 30,
    "delivery_fee": "20.00"
  },
  "categories": [
    { "id": 1, "name": "Pizza" }
  ],
  "menuItems": [
    {
      "id": 1,
      "name": "string",
      "price": "10.00",
      "image": "url",
      "category_id": 1,
      "category_name": "Pizza"
    }
  ]
}
```

---

## Admin Endpoints (`/api/admin`)

### Categories (Admin)

#### Create Category
```
POST /admin/category
```
**Auth:** Required (Admin)
**Content-Type:** `multipart/form-data`
**Body:**
- `name`: string
- `file`: image file

### Restaurants (Admin)

#### Create Restaurant
```
POST /admin/app/restaurant
```
**Auth:** Required (Admin)
**Content-Type:** `multipart/form-data`
**Body:**
- `name`: string
- `address`: string
- `owner_id`: number
- `description`: string
- `phone`: string
- `file`: image file

#### Update Restaurant
```
PATCH /admin/app/restaurant
```
**Auth:** Required (Admin)
**Content-Type:** `multipart/form-data`

---

## Owner Endpoints (`/api/owner`)

All owner endpoints require authentication with `role: "owner"`.

### Restaurant Management

#### Get My Restaurants
```
GET /owner/restaurants
```
**Auth:** Required (Owner)
**Response:** `200 OK`
```json
{
  "restaurants": [
    {
      "id": 1,
      "name": "string",
      "image_url": "url",
      "is_open": true
    }
  ]
}
```

#### Get Restaurant Details
```
GET /owner/restaurants/:restaurantId
```
**Auth:** Required (Owner)

#### Update Restaurant
```
PUT /owner/restaurants/:restaurantId
```
**Auth:** Required (Owner)
**Content-Type:** `multipart/form-data`
**Body:**
- `name`: string
- `description`: string
- `address`: string
- `phone`: string
- `delivery_time`: number
- `delivery_fee`: number
- `is_open`: boolean
- `file`: image file (optional)

---

### Menu Items Management

#### Get Menu Items
```
GET /owner/restaurants/:restaurantId/menu-items
```
**Auth:** Required (Owner)

#### Add Menu Item
```
POST /owner/restaurants/:restaurantId/menu-items
```
**Auth:** Required (Owner)
**Content-Type:** `multipart/form-data`
**Body:**
- `name`: string
- `description`: string (optional)
- `price`: number
- `category_id`: number
- `file`: image file (optional)

#### Update Menu Item
```
PUT /owner/restaurants/:restaurantId/menu-items/:id
```
**Auth:** Required (Owner)
**Content-Type:** `multipart/form-data`

#### Delete Menu Item
```
DELETE /owner/restaurants/:restaurantId/menu-items/:id
```
**Auth:** Required (Owner)

#### Toggle Menu Item Availability
```
PATCH /owner/restaurants/:restaurantId/menu-items/:id/toggle
```
**Auth:** Required (Owner)

---

### Orders Management

#### Get Restaurant Orders
```
GET /owner/restaurants/:restaurantId/orders
```
**Auth:** Required (Owner)
**Response:** `200 OK`
```json
{
  "orders": [
    {
      "id": 1,
      "status": "pending",
      "total_amount": "150.00",
      "created_at": "timestamp",
      "customer_name": "string",
      "customer_phone": "string"
    }
  ]
}
```

#### Update Order Status
```
PATCH /owner/restaurants/:restaurantId/orders/:id/status
```
**Auth:** Required (Owner)
**Body:**
```json
{
  "status": "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled"
}
```

---

### Categories (for Menu Items)

#### Get All Categories
```
GET /owner/categories
```
**Auth:** Required (Owner)
**Response:** `200 OK`
```json
{
  "categories": [
    { "id": 1, "name": "Pizza" },
    { "id": 2, "name": "Burger" }
  ]
}
```

---

## Error Responses

All endpoints may return these error responses:

**400 Bad Request**
```json
{
  "message": "Validation error message"
}
```

**401 Unauthorized**
```json
{
  "message": "Authorization Token is missing!" | "Invalid Token format!" | "Unauthorized"
}
```

**403 Forbidden**
```json
{
  "message": "Access denied. Owner role required."
}
```

**404 Not Found**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "message": "Internal server error"
}
```

---

## Order Status Flow

```
pending → confirmed → preparing → ready → out_for_delivery → delivered
    ↓         ↓           ↓         ↓            ↓
    └─────────┴───────────┴─────────┴────────────┴──→ cancelled
```

---

## Data Models

### User Roles
- `customer` - Regular app user
- `owner` - Restaurant owner
- `delivery_person` - Delivery personnel
- `admin` - System administrator

### Payment Methods
- `card` - Credit/Debit card
- `upi` - UPI payment
- `cash` - Cash on delivery
- `wallet` - In-app wallet
