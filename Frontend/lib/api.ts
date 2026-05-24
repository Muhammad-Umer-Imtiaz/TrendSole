import axios, { type AxiosRequestConfig } from "axios";
import { axiosInstance } from "@/lib/axios";
import type {
  AnalyticsOverview,
  ApiMessageResponse,
  AuthUser,
  Category,
  CategoryFormValues,
  CreateOrderPayload,
  Customer,
  CustomerFormValues,
  DashboardOverview,
  FeedbackItem,
  InventoryItem,
  LoginPayload,
  LoginResponse,
  Order,
  PaginatedResult,
  PaginationMeta,
  PasswordUpdatePayload,
  Permission,
  PermissionGroup,
  Product,
  ProductFormValues,
  ProductListParams,
  ProfileUpdatePayload,
  SignupPayload,
  StaffMember,
  UserRole,
} from "@/lib/types";

type FallbackConfig = AxiosRequestConfig;

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const requestWithFallback = async <T>(configs: FallbackConfig[]) => {
  let lastError: unknown;

  for (const config of configs) {
    try {
      const response = await axiosInstance.request<T>(config);
      return response.data;
    } catch (error) {
      lastError = error;

      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Request failed");
};

const normalizeAuthUser = (user: Record<string, unknown>): AuthUser => ({
  id: String(user.id ?? user._id ?? ""),
  name: String(user.name ?? ""),
  email: String(user.email ?? ""),
  role:
    user.role === "admin" ||
    user.role === "manager" ||
    user.role === "sales_staff" ||
    user.role === "customer"
      ? user.role
      : "customer",
  phone: typeof user.phone === "string" ? user.phone : "",
  address: typeof user.address === "string" ? user.address : "",
});

const normalizePagination = (
  payload: Record<string, unknown> | undefined,
  fallbackLimit = 10
): PaginationMeta => {
  const pagination =
    typeof payload?.pagination === "object" && payload.pagination
      ? (payload.pagination as Record<string, unknown>)
      : payload;

  return {
    page: Number(pagination?.page ?? 1),
    limit: Number(pagination?.limit ?? fallbackLimit),
    total: Number(pagination?.total ?? 0),
    totalPages: Math.max(1, Number(pagination?.totalPages ?? 1)),
  };
};

const normalizeProduct = (product: Record<string, unknown>): Product => {
  const rawColors = Array.isArray(product.colors)
    ? product.colors.map((color) => String(color))
    : [];
  const rawStock = Number(product.stock ?? 0);
  const colorVariants = Array.isArray(product.colorVariants)
    ? product.colorVariants
        .map((variant) => ({
          color: String((variant as { color?: string }).color ?? "").trim(),
          stock: Number((variant as { stock?: number }).stock ?? 0),
        }))
        .filter((variant) => variant.color.length > 0)
    : [];
  const colors =
    colorVariants.length > 0
      ? colorVariants.map((variant) => variant.color)
      : rawColors;

  return {
    id: String(product.id ?? product._id ?? ""),
    productName: String(product.productName ?? ""),
    productPrice: Number(product.productPrice ?? 0),
    productCost: Number(product.productCost ?? 0),
    productDescription: String(product.productDescription ?? ""),
    productImages: Array.isArray(product.productImages)
      ? product.productImages.map((image) => ({
          url: String((image as { url?: string }).url ?? ""),
          publicId: String(
            (image as { publicId?: string; public_id?: string }).publicId ??
              (image as { publicId?: string; public_id?: string }).public_id ??
              ""
          ),
        }))
      : [],
    productCategory: String(product.productCategory ?? ""),
    colors,
    colorVariants,
    stock:
      colorVariants.length > 0
        ? colorVariants.reduce((sum, variant) => sum + variant.stock, 0)
        : rawStock,
    discountPercentage: Number(product.discountPercentage ?? 0),
    offerLabel:
      typeof product.offerLabel === "string" ? product.offerLabel : undefined,
    isActive: Boolean(product.isActive ?? false),
    isFeatured: Boolean(product.isFeatured ?? false),
    isNewArrival: Boolean(product.isNewArrival ?? false),
    isBestSeller: Boolean(product.isBestSeller ?? false),
    createdAt: String(product.createdAt ?? new Date().toISOString()),
    updatedAt: String(product.updatedAt ?? new Date().toISOString()),
  };
};

const normalizeOrder = (order: Record<string, unknown>): Order => ({
  id: String(order.id ?? order._id ?? ""),
  orderNumber: String(order.orderNumber ?? order.reference ?? order.id ?? "ORD"),
  customerName: String(
    order.customerName ??
      (typeof order.customer === "object" &&
      order.customer &&
      "name" in order.customer &&
      typeof order.customer.name === "string"
        ? order.customer.name
        : "Customer")
  ),
  customerEmail:
    typeof order.customerEmail === "string"
      ? order.customerEmail
      : typeof order.customer === "object" &&
          order.customer &&
          "email" in order.customer &&
          typeof order.customer.email === "string"
        ? order.customer.email
        : undefined,
  contactPhone:
    typeof order.contactPhone === "string" ? order.contactPhone : undefined,
  shippingAddress:
    typeof order.shippingAddress === "string"
      ? order.shippingAddress
      : undefined,
  notes: typeof order.notes === "string" ? order.notes : undefined,
  total: Number(order.total ?? order.totalAmount ?? 0),
  status: String(order.status ?? "pending"),
  paymentStatus:
    typeof order.paymentStatus === "string" ? order.paymentStatus : undefined,
  itemsCount:
    typeof order.itemsCount === "number"
      ? order.itemsCount
      : Array.isArray(order.items)
        ? order.items.reduce((sum, item) => {
            const quantity = Number((item as { quantity?: number }).quantity ?? 0);
            return sum + quantity;
          }, 0)
        : undefined,
  items: Array.isArray(order.items)
    ? order.items.map((item) => ({
        productId: String((item as { productId?: string }).productId ?? ""),
        productName: String((item as { productName?: string }).productName ?? ""),
        productImage:
          typeof (item as { productImage?: string }).productImage === "string"
            ? (item as { productImage?: string }).productImage
            : "",
        productCategory: String(
          (item as { productCategory?: string }).productCategory ?? ""
        ),
        selectedColor:
          typeof (item as { selectedColor?: string }).selectedColor === "string"
            ? (item as { selectedColor?: string }).selectedColor
            : undefined,
        quantity: Number((item as { quantity?: number }).quantity ?? 0),
        unitPrice: Number((item as { unitPrice?: number }).unitPrice ?? 0),
        unitCost: Number((item as { unitCost?: number }).unitCost ?? 0),
        lineTotal: Number((item as { lineTotal?: number }).lineTotal ?? 0),
      }))
    : [],
  createdAt: String(order.createdAt ?? new Date().toISOString()),
  updatedAt:
    typeof order.updatedAt === "string"
      ? order.updatedAt
      : String(order.createdAt ?? new Date().toISOString()),
});

const normalizeCategory = (category: Record<string, unknown>): Category => ({
  id: String(category.id ?? category._id ?? ""),
  name: String(category.name ?? ""),
  slug: String(category.slug ?? ""),
  description: String(category.description ?? ""),
  isActive: Boolean(category.isActive ?? true),
  productCount: Number(category.productCount ?? 0),
  createdAt: String(category.createdAt ?? new Date().toISOString()),
  updatedAt: String(category.updatedAt ?? new Date().toISOString()),
});

const normalizeCustomer = (customer: Record<string, unknown>): Customer => ({
  id: String(customer.id ?? customer._id ?? ""),
  name: String(customer.name ?? "Customer"),
  email: String(customer.email ?? ""),
  phone: typeof customer.phone === "string" ? customer.phone : undefined,
  address:
    typeof customer.address === "string" ? customer.address : undefined,
  role:
    customer.role === "admin" ||
    customer.role === "manager" ||
    customer.role === "sales_staff" ||
    customer.role === "customer"
      ? customer.role
      : "customer",
  isActive: Boolean(customer.isActive ?? true),
  totalOrders: Number(customer.totalOrders ?? 0),
  totalSpent: Number(customer.totalSpent ?? 0),
  createdAt: String(customer.createdAt ?? new Date().toISOString()),
  updatedAt:
    typeof customer.updatedAt === "string" ? customer.updatedAt : undefined,
  status: typeof customer.status === "string" ? customer.status : undefined,
});

const normalizeStaffMember = (
  member: Record<string, unknown>
): StaffMember => ({
  id: String(member.id ?? member._id ?? ""),
  name: String(member.name ?? ""),
  email: String(member.email ?? ""),
  phone: typeof member.phone === "string" ? member.phone : undefined,
  role:
    member.role === "admin" ||
    member.role === "manager" ||
    member.role === "sales_staff" ||
    member.role === "customer"
      ? member.role
      : "sales_staff",
  permissions: Array.isArray(member.permissions)
    ? member.permissions.map((permission) => String(permission) as Permission)
    : [],
  isActive:
    typeof member.isActive === "boolean" ? member.isActive : undefined,
  lastActive:
    typeof member.lastActive === "string"
      ? member.lastActive
      : typeof member.updatedAt === "string"
        ? member.updatedAt
        : undefined,
});

const normalizeFeedback = (feedback: Record<string, unknown>): FeedbackItem => ({
  id: String(feedback.id ?? feedback._id ?? ""),
  customerId: String(feedback.customerId ?? ""),
  customerName: String(feedback.customerName ?? ""),
  customerEmail: String(feedback.customerEmail ?? ""),
  rating: Number(feedback.rating ?? 0),
  subject: String(feedback.subject ?? ""),
  message: String(feedback.message ?? ""),
  status:
    feedback.status === "reviewed" || feedback.status === "resolved"
      ? feedback.status
      : "open",
  createdAt: String(feedback.createdAt ?? new Date().toISOString()),
  updatedAt: String(feedback.updatedAt ?? new Date().toISOString()),
});

const buildProductFormData = (
  values: ProductFormValues,
  images: File[]
) => {
  const normalizedVariants = values.colorVariants
    .map((variant) => ({
      color: variant.color.trim(),
      stock: Number(variant.stock),
    }))
    .filter((variant) => variant.color.length > 0);
  const resolvedColors =
    normalizedVariants.length > 0
      ? normalizedVariants.map((variant) => variant.color)
      : values.colors.map((color) => color.trim()).filter(Boolean);
  const resolvedStock =
    normalizedVariants.length > 0
      ? normalizedVariants.reduce((sum, variant) => sum + variant.stock, 0)
      : values.stock;
  const formData = new FormData();

  formData.append("productName", values.productName);
  formData.append("productPrice", values.productPrice);
  formData.append("productCost", values.productCost);
  formData.append("productDescription", values.productDescription);
  formData.append("productCategory", values.productCategory);
  formData.append("colors", JSON.stringify(resolvedColors));
  formData.append("colorVariants", JSON.stringify(normalizedVariants));
  formData.append("stock", String(resolvedStock));
  formData.append("discountPercentage", values.discountPercentage);
  formData.append("offerLabel", values.offerLabel);
  formData.append("isActive", String(values.isActive));
  formData.append("isFeatured", String(values.isFeatured));
  formData.append("isNewArrival", String(values.isNewArrival));
  formData.append("isBestSeller", String(values.isBestSeller));

  images.forEach((file) => {
    formData.append("productImages", file);
  });

  return formData;
};

const buildCustomerPayload = (
  values: CustomerFormValues,
  options?: {
    includePassword?: boolean;
  }
) => {
  const payload: Record<string, unknown> = {
    name: values.name,
    email: values.email,
    phone: values.phone,
    address: values.address,
    role: values.role,
    isActive: values.isActive,
  };

  if (options?.includePassword ?? true) {
    payload.password = values.password;
  }

  return payload;
};

const buildCategoryPayload = (values: CategoryFormValues) => ({
  name: values.name,
  description: values.description,
  isActive: values.isActive,
});

const buildProductParams = (params?: ProductListParams) => ({
  page: params?.page,
  limit: params?.limit,
  search: params?.search?.trim() || undefined,
  minPrice: params?.minPrice,
  maxPrice: params?.maxPrice,
  category: params?.category?.filter(Boolean).join(",") || undefined,
  colors: params?.colors?.filter(Boolean).join(",") || undefined,
  includeInactive: params?.includeInactive ? "true" : undefined,
  featured: typeof params?.featured === "boolean" ? String(params.featured) : undefined,
  newArrival:
    typeof params?.newArrival === "boolean" ? String(params.newArrival) : undefined,
  bestSeller:
    typeof params?.bestSeller === "boolean" ? String(params.bestSeller) : undefined,
});

const parseAxiosMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : undefined;

    return responseMessage ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

const toPaginatedResult = <T>(
  items: T[],
  pagination?: Record<string, unknown>,
  fallbackLimit = 10
): PaginatedResult<T> => ({
  items,
  pagination: pagination
    ? normalizePagination({ pagination }, fallbackLimit)
    : {
        ...DEFAULT_PAGINATION,
        limit: fallbackLimit,
        total: items.length,
      },
});

export const authApi = {
  register: (payload: SignupPayload & { role?: string }) =>
    requestWithFallback<ApiMessageResponse>([
      {
        method: "POST",
        url: "/users/register",
        data: payload,
      },
    ]),

  login: (payload: LoginPayload) =>
    requestWithFallback<LoginResponse>([
      {
        method: "POST",
        url: "/auth/login",
        data: payload,
      },
      {
        method: "POST",
        url: "/users/login",
        data: payload,
      },
    ]),

  signup: (payload: SignupPayload) =>
    requestWithFallback<LoginResponse>([
      {
        method: "POST",
        url: "/users/signup",
        data: payload,
      },
      {
        method: "POST",
        url: "/auth/signup",
        data: payload,
      },
    ]),

  logout: () =>
    requestWithFallback<ApiMessageResponse>([
      {
        method: "POST",
        url: "/auth/logout",
      },
      {
        method: "POST",
        url: "/users/logout",
      },
    ]),

  async getCurrentUser() {
    const data = await requestWithFallback<Record<string, unknown>>([
      {
        method: "GET",
        url: "/users/me",
      },
    ]);
    const user =
      typeof data.user === "object" && data.user
        ? (data.user as Record<string, unknown>)
        : data;

    return {
      user: normalizeAuthUser(user),
      permissions: Array.isArray(user.permissions)
        ? user.permissions.map((permission) => String(permission) as Permission)
        : [],
      isActive: Boolean(user.isActive ?? true),
    };
  },

  async updateProfile(payload: ProfileUpdatePayload) {
    const data = await requestWithFallback<Record<string, unknown>>([
      {
        method: "PUT",
        url: "/users/me/profile",
        data: payload,
      },
    ]);
    const user =
      typeof data.user === "object" && data.user
        ? (data.user as Record<string, unknown>)
        : data;

    return {
      user: normalizeAuthUser(user),
      permissions: Array.isArray(user.permissions)
        ? user.permissions.map((permission) => String(permission) as Permission)
        : [],
      message:
        typeof data.message === "string"
          ? data.message
          : "Profile updated successfully",
    };
  },

  updatePassword: (payload: PasswordUpdatePayload) =>
    requestWithFallback<ApiMessageResponse>([
      {
        method: "PUT",
        url: "/users/me/password",
        data: payload,
      },
    ]),

  forgotPassword: (payload: { email: string }) =>
    requestWithFallback<ApiMessageResponse>([
      {
        method: "POST",
        url: "/users/forget-password",
        data: payload,
      },
    ]),

  resetPassword: (token: string, payload: { password: string }) =>
    requestWithFallback<ApiMessageResponse>([
      {
        method: "POST",
        url: `/users/reset-password/${token}`,
        data: payload,
      },
    ]),

  verifyOtp: (payload: { otp: string }) =>
    requestWithFallback<LoginResponse>([
      {
        method: "POST",
        url: "/users/verifyOtp",
        data: payload,
      },
    ]),
};

export const dashboardApi = {
  async getOverview() {
    const data = await requestWithFallback<Record<string, unknown>>([
      { method: "GET", url: "/admin/dashboard" },
      { method: "GET", url: "/dashboard/overview" },
    ]);

    return {
      stats: {
        totalSales: Number(
          (data.stats as { totalSales?: number } | undefined)?.totalSales ??
            data.totalSales ??
            0
        ),
        orders: Number(
          (data.stats as { orders?: number } | undefined)?.orders ?? data.orders ?? 0
        ),
        products: Number(
          (data.stats as { products?: number } | undefined)?.products ??
            data.products ??
            0
        ),
        users: Number(
          (data.stats as { users?: number } | undefined)?.users ?? data.users ?? 0
        ),
      },
      dailySummary: {
        orderCount: Number(
          (data.dailySummary as { orderCount?: number } | undefined)?.orderCount ?? 0
        ),
        revenue: Number(
          (data.dailySummary as { revenue?: number } | undefined)?.revenue ?? 0
        ),
      },
      recentOrders: Array.isArray(data.recentOrders)
        ? data.recentOrders.map((item) =>
            normalizeOrder(item as Record<string, unknown>)
          )
        : [],
    } satisfies DashboardOverview;
  },
};

export const productApi = {
  async list(params?: ProductListParams) {
    const result = await this.listPaginated(params);
    return result.items;
  },

  async listPaginated(params?: ProductListParams) {
    const data = await requestWithFallback<Record<string, unknown> | Product[]>([
      { method: "GET", url: "/products", params: buildProductParams(params) },
      {
        method: "GET",
        url: "/products/getAllProducts",
        params: buildProductParams(params),
      },
    ]);

    const products = Array.isArray(data)
      ? data
      : Array.isArray(data.products)
        ? data.products
        : [];

    return toPaginatedResult(
      products.map((product) =>
        normalizeProduct(product as Record<string, unknown>)
      ),
      Array.isArray(data) ? undefined : (data.pagination as Record<string, unknown>),
      params?.limit ?? 12
    );
  },

  async getById(id: string, options?: { includeInactive?: boolean }) {
    const data = await requestWithFallback<Record<string, unknown>>([
      {
        method: "GET",
        url: `/products/${id}`,
        params: options?.includeInactive ? { includeInactive: "true" } : undefined,
      },
      {
        method: "GET",
        url: `/products/getSingleProduct/${id}`,
        params: options?.includeInactive ? { includeInactive: "true" } : undefined,
      },
    ]);

    return {
      product: normalizeProduct(
        (data.product as Record<string, unknown> | undefined) ?? data
      ),
      relatedProducts: Array.isArray(data.relatedProducts)
        ? data.relatedProducts.map((item) =>
            normalizeProduct(item as Record<string, unknown>)
          )
        : [],
    };
  },

  async create(values: ProductFormValues, images: File[]) {
    const data = await requestWithFallback<Record<string, unknown>>([
      {
        method: "POST",
        url: "/products",
        data: buildProductFormData(values, images),
      },
      {
        method: "POST",
        url: "/products/createProduct",
        data: buildProductFormData(values, images),
      },
    ]);

    return normalizeProduct(
      (data.product as Record<string, unknown> | undefined) ?? data
    );
  },

  async update(id: string, values: ProductFormValues, images: File[]) {
    const data = await requestWithFallback<Record<string, unknown>>([
      {
        method: "PUT",
        url: `/products/${id}`,
        data: buildProductFormData(values, images),
      },
      {
        method: "PUT",
        url: `/products/updateProduct/${id}`,
        data: buildProductFormData(values, images),
      },
    ]);

    return normalizeProduct(
      (data.product as Record<string, unknown> | undefined) ?? data
    );
  },

  delete: (id: string) =>
    requestWithFallback<ApiMessageResponse>([
      { method: "DELETE", url: `/products/${id}` },
      { method: "DELETE", url: `/products/deleteProduct/${id}` },
    ]),
};

export const categoriesApi = {
  async list(options?: { includeInactive?: boolean }) {
    const data = await requestWithFallback<Record<string, unknown> | Category[]>([
      {
        method: "GET",
        url: "/categories",
        params: options?.includeInactive ? { includeInactive: "true" } : undefined,
      },
    ]);

    const categories = Array.isArray(data)
      ? data
      : Array.isArray(data.categories)
        ? data.categories
        : [];

    return categories.map((category) =>
      normalizeCategory(category as Record<string, unknown>)
    );
  },

  async create(values: CategoryFormValues) {
    const data = await requestWithFallback<Record<string, unknown>>([
      {
        method: "POST",
        url: "/categories",
        data: buildCategoryPayload(values),
      },
    ]);

    return normalizeCategory(
      (data.category as Record<string, unknown> | undefined) ?? data
    );
  },

  async update(id: string, values: CategoryFormValues) {
    const data = await requestWithFallback<Record<string, unknown>>([
      {
        method: "PUT",
        url: `/categories/${id}`,
        data: buildCategoryPayload(values),
      },
    ]);

    return normalizeCategory(
      (data.category as Record<string, unknown> | undefined) ?? data
    );
  },

  delete: (id: string) =>
    requestWithFallback<ApiMessageResponse>([
      { method: "DELETE", url: `/categories/${id}` },
    ]),
};

export const ordersApi = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    const result = await this.listPaginated(params);
    return result.items;
  },

  async listPaginated(params?: { page?: number; limit?: number; search?: string }) {
    const data = await requestWithFallback<Record<string, unknown> | Order[]>([
      { method: "GET", url: "/orders", params },
      { method: "GET", url: "/admin/orders", params },
    ]);

    const orders = Array.isArray(data)
      ? data
      : Array.isArray(data.orders)
        ? data.orders
        : [];

    return toPaginatedResult(
      orders.map((order) => normalizeOrder(order as Record<string, unknown>)),
      Array.isArray(data) ? undefined : (data.pagination as Record<string, unknown>),
      params?.limit ?? 10
    );
  },

  async listMine(params?: { page?: number; limit?: number; search?: string }) {
    const data = await requestWithFallback<Record<string, unknown> | Order[]>([
      { method: "GET", url: "/orders/my", params },
    ]);

    const orders = Array.isArray(data)
      ? data
      : Array.isArray(data.orders)
        ? data.orders
        : [];

    return toPaginatedResult(
      orders.map((order) => normalizeOrder(order as Record<string, unknown>)),
      Array.isArray(data) ? undefined : (data.pagination as Record<string, unknown>),
      params?.limit ?? 10
    );
  },

  async create(payload: CreateOrderPayload) {
    const data = await requestWithFallback<Record<string, unknown>>([
      {
        method: "POST",
        url: "/orders",
        data: payload,
      },
    ]);

    return normalizeOrder(
      (data.order as Record<string, unknown> | undefined) ?? data
    );
  },

  async updateStatus(id: string, status: string) {
    await requestWithFallback<ApiMessageResponse>([
      {
        method: "PATCH",
        url: `/orders/${id}/status`,
        data: { status },
      },
      {
        method: "PATCH",
        url: `/orders/${id}`,
        data: { status },
      },
    ]);
  },
};

