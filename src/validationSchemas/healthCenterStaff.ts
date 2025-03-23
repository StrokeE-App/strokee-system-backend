import Joi from "joi";

export const healthCenterStaffSchema = Joi.object({
    firstName: Joi.string().max(50).required().messages({
        "string.max": "El nombre no puede tener más de 50 caracteres.",
        "any.required": "El nombre es obligatorio."
    }),
    lastName: Joi.string().max(50).required().messages({
        "string.max": "El apellido no puede tener más de 50 caracteres.",
        "any.required": "El apellido es obligatorio."
    }),
    email: Joi.string().email().required().messages({
        "string.email": "El correo electrónico debe ser valido.",
        "any.required": "El correo és obligatorio."
    }),
    password: Joi.string().min(8).required().messages({
        "string.min": "La contraseña debe tener al menos 8 caracteres.",
        "any.required": "La contraseña es obligatoria."
    }),
    healthcenterId: Joi.string().required().messages({
        "any.required": "El ID de centro de salud es obligatorio."
    })
});

export const updateHealthCenterStaffSchema = Joi.object({
    firstName: Joi.string().max(50).required().messages({
        "string.max": "El nombre no puede tener más de 50 caracteres.",
        "any.required": "El nombre es obligatorio."
    }),
    lastName: Joi.string().max(50).required().messages({
        "string.max": "El apellido no puede tener más de 50 caracteres.",
        "any.required": "El apellido es obligatorio."
    })
})