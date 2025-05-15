import mongoose, { Schema, Document } from "mongoose";

export interface IAmbulance extends Document {
    ambulanceId: string;
}

const AmbulanceSchema: Schema = new Schema(
    {
        ambulanceId: { type: String, required: true, unique: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model<IAmbulance>("ambulances", AmbulanceSchema);