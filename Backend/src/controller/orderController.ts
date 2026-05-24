import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../errors/AppError.js";
import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { createOrderSchema, orderStatusSchema } from "../validation/orderValidation.js";

const parsePositiveNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const colorsMatch = (firstColor: string, secondColor: string) =>
  firstColor.trim().toLowerCase() === secondColor.trim().toLowerCase();

const serializeOrder = (order: {
  _id: unknown;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  contactPhone?: string;
  shippingAddress: string;
  notes?: string;
  total: number;
  status: string;
  paymentStatus?: string;
  itemsCount: number;
  items: Array<{
    productId: unknown;
    productName: string;
    productImage?: string;
    productCategory: string;
    selectedColor?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  createdAt: Date;
  updatedAt?: Date;
}) => ({
  id: String(order._id),
  orderNumber: order.orderNumber,
  customerName: order.customerName,
  customerEmail: order.customerEmail,
  contactPhone: order.contactPhone,
  shippingAddress: order.shippingAddress,
  notes: order.notes ?? "",
  total: order.total,
  status: order.status,
  paymentStatus: order.paymentStatus,
  itemsCount: order.itemsCount,
  items: order.items.map((item) => ({
    productId: String(item.productId),
    productName: item.productName,
    productImage: item.productImage ?? "",
    productCategory: item.productCategory,
    selectedColor: item.selectedColor || undefined,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
  })),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt ?? order.createdAt,
});

const buildOrderFilter = (search: string) =>
  search
    ? {
        $or: [
          { orderNumber: { $regex: search, $options: "i" } },
          { customerName: { $regex: search, $options: "i" } },
          { customerEmail: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ],
      }
    : {};

export const createOrder = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.authUser) {
      throw new AppError("Authentication required", 401);
    }

    const validatedData = createOrderSchema.parse(req.body);
    const productIds = validatedData.items.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    if (products.length !== productIds.length) {
      throw new AppError("One or more selected products are unavailable", 400);
    }

    const items = validatedData.items.map((item) => {
      const product = products.find(
        (candidate) => String(candidate._id) === item.productId
      );

      if (!product) {
        throw new AppError("Unable to build the requested order", 400);
      }

      const selectedColor = item.selectedColor?.trim();
      const hasVariantInventory = product.colorVariants.length > 0;
      const hasSelectableColors = product.colors.length > 0;
      let matchedVariant:
        | (typeof product.colorVariants extends Array<infer Variant> ? Variant : never)
        | undefined;

      if (hasVariantInventory) {
        if (!selectedColor) {
          throw new AppError(
            `Select a color for ${product.productName} before placing the order`,
            400
          );
        }

        matchedVariant = product.colorVariants.find((variant) =>
          colorsMatch(variant.color, selectedColor)
        );

        if (!matchedVariant) {
          throw new AppError(
            `${selectedColor} is not available for ${product.productName}`,
            400
          );
        }

        if (matchedVariant.stock < item.quantity) {
          throw new AppError(
            `${product.productName} in ${matchedVariant.color} only has ${matchedVariant.stock} units available`,
            400
          );
        }
      } else {
        if (hasSelectableColors) {
          if (!selectedColor) {
            throw new AppError(
              `Select a color for ${product.productName} before placing the order`,
              400
            );
          }

          const colorExists = product.colors.some((color) =>
            colorsMatch(color, selectedColor)
          );

          if (!colorExists) {
            throw new AppError(
              `${selectedColor} is not available for ${product.productName}`,
              400
            );
          }
        }

        if (product.stock < item.quantity) {
          throw new AppError(
            `${product.productName} only has ${product.stock} units available`,
            400
          );
        }
      }

      return {
        product,
        selectedColor,
        matchedVariant,
        quantity: item.quantity,
      };
    });

    const orderItems = items.map(({ product, quantity, selectedColor }) => ({
      productId: product._id,
      productName: product.productName,
      productImage: product.productImages[0]?.url ?? "",
      productCategory: product.productCategory,
      selectedColor,
      quantity,
      unitPrice: product.productPrice,
      lineTotal: product.productPrice * quantity,
    }));
    const total = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const orderNumber = `TS-${Date.now().toString().slice(-8)}`;

    await Promise.all(
      items.map(async ({ product, quantity, matchedVariant }) => {
        if (matchedVariant) {
          matchedVariant.stock -= quantity;
          product.stock = product.colorVariants.reduce(
            (sum, variant) => sum + variant.stock,
            0
          );
          product.markModified("colorVariants");
        } else {
          product.stock -= quantity;
        }

        await product.save();
      })
    );

    const order = await Order.create({
      orderNumber,
      customerId: req.authUser._id,
      customerName: req.authUser.name,
      customerEmail: req.authUser.email,
      contactPhone: validatedData.contactPhone,
      shippingAddress: validatedData.shippingAddress,
      notes: validatedData.notes ?? "",
      items: orderItems,
      total,
      itemsCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      paymentStatus: "pending",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: serializeOrder(order),
    });
  }
);

export const listOrders = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const page = parsePositiveNumber(req.query.page, 1);
    const limit = parsePositiveNumber(req.query.limit, 10);
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const filter = buildOrderFilter(search);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders: orders.map((order) => serializeOrder(order)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  }
);

export const listMyOrders = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.authUser) {
      throw new AppError("Authentication required", 401);
    }

    const page = parsePositiveNumber(req.query.page, 1);
    const limit = parsePositiveNumber(req.query.limit, 10);
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const filter = {
      customerId: req.authUser._id,
      ...buildOrderFilter(search),
    };
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders: orders.map((order) => serializeOrder(order)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  }
);

export const updateOrderStatus = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { status } = orderStatusSchema.parse(req.body);
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    order.status = status;

    if (status === "delivered") {
      order.paymentStatus = "paid";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: serializeOrder(order),
    });
  }
);