export const feedbackApi = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    const data = await requestWithFallback<Record<string, unknown> | FeedbackItem[]>([
      { method: "GET", url: "/feedback", params },
    ]);

    const feedback = Array.isArray(data)
      ? data
      : Array.isArray(data.feedback)
        ? data.feedback
        : [];

    return toPaginatedResult(
      feedback.map((item) => normalizeFeedback(item as Record<string, unknown>)),
      Array.isArray(data) ? undefined : (data.pagination as Record<string, unknown>),
      params?.limit ?? 10
    );
  },

  async listMine() {
    const data = await requestWithFallback<Record<string, unknown> | FeedbackItem[]>([
      { method: "GET", url: "/feedback/my" },
    ]);

    const feedback = Array.isArray(data)
      ? data
      : Array.isArray(data.feedback)
        ? data.feedback
        : [];

    return feedback.map((item) => normalizeFeedback(item as Record<string, unknown>));
  },

  async create(payload: { rating: number; subject: string; message: string }) {
    const data = await requestWithFallback<Record<string, unknown>>([
      { method: "POST", url: "/feedback", data: payload },
    ]);

    return normalizeFeedback(
      (data.feedback as Record<string, unknown> | undefined) ?? data
    );
  },

  updateStatus: (id: string, status: "open" | "reviewed" | "resolved") =>
    requestWithFallback<ApiMessageResponse>([
      { method: "PATCH", url: `/feedback/${id}/status`, data: { status } },
    ]),
};

