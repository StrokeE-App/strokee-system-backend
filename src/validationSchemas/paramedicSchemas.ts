import Joi from "joi";

export const paramedicRegisterSchema = Joi.object({
    firstName: Joi.string().max(50).required().messages({
        "string.max": "El nombre no puede tener más de 50 caracteres.",
        "any.required": "El nombre es obligatorio."
    }),
    lastName: Joi.string().max(50).required().messages({
        "string.max": "El apellido no puede tener más de 50 caracteres.",
        "any.required": "El apellido es obligatorio."
    }),
    email: Joi.string().email().required().messages({
        "string.email": "El correo-elected debe ser valido.",
        "any.required": "El correo-elected es obligatorio."
    }),
    password: Joi.string().min(8).required().messages({
        
    }),
    ambulanceId: Joi.string().required().messages({
        "any.required": "El ID de ambulancia es obligatorio."
    })
})

export const paramedicSchema = Joi.object({
    firstName: Joi.string().max(50).required().messages({
        "string.max": "El nombre no puede tener más de 50 caracteres.",
        "any.required": "El nombre es obligatorio."
    }),
    lastName: Joi.string().max(50).required().messages({
        "string.max": "El apellido no puede tener más de 50 caracteres.",
        "any.required": "El apellido es obligatorio."
    }),
    ambulanceId: Joi.string().required().messages({
        "any.required": "El ID de ambulancia es obligatorio."
    })
});