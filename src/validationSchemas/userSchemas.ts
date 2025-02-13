import Joi from "joi";


export const passwordSchema = Joi.object({
    password: Joi.string().min(8).required().messages({
        "string.min": "La contraseña debe tener al menos 8 caracteres.",
        "any.required": "La contraseña es obligatoria."
    })
}) 

export const emailSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "El correo electrónico debe ser valido.",
        "any.required": "El correo electrónico es obligatorio."
    })
})