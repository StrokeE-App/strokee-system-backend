import { IEmergencyContact } from "../models/usersModels/emergencyContactModel";
import { MAX_FIRST_NAME_LENGTH, MAX_LAST_NAME_LENGTH } from "../config/constantsUsers";
import crypto from "crypto";
import { connectToRedis } from "../boostrap";

export const hashEmail = (email: string) => {
    return crypto.createHash("sha256").update(email).digest("hex");
};

export async function validateVerificationCodePatient(email: string, verificationCode: string) {

    const emailHash = hashEmail(email);
    const redisClient = await connectToRedis();
    const storedData = await redisClient.get(`registerPatient:${emailHash}`);

    if (!storedData) {
        throw new Error("El correo electronico o el codigo de verificacion es incorrecto.");
    }

    const { code, medicId } = JSON.parse(storedData); 

    if (code !== verificationCode) {
        throw new Error("El código de verificación es incorrecto");
    }

    return { medicId };
}
