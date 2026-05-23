import mongoose, { Document, Schema } from "mongoose";

export interface IProductImage {
  url: string;
  publicId: string;
}

export interface IProduct extends Document {
  productName: string;
  productPrice: number;
  productDescription: string;
  productImages: IProductImage[];
  productCategory: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const productSchema: Schema<IProduct> = new Schema(
  {
    productName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    productPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    productDescription: {
      type: String,
      required: true,
      trim: true,
    },
    productImages: {
      type: [productImageSchema],
      required: true,
      default: [],
      validate: {
        validator: (images: IProductImage[]) => images.length > 0,
        message: "At least one product image is required",
      },
    },
    productCategory: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<IProduct>("Product", productSchema);
