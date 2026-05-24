import mongoose, { Document, Schema } from "mongoose";

export interface IProductImage {
  url: string;
  publicId: string;
}

export interface IProductColorVariant {
  color: string;
  stock: number;
}

export interface IProduct extends Document {
  productName: string;
  productPrice: number;
  productCost: number;
  productDescription: string;
  productImages: IProductImage[];
  productCategory: string;
  colors: string[];
  colorVariants: IProductColorVariant[];
  stock: number;
  discountPercentage: number;
  offerLabel?: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
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

const productColorVariantSchema = new Schema<IProductColorVariant>(
  {
    color: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
    productCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
    colors: {
      type: [String],
      default: [],
    },
    colorVariants: {
      type: [productColorVariantSchema],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    offerLabel: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<IProduct>("Product", productSchema);
