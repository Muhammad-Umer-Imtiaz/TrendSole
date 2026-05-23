import mongoose from "mongoose";

export const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Database Connected Succesfully")
    } catch (error) {
        console.log("Error Connect to Mongo DB ",error)
    }
};