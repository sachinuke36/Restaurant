export type UserRole = "customer" | "owner" | "delivery_person" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  created_at: string;
  updated_at: string;
};

export type Address = {
    id: number,
  userId: number,
  fullName: string,
  phone: string,
  addressLine1: string,
  addressLine2: string,
  city: string,
  state: string,
  postalCode: string,
  country: string,
  isDefault: boolean
  createdAt: Date,
  updatedAt: Date
}