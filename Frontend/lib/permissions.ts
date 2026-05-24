import type { Permission, PermissionGroup } from "@/lib/types";

export interface SidebarItemConfig {
  href: string;
  label: string;
  icon: string;
  requiredPermissions: Permission[];
  adminOnly?: boolean;
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
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
    description: "Access the customer base and account summaries.",
    permissions: [
      {
        key: "customers:read",
        label: "Read",
        description: "View customer profiles and spending history.",
      },
      {
        key: "customers:manage",
        label: "Manage",
        description: "Create, edit, and remove customer records.",
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
        description: "Manage team members and operational staff records.",
      },
      {
        key: "staff:manage",
        label: "Manage staff permissions",
        description: "Assign and update permissions for manager and staff roles.",
      },
    ],
  },
];

export const SIDEBAR_ITEMS: SidebarItemConfig[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "dashboard",
    requiredPermissions: ["dashboard:view"],
  },
  {
    href: "/dashboard/products",
    label: "Products",
    icon: "products",
    requiredPermissions: ["products:read"],
  },
  {
    href: "/dashboard/categories",
    label: "Categories",
    icon: "categories",
    requiredPermissions: ["categories:read"],
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    icon: "orders",
    requiredPermissions: ["orders:read"],
  },
  {
    href: "/dashboard/customers",
    label: "Customers",
    icon: "customers",
    requiredPermissions: ["customers:read"],
  },
  {
    href: "/dashboard/inventory",
    label: "Inventory",
    icon: "inventory",
    requiredPermissions: ["inventory:read"],
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: "analytics",
    requiredPermissions: ["analytics:view"],
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: "reports",
    requiredPermissions: ["analytics:view"],
  },
  {
    href: "/dashboard/staff",
    label: "Staff Management",
    icon: "staff",
    requiredPermissions: ["staff:manage"],
    adminOnly: true,
  },
];

export const hasPermission = (
  permissions: Permission[],
  requiredPermission: Permission
) => permissions.includes(requiredPermission);

export const hasAllPermissions = (
  permissions: Permission[],
  requiredPermissions: Permission[]
) => requiredPermissions.every((permission) => permissions.includes(permission));

export const getAllConfiguredPermissions = () =>
  PERMISSION_GROUPS.flatMap((group) => group.permissions.map((item) => item.key));
