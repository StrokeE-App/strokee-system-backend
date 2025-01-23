import mongoose, { Schema, Document } from "mongoose";

export interface IOperator extends Document {
    operatorId : string;
    firstName: string;
    lastName: string;
    email: string;
    isDeleted : boolean;
}

const OperatorSchema: Schema = new Schema(
    {
        operatorId: { type: String, required: true, unique: true },
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

export default mongoose.model<IOperator>("operators", OperatorSchema);
