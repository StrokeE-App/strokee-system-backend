import Joi from "joi";

export const emergencyContactSchema = Joi.object({
    firstName: Joi.string().max(50).required().messages({
        "string.max": "El nombre no puede tener más de 50 caracteres.",
        "any.required": "El nombre es obligatorio.",
        "string.empty": "El nombre no puede estar vacio."
    }),
    lastName: Joi.string().max(50).required().messages({
        "string.max": "El apellido no puede tener más de 50 caracteres.",
        "any.required": "El apellido es obligatorio.",
        "string.empty": "El apellido no puede estar vacio."
    }),
    phoneNumber: Joi.string().length(10).pattern(/^\d+$/).required().messages({
        "string.length": "El número de teléfono debe tener exactamente 10 dígitos.",
        "string.pattern.base": "El número de teléfono solo debe contener números.",
        "any.required": "El número de teléfono es obligatorio.",
        "string.empty": "El número de teléfono no puede estar vacio.",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "El correo debe ser valido.",
        "any.required": "El correo es obligatorio.",
        "string.empty": "El correo no puede estar vacio.",
    }),
    relationship: Joi.string().required().messages({
        "any.required": "La relación es obligatoria.",
        "string.base": "La relacion debe ser un string",
        "string.empty": "La relacion no puede estar vacio."
    })
})