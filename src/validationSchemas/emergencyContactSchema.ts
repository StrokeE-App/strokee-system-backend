import Joi from "joi";

export const emergencyContactSchema = Joi.object({
    firstName: Joi.string().max(50).required().messages({
        "string.max": "El nombre no puede tener más de 50 caracteres.",
        "any.required": "El nombre es obligatorio."
    }),
    lastName: Joi.string().max(50).required().messages({
        "string.max": "El apellido no puede tener más de 50 caracteres.",
        "any.required": "El apellido es obligatorio."
    }),
    phoneNumber: Joi.string().length(10).pattern(/^\d+$/).required().messages({
        "string.length": "El número de teléfono debe tener exactamente 10 dígitos.",
        "string.pattern.base": "El número de teléfono solo debe contener números.",
        "any.required": "El número de teléfono es obligatorio."
    }),
    email: Joi.string().email().required().messages({
        "string.email": "El correo-elected debe ser valido.",
        "any.required": "El correo-elected es obligatorio."
    }),
    relationship: Joi.string().required().messages({
        "any.required": "La relación es obligatoria.",
        "string.base": "La relacion debe ser un string"
    })
})