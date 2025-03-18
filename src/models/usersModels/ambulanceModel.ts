import mongoose, { Schema, Document } from "mongoose";

export interface IAmbulance extends Document {
    ambulanceId: string;
    status: string;
}

const AmbulanceSchema: Schema = new Schema(
    {
        ambulanceId: { type: String, required: true, unique: true },
        status: { type: String, required: true, default: "AVAILABLE" },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model<IAmbulance>("ambulances", AmbulanceSchema);