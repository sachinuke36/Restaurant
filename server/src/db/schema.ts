import { sql } from "drizzle-orm";
import { check } from "drizzle-orm/pg-core";

import { eq } from "drizzle-orm";
import { boolean } from "drizzle-orm/pg-core";
import {
  pgTable,
  pgEnum,
  integer,
  varchar,
  timestamp,
  numeric,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* =========================
   ENUMS
========================= */

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "owner",
  "delivery_person",
  "admin",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "card",
  "upi",
  "cash",
  "wallet",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "assigned",
  "picked_up",
  "delivered",
  "cancelled",
]);

export const adminRoleEnum = pgEnum("admin_role", ["super_admin", "support"]);

/* =========================
   USERS
========================= */

export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("customer"),
  phone: varchar("phone", { length: 20 }).notNull(),
  is_verified: boolean("is_verified").default(false),
  is_active: boolean("is_active").default(true),
  profile_image: varchar("profile_image", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const addresses = pgTable(
  "address",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    addressLine1: varchar("address_line1", { length: 255 }).notNull(),
    addressLine2: varchar("address_line2", { length: 255 }),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    country: varchar("country", { length: 100 }).default("India"),
    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userAddressIndex: uniqueIndex("user_default_address")
      .on(table.userId)
      .where(eq(table.isDefault, true)),
  }),
);

/* =========================
   RESTAURANTS
========================= */

export const restaurantsTable = pgTable("restaurants", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  owner_id: integer("owner_id")
    .notNull()
    .references(() => usersTable.id),
  description: varchar("description"),
  image_url: varchar("image_url", { length: 255 }),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  publicId: varchar("public_id", { length: 255 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  is_open: boolean("is_open").default(true),
  is_active: boolean("is_active").default(true),
  delivery_time: integer("delivery_time"),
  delivery_fee: numeric("delivery_fee", { precision: 10, scale: 2 }).default(
    "0",
  ),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================
   MENU ITEMS
========================= */

export const menuItemsTable = pgTable("menu_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  restaurant_id: integer("restaurant_id")
    .notNull()
    .references(() => restaurantsTable.id),
  img_url: varchar("img_url", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  is_available: boolean("is_available").default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================
   CART ITEMS
========================= */

export const cartTable = pgTable(
  "cart",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    customer_id: integer("customer_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    restaurant_id: integer("restaurant_id")
      .notNull()
      .references(() => restaurantsTable.id),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniquUserCart: uniqueIndex("unique_user_cart").on(table.customer_id),
  }),
);

export const cartItemsTable = pgTable(
  "cart_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    menu_item_id: integer("menu_item_id")
      .notNull()
      .references(() => menuItemsTable.id),
    cart_id: integer("cart_id")
      .notNull()
      .references(() => cartTable.id, {onDelete: "cascade"}),
    quantity: integer("quantity").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueCartItem: uniqueIndex("unique_cart_item").on(
      table.cart_id,
      table.menu_item_id,
    ),
  }),
);

/* =========================
   ORDERS
========================= */

export const ordersTable = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  customer_id: integer("customer_id")
    .notNull()
    .references(() => usersTable.id),
  restaurant_id: integer("restaurant_id")
    .notNull()
    .references(() => restaurantsTable.id),
  total_amount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric("subtotal",{precision:10,scale:2}).notNull(),
  delivery_fee: numeric("delivery_fee",{precision:10,scale:2}).default("0"),
  tax: numeric("tax",{precision:10,scale:2}).default("0"),
  discount: numeric("discount",{precision:10,scale:2}).default("0"),
  status: orderStatusEnum("status").notNull(),
  address_id: integer("address_id")
  .notNull()
  .references(()=>addresses.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});


export const orderStatusHistory = pgTable("order_status_history",{
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  order_id: integer("order_id")
    .notNull()
    .references(()=>ordersTable.id,{onDelete:"cascade"}),
  status: orderStatusEnum("status").notNull(),
  created_at: timestamp("created_at").defaultNow()
})

/* =========================
   ORDER ITEMS
========================= */

export const orderItemsTable = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  order_id: integer("order_id")
    .notNull()
    .references(() => ordersTable.id),
  menu_item_id: integer("menu_item_id")
    .notNull()
    .references(() => menuItemsTable.id),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  total_price: numeric("total_price",{precision:10,scale:2}).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================
   PAYMENTS
========================= */

export const paymentsTable = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  order_id: integer("order_id")
    .notNull()
    .references(() => ordersTable.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").notNull(),
  payment_provider_id: varchar("payment_provider_id",{length:255}),
  transaction_id: varchar("transaction_id",{length:255}),
  payment_method: paymentMethodEnum("payment_method").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================
   REVIEWS
========================= */

export const reviewsTable = pgTable(
  "reviews",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    customer_id: integer("customer_id")
      .notNull()
      .references(() => usersTable.id),
    restaurant_id: integer("restaurant_id")
      .notNull()
      .references(() => restaurantsTable.id),
    rating: integer("rating").notNull(),
    comment: varchar("comment", { length: 255 }),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueReview: uniqueIndex("unique_review").on(
      table.customer_id,
      table.restaurant_id,
    ),
    ratingCheck: check("rating_check", sql`rating BETWEEN 1 AND 5`),
  }),
);

/* =========================
   FAVORITES
========================= */

export const favoritesTable = pgTable(
  "favorites",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    customer_id: integer("customer_id")
      .notNull()
      .references(() => usersTable.id),
    restaurant_id: integer("restaurant_id")
      .notNull()
      .references(() => restaurantsTable.id),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueFavorite: uniqueIndex("unique_favorite").on(
      table.customer_id,
      table.restaurant_id,
    ),
  }),
);

/* =========================
   DELIVERIES
========================= */

export const deliveriesTable = pgTable("deliveries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  order_id: integer("order_id")
    .notNull()
    .references(() => ordersTable.id),
  delivery_person_id: integer("delivery_person_id")
    .notNull()
    .references(() => usersTable.id),
  status: deliveryStatusEnum("status").notNull(),
  picked_at: timestamp("picked_at"),
  delivered_at: timestamp("delivered_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================
   ADMINS
========================= */

export const adminsTable = pgTable("admins", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  role: adminRoleEnum("role").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================
   CATEGORIES
========================= */

export const categoriesTable = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  img_url: varchar("img_url", { length: 255 }).notNull(),
  publicId: varchar("public_id", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
},(table)=>({
  uniqueCategory: uniqueIndex("unique_category").on(table.name)
}));

/* =========================
   MENU ITEM CATEGORY
========================= */

export const menuItemCategoriesTable = pgTable("menu_item_categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  menu_item_id: integer("menu_item_id")
    .notNull()
    .references(() => menuItemsTable.id),
  category_id: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  img_url: varchar("img_url", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
},(table)=>({
  uniqueMenuCategory: uniqueIndex("unique_menu_category")
    .on(table.menu_item_id, table.category_id)
}));

/* =========================
   RESTAURANT CATEGORY
========================= */

export const restaurantCategoriesTable = pgTable("restaurant_categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  restaurant_id: integer("restaurant_id")
    .notNull()
    .references(() => restaurantsTable.id),
  category_id: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
},(table)=>({
  uniqueRestaurantCategory: uniqueIndex("unique_restaurant_category")
    .on(table.restaurant_id, table.category_id)
}));
