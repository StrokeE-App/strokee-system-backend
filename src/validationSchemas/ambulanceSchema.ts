import Joi from "joi";

export const ambulanceUpdateSchema = Joi.object({
    ambulanceId: Joi.string().required().messages({
        "any.string": "El ID de ambulancia debe ser un texto.",
        "any.required": "El ID de ambulancia es obligatorio."
    })
})