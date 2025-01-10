import mongoose, { Schema, Document } from "mongoose";

export interface IParamedic extends Document {
    paramedicId: string;
    ambulanceId: string;
    firstName: string;
    lastName: string;
    email: string;
    isDeleted : boolean;
}

const ParamedicSchema: Schema = new Schema(
    {
        paramedicId: { type: String, required: true, unique: true },
        ambulanceId: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model<IParamedic>("paramedics", ParamedicSchema);