export const customersApi = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    const result = await this.listPaginated(params);
    return result.items;
  },

  async listPaginated(params?: { page?: number; limit?: number; search?: string }) {
    const data = await requestWithFallback<Record<string, unknown> | Customer[]>([
      { method: "GET", url: "/users/customers", params },
      { method: "GET", url: "/admin/customers", params },
    ]);

    const customers = Array.isArray(data)
      ? data
      : Array.isArray(data.customers)
        ? data.customers
        : [];

    return toPaginatedResult(
      customers.map((customer) =>
        normalizeCustomer(customer as Record<string, unknown>)
      ),
      Array.isArray(data) ? undefined : (data.pagination as Record<string, unknown>),
      params?.limit ?? 10
    );
  },

  async create(values: CustomerFormValues) {
    const data = await requestWithFallback<Record<string, unknown>>([
      {
        method: "POST",
        url: "/users/customers",
        data: buildCustomerPayload(values, { includePassword: true }),
      },
    ]);

    return normalizeCustomer(
      (data.customer as Record<string, unknown> | undefined) ?? data
    );
  },

  async update(id: string, values: CustomerFormValues, options?: { keepPassword?: boolean }) {
    const includePassword = !(options?.keepPassword && values.password.trim().length === 0);
    const data = await requestWithFallback<Record<string, unknown>>([
      {
        method: "PUT",
        url: `/users/customers/${id}`,
        data: buildCustomerPayload(values, { includePassword }),
      },
    ]);

    return normalizeCustomer(
      (data.customer as Record<string, unknown> | undefined) ?? data
    );
  },

  delete: (id: string) =>
    requestWithFallback<ApiMessageResponse>([
      { method: "DELETE", url: `/users/customers/${id}` },
    ]),
};

