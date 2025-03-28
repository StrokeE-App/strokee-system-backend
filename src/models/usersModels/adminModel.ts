import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
    adminId : string;
    firstName: string;
    lastName: string;
    email: string;
}

const AdminSchema: Schema = new Schema(
    {
        adminId: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model<IAdmin>("admins", AdminSchema);
