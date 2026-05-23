import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  productImage?: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  contactPhone?: string;
  shippingAddress: string;
  notes?: string;
  items: IOrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus?: string;
  itemsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productImage: {
      type: String,
      trim: true,
      default: "",
    },
    productCategory: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },
    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must include at least one item",
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      default: "pending",
      trim: true,
    },
    itemsCount: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