export const inventoryApi = {
  async list() {
    try {
      const data = await requestWithFallback<Record<string, unknown> | InventoryItem[]>([
        { method: "GET", url: "/inventory" },
        { method: "GET", url: "/admin/inventory" },
      ]);

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
          ? data.items
          : [];

      return items.map((item) => ({
        id: String(
          (item as { id?: string; _id?: string }).id ??
            (item as { id?: string; _id?: string })._id ??
            ""
        ),
        productName: String((item as { productName?: string }).productName ?? ""),
        productCategory: String(
          (item as { productCategory?: string }).productCategory ?? ""
        ),
        stock: Number((item as { stock?: number }).stock ?? 0),
        colorVariants: Array.isArray((item as { colorVariants?: unknown[] }).colorVariants)
          ? (item as { colorVariants?: unknown[] }).colorVariants?.map((variant) => ({
              color: String((variant as { color?: string }).color ?? ""),
              stock: Number((variant as { stock?: number }).stock ?? 0),
            }))
          : [],
        isActive: Boolean((item as { isActive?: boolean }).isActive ?? false),
        updatedAt: String(
          (item as { updatedAt?: string }).updatedAt ?? new Date().toISOString()
        ),
      }));
    } catch {
      const products = await productApi.list();

      return products.map((product) => ({
        id: product.id,
        productName: product.productName,
        productCategory: product.productCategory,
        stock: product.stock,
        colorVariants: product.colorVariants,
        isActive: product.isActive,
        updatedAt: product.updatedAt,
      }));
    }
  },
};

