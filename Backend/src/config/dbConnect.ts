import mongoose from "mongoose";

export const dbConnection = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }

        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        if (mongoose.connection.readyState === 2) {
            return mongoose.connection.asPromise();
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected Succesfully")
        return mongoose.connection;
    } catch (error) {
        console.log("Error Connect to Mongo DB ",error)
        throw error;
    }
};
