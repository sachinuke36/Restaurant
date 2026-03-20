import {
  pgTable,
  pgEnum,
  integer,
  varchar,
  timestamp,
  numeric,
  uniqueIndex
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

export const adminRoleEnum = pgEnum("admin_role", [
  "super_admin",
  "support",
]);



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
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});



/* =========================
   RESTAURANTS
========================= */

export const restaurantsTable = pgTable("restaurants", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  owner_id: integer("owner_id")
    .notNull()
    .references(() => usersTable.id),
  description: varchar("description", { length: 255 }),
  image_url: varchar("image_url", { length: 255 }),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  phone: varchar("phone", { length: 20 }).notNull(),
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
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});



/* =========================
   CART ITEMS
========================= */

export const cartItemsTable = pgTable(
  "cart_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    customer_id: integer("customer_id")
      .notNull()
      .references(() => usersTable.id),
    menu_item_id: integer("menu_item_id")
      .notNull()
      .references(() => menuItemsTable.id),
    restaurant_id: integer("restaurant_id")
      .notNull()
      .references(() => restaurantsTable.id),
    quantity: integer("quantity").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueCartItem: uniqueIndex("unique_cart_item").on(
      table.customer_id,
      table.menu_item_id
    ),
  })
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
  status: orderStatusEnum("status").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});



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
      table.restaurant_id
    ),
  })
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
      table.restaurant_id
    ),
  })
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
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});



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
});



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
});