export const analyticsApi = {
  async getOverview() {
    const data = await requestWithFallback<Record<string, unknown>>([
      { method: "GET", url: "/analytics" },
      { method: "GET", url: "/analytics/overview" },
      { method: "GET", url: "/admin/analytics" },
    ]);

    const mapPoints = (points: unknown) =>
      Array.isArray(points)
        ? points.map((point) => ({
            label: String(
              (point as { label?: string; name?: string }).label ??
                (point as { label?: string; name?: string }).name ??
                ""
            ),
            value: Number(
              (point as { value?: number; amount?: number }).value ??
                (point as { value?: number; amount?: number }).amount ??
                0
            ),
          }))
        : [];

    return {
      revenueSeries: mapPoints(data.revenueSeries),
      channelBreakdown: mapPoints(data.channelBreakdown),
      topProducts: mapPoints(data.topProducts),
      conversionRate: Number(data.conversionRate ?? 0),
      averageOrderValue: Number(data.averageOrderValue ?? 0),
      returningCustomers: Number(data.returningCustomers ?? 0),
    } satisfies AnalyticsOverview;
  },
};

export const staffApi = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    const result = await this.listPaginated(params);
    return result.items;
  },

  async listPaginated(params?: { page?: number; limit?: number; search?: string }) {
    const data = await requestWithFallback<Record<string, unknown> | StaffMember[]>([
      { method: "GET", url: "/users/staff", params },
      { method: "GET", url: "/staff", params },
      { method: "GET", url: "/admin/staff", params },
      { method: "GET", url: "/users", params },
    ]);

    const staff = Array.isArray(data)
      ? data
      : Array.isArray(data.users)
        ? data.users
        : Array.isArray(data.staff)
          ? data.staff
          : [];

    const normalizedStaff = staff
      .map((member) => normalizeStaffMember(member as Record<string, unknown>))
      .filter(
        (member) =>
          member.role === "manager" || member.role === "sales_staff"
      );

    return toPaginatedResult(
      normalizedStaff,
      Array.isArray(data) ? undefined : (data.pagination as Record<string, unknown>),
      params?.limit ?? 10
    );
  },

  updatePermissions: (userId: string, permissions: Permission[]) =>
    requestWithFallback<ApiMessageResponse>([
      {
        method: "PUT",
        url: `/users/${userId}/permissions`,
        data: { permissions },
      },
    ]),

  async updateRole(userId: string, role: UserRole) {
    const data = await requestWithFallback<Record<string, unknown>>([
      {
        method: "PUT",
        url: `/users/${userId}/role`,
        data: { role },
      },
    ]);

    return normalizeStaffMember(
      (data.user as Record<string, unknown> | undefined) ?? data
    );
  },
};

export const permissionsApi = {
  async getCatalog() {
    const data = await requestWithFallback<Record<string, unknown>>([
      {
        method: "GET",
        url: "/users/permission-catalog",
      },
    ]);

    return {
      groups: Array.isArray(data.groups)
        ? (data.groups as PermissionGroup[])
        : [],
      rolePresets:
        typeof data.rolePresets === "object" && data.rolePresets
          ? (data.rolePresets as Record<UserRole, Permission[]>)
          : {
              admin: [],
              manager: [],
              sales_staff: [],
              customer: [],
            },
    };
  },
};

export const apiErrorMessage = parseAxiosMessage;
