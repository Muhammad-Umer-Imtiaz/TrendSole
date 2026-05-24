export type UserRole = "admin" | "manager" | "sales_staff" | "customer";

export type Permission =
  | "dashboard:view"
  | "products:read"
  | "products:create"
  | "products:update"
  | "products:delete"
  | "categories:read"
  | "categories:create"
  | "categories:update"
  | "categories:delete"
  | "orders:read"
  | "orders:update"
  | "customers:read"
  | "customers:manage"
  | "inventory:read"
  | "analytics:view"
  | "users:manage"
  | "staff:manage"
  | (string & {});

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

export interface ApiMessageResponse {
  message: string;
  success?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  permissions: Permission[];
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string;
  address?: string;
}

export interface PasswordUpdatePayload {
  currentPassword: string;
  newPassword: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface ProductColorVariant {
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  productName: string;
  productPrice: number;
  productCost: number;
  productDescription: string;
  productImages: ProductImage[];
  productCategory: string;
  colors: string[];
  colorVariants: ProductColorVariant[];
  stock: number;
  discountPercentage: number;
  offerLabel?: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string[];
  colors?: string[];
  includeInactive?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
}

export interface ProductFormValues {
  productName: string;
  productPrice: string;
  productCost: string;
  productDescription: string;
  productCategory: string;
  colors: string[];
  colorVariants: ProductColorVariant[];
  stock: string;
  discountPercentage: string;
  offerLabel: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormValues {
  name: string;
  description: string;
  isActive: boolean;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | (string & {});

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  contactPhone?: string;
  shippingAddress?: string;
  notes?: string;
  total: number;
  status: OrderStatus;
  paymentStatus?: string;
  itemsCount?: number;
  items?: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  productCategory: string;
  selectedColor?: string;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  lineTotal: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt?: string;
  status?: string;
}

export interface CustomerFormValues {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  role: UserRole;
  isActive: boolean;
}

export interface DashboardStats {
  totalSales: number;
  orders: number;
  products: number;
  users: number;
}

export interface DashboardOverview {
  stats: DashboardStats;
  dailySummary?: {
    orderCount: number;
    revenue: number;
  };
  recentOrders: Order[];
}

export interface AnalyticsPoint {
  label: string;
  value: number;
}

export interface AnalyticsOverview {
  revenueSeries: AnalyticsPoint[];
  channelBreakdown: AnalyticsPoint[];
  topProducts: AnalyticsPoint[];
  conversionRate: number;
  averageOrderValue: number;
  returningCustomers: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  permissions: Permission[];
  isActive?: boolean;
  lastActive?: string;
}

export interface InventoryItem {
  id: string;
  productName: string;
  productCategory: string;
  stock: number;
  colorVariants?: ProductColorVariant[];
  isActive: boolean;
  updatedAt: string;
}

export interface PermissionGroup {
  key: string;
  label: string;
  description: string;
  permissions: Array<{
    key: Permission;
    label: string;
    description: string;
  }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface FeedbackItem {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  subject: string;
  message: string;
  status: "open" | "reviewed" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    selectedColor?: string;
    quantity: number;
  }>;
  contactPhone: string;
  shippingAddress: string;
  notes?: string;
}
