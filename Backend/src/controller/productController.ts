import type { Request, Response } from "express";
import crypto from "crypto";
import { Category } from "../models/categoryModel.js";
import { getCloudinaryConfig } from "../config/cloudinary.js";
import { AppError } from "../errors/AppError.js";
import { Product, type IProductImage } from "../models/productModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validation/productValidation.js";

const PRODUCT_IMAGE_FOLDER = "trendsole/products";

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  error?: {
    message?: string;
  };
}

interface CloudinaryDestroyResponse {
  result?: string;
  error?: {
    message?: string;
  };
}

const getUploadedFiles = (req: Request) => {
  if (!req.files) {
    return [] as Express.Multer.File[];
  }

  return Array.isArray(req.files) ? req.files : [];
};

const createCloudinarySignature = (
  params: Record<string, string>,
  apiSecret: string
) => {
  const signatureBase = Object.entries(params)
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${signatureBase}${apiSecret}`)
    .digest("hex");
};

const uploadSingleImage = async (file: Express.Multer.File) => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedParams = {
    folder: PRODUCT_IMAGE_FOLDER,
    format: "webp",
    timestamp,
    transformation: "q_auto:good",
  };
  const signature = createCloudinarySignature(signedParams, apiSecret);
  const formData = new FormData();
  const fileBytes = new Uint8Array(file.buffer);

  formData.append(
    "file",
    new Blob([fileBytes], { type: file.mimetype }),
    file.originalname
  );
  formData.append("api_key", apiKey);
  formData.append("folder", signedParams.folder);
  formData.append("format", signedParams.format);
  formData.append("timestamp", signedParams.timestamp);
  formData.append("transformation", signedParams.transformation);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const result = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !result.secure_url || !result.public_id) {
    throw new AppError(
      result.error?.message ?? "Failed to upload image to Cloudinary",
      500
    );
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

const deleteCloudinaryImages = async (publicIds: string[]) => {
  if (publicIds.length === 0) {
    return;
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  await Promise.allSettled(
    publicIds.map(async (publicId) => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signedParams = {
        public_id: publicId,
        timestamp,
      };
      const signature = createCloudinarySignature(signedParams, apiSecret);
      const formData = new FormData();

      formData.append("api_key", apiKey);
      formData.append("public_id", publicId);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = (await response.json()) as CloudinaryDestroyResponse;

      if (!response.ok || result.error?.message) {
        throw new AppError(
          result.error?.message ?? "Failed to delete image from Cloudinary",
          500
        );
      }
    })
  );
};

const uploadProductFiles = async (files: Express.Multer.File[]) => {
  const uploadedImages: IProductImage[] = [];

  try {
    for (const file of files) {
      uploadedImages.push(await uploadSingleImage(file));
    }

    return uploadedImages;
  } catch (error) {
    await deleteCloudinaryImages(
      uploadedImages.map((image) => image.publicId)
    );
    throw error;
  }
};

const parsePositiveNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const parseQueryBoolean = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  return undefined;
};

const parseQueryList = (value: unknown) => {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const dedupeColors = (colors: string[]) => {
  const seen = new Set<string>();

  return colors
    .map((color) => color.trim())
    .filter(Boolean)
    .filter((color) => {
      const normalizedKey = color.toLowerCase();

      if (seen.has(normalizedKey)) {
        return false;
      }

      seen.add(normalizedKey);
      return true;
    });
};

const buildProductInventory = ({
  colors,
  colorVariants,
  stock,
}: {
  colors: string[];
  colorVariants: Array<{ color: string; stock: number }>;
  stock: number;
}) => {
  const variantMap = new Map<string, { color: string; stock: number }>();

  for (const variant of colorVariants) {
    const color = variant.color.trim();

    if (!color) {
      continue;
    }

    const normalizedKey = color.toLowerCase();
    const existingVariant = variantMap.get(normalizedKey);

    if (existingVariant) {
      existingVariant.stock += variant.stock;
      continue;
    }

    variantMap.set(normalizedKey, {
      color,
      stock: Math.max(0, variant.stock),
    });
  }

  const normalizedVariants = Array.from(variantMap.values());

  if (normalizedVariants.length > 0) {
    return {
      colors: normalizedVariants.map((variant) => variant.color),
      colorVariants: normalizedVariants,
      stock: normalizedVariants.reduce((sum, variant) => sum + variant.stock, 0),
    };
  }

  return {
    colors: dedupeColors(colors),
    colorVariants: [] as Array<{ color: string; stock: number }>,
    stock: Math.max(0, stock),
  };
};

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const validatedData = createProductSchema.parse(req.body);
  const files = getUploadedFiles(req);
  const inventory = buildProductInventory(validatedData);

  const category = await Category.findOne({
    name: validatedData.productCategory,
    isActive: true,
  });

  if (!category) {
    throw new AppError("Select a valid active category before saving the product", 400);
  }

  if (files.length === 0) {
    throw new AppError("At least one product image is required", 400);
  }

  const uploadedImages = await uploadProductFiles(files);

  try {
    const product = await Product.create({
      ...validatedData,
      ...inventory,
      productImages: uploadedImages,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    await deleteCloudinaryImages(uploadedImages.map((image) => image.publicId));
    throw error;
  }
});

export const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const page = parsePositiveNumber(req.query.page, 1);
  const limit = parsePositiveNumber(req.query.limit, 12);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const minPrice = Number(req.query.minPrice ?? 0);
  const maxPrice = Number(req.query.maxPrice ?? Number.MAX_SAFE_INTEGER);
  const includeInactive = req.query.includeInactive === "true";
  const categoryQuery =
    typeof req.query.category === "string" ? req.query.category.trim() : "";
  const categories = categoryQuery
    ? categoryQuery
        .split(",")
        .map((category) => category.trim())
        .filter(Boolean)
    : [];
  const colors = parseQueryList(req.query.colors);
  const isFeatured = parseQueryBoolean(req.query.featured);
  const isNewArrival = parseQueryBoolean(req.query.newArrival);
  const isBestSeller = parseQueryBoolean(req.query.bestSeller);
  const filter: Record<string, unknown> = {};

  if (!includeInactive) {
    filter.isActive = true;
  }

  if (search) {
    filter.$or = [
      { productName: { $regex: search, $options: "i" } },
      { productDescription: { $regex: search, $options: "i" } },
      { productCategory: { $regex: search, $options: "i" } },
      { colors: { $elemMatch: { $regex: search, $options: "i" } } },
    ];
  }

  if (categories.length > 0) {
    filter.productCategory = { $in: categories };
  }

  if (colors.length > 0) {
    filter.colors = { $in: colors };
  }

  if (typeof isFeatured === "boolean") {
    filter.isFeatured = isFeatured;
  }

  if (typeof isNewArrival === "boolean") {
    filter.isNewArrival = isNewArrival;
  }

  if (typeof isBestSeller === "boolean") {
    filter.isBestSeller = isBestSeller;
  }

  filter.productPrice = {
    $gte: Number.isFinite(minPrice) ? minPrice : 0,
    $lte: Number.isFinite(maxPrice) ? maxPrice : Number.MAX_SAFE_INTEGER,
  };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    count: products.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    products,
  });
});

export const getSingleProduct = catchAsync(
  async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === "true";
    const product = await Product.findOne({
      _id: req.params.id,
      ...(includeInactive ? {} : { isActive: true }),
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      productCategory: product.productCategory,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(4);

    return res.status(200).json({
      success: true,
      product,
      relatedProducts,
    });
  }
);

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const validatedData = updateProductSchema.parse(req.body);
  const files = getUploadedFiles(req);
  const hasBodyUpdates = Object.keys(validatedData).length > 0;
  const hasNewImages = files.length > 0;

  if (!hasBodyUpdates && !hasNewImages) {
    throw new AppError(
      "Provide at least one product field or image to update",
      400
    );
  }

  let uploadedImages: IProductImage[] = [];
  const previousImagePublicIds = product.productImages.map(
    (image) => image.publicId
  );

  if (hasNewImages) {
    uploadedImages = await uploadProductFiles(files);
  }

  if (validatedData.productName !== undefined) {
    product.productName = validatedData.productName;
  }

  if (validatedData.productPrice !== undefined) {
    product.productPrice = validatedData.productPrice;
  }

  if (validatedData.productCost !== undefined) {
    product.productCost = validatedData.productCost;
  }

  if (validatedData.productDescription !== undefined) {
    product.productDescription = validatedData.productDescription;
  }

  if (validatedData.productCategory !== undefined) {
    const category = await Category.findOne({
      name: validatedData.productCategory,
      isActive: true,
    });

    if (!category) {
      throw new AppError(
        "Select a valid active category before updating the product",
        400
      );
    }

    product.productCategory = validatedData.productCategory;
  }

  if (validatedData.colorVariants !== undefined) {
    const inventory = buildProductInventory({
      colors: validatedData.colors ?? product.colors,
      colorVariants: validatedData.colorVariants,
      stock: validatedData.stock ?? product.stock,
    });

    product.colors = inventory.colors;
    product.colorVariants = inventory.colorVariants;
    product.stock = inventory.stock;
  } else {
    if (validatedData.stock !== undefined) {
      product.stock = validatedData.stock;
    }

    if (validatedData.colors !== undefined) {
      product.colors = dedupeColors(validatedData.colors);
    }
  }

  if (validatedData.isActive !== undefined) {
    product.isActive = validatedData.isActive;
  }

  if (validatedData.discountPercentage !== undefined) {
    product.discountPercentage = validatedData.discountPercentage;
  }

  if (validatedData.offerLabel !== undefined) {
    product.offerLabel = validatedData.offerLabel;
  }

  if (validatedData.isFeatured !== undefined) {
    product.isFeatured = validatedData.isFeatured;
  }

  if (validatedData.isNewArrival !== undefined) {
    product.isNewArrival = validatedData.isNewArrival;
  }

  if (validatedData.isBestSeller !== undefined) {
    product.isBestSeller = validatedData.isBestSeller;
  }

  if (hasNewImages) {
    product.productImages = uploadedImages;
  }

  try {
    await product.save();
  } catch (error) {
    if (uploadedImages.length > 0) {
      await deleteCloudinaryImages(
        uploadedImages.map((image) => image.publicId)
      );
    }
    throw error;
  }

  if (hasNewImages) {
    await deleteCloudinaryImages(previousImagePublicIds);
  }

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product,
  });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const imagePublicIds = product.productImages.map((image) => image.publicId);

  await product.deleteOne();
  await deleteCloudinaryImages(imagePublicIds);

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
