import type { IUser, UserRole } from "../models/userModel.js";

export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
}

export interface PermissionGroupDefinition {
  key: string;
  label: string;
  description: string;
  permissions: PermissionDefinition[];
}

export const PERMISSION_GROUPS: PermissionGroupDefinition[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Core overview access for the admin workspace.",
    permissions: [
      {
        key: "dashboard:view",
        label: "View dashboard",
        description: "Open the dashboard overview and see business KPIs.",
      },
    ],
  },
  {
    key: "products",
    label: "Product Permissions",
    description: "Manage the product catalog and merchandising workflows.",
    permissions: [
      {
        key: "products:read",
        label: "Read",
        description: "View product lists and product details.",
      },
      {
        key: "products:create",
        label: "Create",
        description: "Add new products to the catalog.",
      },
      {
        key: "products:update",
        label: "Update",
        description: "Edit product information and availability.",
      },
      {
        key: "products:delete",
        label: "Delete",
        description: "Remove products from the catalog.",
      },
    ],
  },
  {
    key: "categories",
    label: "Category Permissions",
    description: "Maintain product categories used across the catalog.",
    permissions: [
      {
        key: "categories:read",
        label: "Read",
        description: "View product categories and their usage.",
      },
      {
        key: "categories:create",
        label: "Create",
        description: "Add new categories for product organization.",
      },
      {
        key: "categories:update",
        label: "Update",
        description: "Rename and refine existing categories.",
      },
      {
        key: "categories:delete",
        label: "Delete",
        description: "Remove categories that are no longer needed.",
      },
    ],
  },
  {
    key: "orders",
    label: "Order Permissions",
    description: "Control order visibility and fulfillment updates.",
    permissions: [
      {
        key: "orders:read",
        label: "Read",
        description: "View order lists and order details.",
      },
      {
        key: "orders:update",
        label: "Update",
        description: "Update order status and fulfillment stages.",
      },
    ],
  },
  {
    key: "customers",
    label: "Customer Permissions",
    description: "Access and manage the customer base.",
    permissions: [
      {
        key: "customers:read",
        label: "Read",
        description: "View customer profiles and account summaries.",
      },
      {
        key: "customers:manage",
        label: "Manage",
        description: "Create, update, and remove customer records.",
      },
    ],
  },
  {
    key: "inventory",
    label: "Inventory Permissions",
    description: "Monitor stock availability and active product stock health.",
    permissions: [
      {
        key: "inventory:read",
        label: "Read",
        description: "View stock levels and low-inventory indicators.",
      },
    ],
  },
  {
    key: "analytics",
    label: "Analytics Permissions",
    description: "Review performance trends and growth indicators.",
    permissions: [
      {
        key: "analytics:view",
        label: "View",
        description: "Access revenue, product, and channel insights.",
      },
    ],
  },
  {
    key: "staff",
    label: "Staff Permissions",
    description: "Control staff access, roles, and permission assignments.",
    permissions: [
      {
        key: "users:manage",
        label: "Manage users",
        description: "Access staff records and user administration tools.",
      },
      {
        key: "staff:manage",
        label: "Manage staff permissions",
        description: "Assign and update permissions for manager and staff roles.",
      },
    ],
  },
];

export const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((group) =>
  group.permissions.map((permission) => permission.key)
);

export const ROLE_PERMISSION_PRESETS: Record<UserRole, string[]> = {
  admin: [...ALL_PERMISSION_KEYS],
  manager: [
    "dashboard:view",
    "products:read",
    "products:create",
    "products:update",
    "categories:read",
    "categories:create",
    "categories:update",
    "orders:read",
    "orders:update",
    "customers:read",
    "inventory:read",
    "analytics:view",
  ],
  sales_staff: [
    "dashboard:view",
    "products:read",
    "categories:read",
    "orders:read",
    "customers:read",
    "inventory:read",
  ],
  customer: [],
};

export const isValidPermission = (permission: string) =>
  ALL_PERMISSION_KEYS.includes(permission);

export const normalizePermissions = (permissions: string[]) =>
  [...new Set(permissions.filter(isValidPermission))];

export const getDefaultPermissions = (role: UserRole) => [
  ...(ROLE_PERMISSION_PRESETS[role] ?? []),
];

export const getEffectivePermissions = (
  user: Pick<IUser, "role" | "permissions">
) => {
  if (user.permissions.length > 0) {
    return normalizePermissions(user.permissions);
  }

  return getDefaultPermissions(user.role);
};

export const hasAllPermissions = (
  userPermissions: string[],
  requiredPermissions: string[]
) => requiredPermissions.every((permission) => userPermissions.includes(permission));
