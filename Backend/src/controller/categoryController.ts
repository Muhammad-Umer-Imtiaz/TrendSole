import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { Category } from "../models/categoryModel.js";
import { Product } from "../models/productModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validation/categoryValidation.js";

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const serializeCategory = async (category: {
  _id: unknown;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: String(category._id),
  name: category.name,
  slug: category.slug,
  description: category.description ?? "",
  isActive: category.isActive,
  productCount: await Product.countDocuments({
    productCategory: category.name,
  }),
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

export const listCategories = catchAsync(async (req: Request, res: Response) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const includeInactive = req.query.includeInactive === "true";
  const filter = search
    ? {
        ...(includeInactive ? {} : { isActive: true }),
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      }
    : includeInactive
      ? {}
      : { isActive: true };

  const categories = await Category.find(filter).sort({ name: 1 });
  const data = await Promise.all(categories.map((category) => serializeCategory(category)));

  return res.status(200).json({
    success: true,
    categories: data,
  });
});

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const validatedData = createCategorySchema.parse(req.body);
  const slug = toSlug(validatedData.name);

  if (!slug) {
    throw new AppError("Category slug could not be generated", 400);
  }

  const existingCategory = await Category.findOne({
    $or: [{ name: validatedData.name }, { slug }],
  });

  if (existingCategory) {
    throw new AppError("Category already exists", 400);
  }

  const category = await Category.create({
    ...validatedData,
    slug,
  });

  return res.status(201).json({
    success: true,
    message: "Category created successfully",
    category: await serializeCategory(category),
  });
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const validatedData = updateCategorySchema.parse(req.body);
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (validatedData.name !== undefined) {
    const nextSlug = toSlug(validatedData.name);

    if (!nextSlug) {
      throw new AppError("Category slug could not be generated", 400);
    }

    const existingCategory = await Category.findOne({
      _id: { $ne: category._id },
      $or: [{ name: validatedData.name }, { slug: nextSlug }],
    });

    if (existingCategory) {
      throw new AppError("Category already exists", 400);
    }

    const previousCategoryName = category.name;
    category.name = validatedData.name;
    category.slug = nextSlug;

    if (previousCategoryName !== validatedData.name) {
      await Product.updateMany(
        { productCategory: previousCategoryName },
        { $set: { productCategory: validatedData.name } }
      );
    }
  }

  if (validatedData.description !== undefined) {
    category.description = validatedData.description;
  }

  if (validatedData.isActive !== undefined) {
    category.isActive = validatedData.isActive;
  }

  await category.save();

  return res.status(200).json({
    success: true,
    message: "Category updated successfully",
    category: await serializeCategory(category),
  });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const assignedProducts = await Product.countDocuments({
    productCategory: category.name,
  });

  if (assignedProducts > 0) {
    throw new AppError(
      "Cannot delete a category that is assigned to products",
      400
    );
  }

  await category.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
