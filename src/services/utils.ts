import modelVerificationCode from "../models/verificationCode";
import crypto from "crypto";

export const hashEmail = (email: string) => {
    return crypto.createHash("sha256").update(email).digest("hex");
};

export async function validateVerificationCodePatient(email: string, verificationCode: string) {

    console.log(email, verificationCode);

    const test = await modelVerificationCode.find({});
    console.log(test);

    const storedData = await modelVerificationCode.findOne({ email: email, type: "REGISTER_PATIENT" });

    console.log(storedData);

    if (!storedData) {
        throw new Error("El correo electronico o el codigo de verificacion es incorrecto.");
    }

    if (storedData.code !== verificationCode) {
        throw new Error("El código de verificación es incorrecto");
    }

    return { medicId: storedData.data.medicId };

}
