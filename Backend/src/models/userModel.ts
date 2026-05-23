import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "sales_staff" | "customer" | "manager";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    address?: string;
    permissions: string[];
    isActive: boolean;
    isVerified: boolean;
    otp: string | null;
    otpExpiry: Date | null;
    comparePassword(password: string): Promise<boolean>;
    resetPasswordToken:string;
    resetPasswordExpiry:Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        role: {
            type: String,
            enum: ["admin", "sales_staff", "customer", "manager"],
            default: "customer",
        },

        phone: String,

        address: {
            type: String,
            trim: true,
            default: "",
        },

        permissions: {
            type: [String],
            default: [],
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        otp: {
            type: String,
            default: null,
        },

        otpExpiry: {
            type: Date,
            default: null,
        },

        isActive: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken:{
            type:String,
        },
        resetPasswordExpiry:{
            type:Date,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (this: IUser) {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (this: IUser, password: string) {
    return await bcrypt.compare(password, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
