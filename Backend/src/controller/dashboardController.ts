import type { Request, Response } from "express";
import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";
import User from "../models/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

export const getDashboardOverview = catchAsync(
  async (_req: Request, res: Response) => {
    const [orders, productCount, userCount] = await Promise.all([
      Order.find().sort({ createdAt: -1 }),
      Product.countDocuments(),
      User.countDocuments(),
    ]);

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalSales,
        orders: orders.length,
        products: productCount,
        users: userCount,
      },
      recentOrders: orders.slice(0, 6).map((order) => ({
        id: String(order._id),
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        itemsCount: order.itemsCount,
        createdAt: order.createdAt,
      })),
    });
  }
);

export const getAnalyticsOverview = catchAsync(
  async (_req: Request, res: Response) => {
    const orders = await Order.find().sort({ createdAt: 1 });
    const now = new Date();
    const revenueSeries = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const label = monthFormatter.format(date);
      const value = orders
        .filter(
          (order) =>
            order.createdAt.getFullYear() === date.getFullYear() &&
            order.createdAt.getMonth() === date.getMonth()
        )
        .reduce((sum, order) => sum + order.total, 0);

      return { label, value };
    });

    const channelBreakdown = [
      {
        label: "Delivered",
        value: orders.filter((order) => order.status === "delivered").length,
      },
      {
        label: "Processing",
        value: orders.filter((order) => order.status === "processing").length,
      },
      {
        label: "Pending",
        value: orders.filter((order) => order.status === "pending").length,
      },
    ];

    const topProducts = await Product.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .then((products) =>
        products.map((product) => ({
          label: product.productName,
          value: product.productPrice * product.stock,
        }))
      );

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = orders.length === 0 ? 0 : totalSales / orders.length;
    const deliveredOrders = orders.filter((order) => order.status === "delivered").length;
    const conversionRate = orders.length === 0 ? 0 : (deliveredOrders / orders.length) * 100;
    const returningCustomers = new Set(
      orders
        .filter((order) => order.customerEmail)
        .map((order) => order.customerEmail?.toLowerCase())
    ).size;

    return res.status(200).json({
      success: true,
      revenueSeries,
      channelBreakdown,
      topProducts,
      conversionRate,
      averageOrderValue,
      returningCustomers,
    });
  }
);
