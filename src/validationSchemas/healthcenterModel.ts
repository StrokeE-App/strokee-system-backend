import Joi from "joi";

export const healthcenterUpdateSchema = Joi.object({
    healthcenterName: Joi.string().required().messages({
        "any.string": "El nombre debe ser un texto.",
        "any.required": "El nombre es obligatorio.",
        "any.empty": "El nombre no puede estar vacío."
    })
})