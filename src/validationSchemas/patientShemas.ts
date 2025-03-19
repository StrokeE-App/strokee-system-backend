import Joi from "joi";

const commonValidations = {
    firstName: Joi.string().max(50).required().messages({
        "string.max": "El nombre no puede tener más de 50 caracteres.",
        "any.required": "El nombre es obligatorio."
    }),
    lastName: Joi.string().max(50).required().messages({
        "string.max": "El apellido no puede tener más de 50 caracteres.",
        "any.required": "El apellido es obligatorio."
    }),
    phoneNumber: Joi.string().length(10).pattern(/^\d+$/).required().messages({
        "any.required": "El número de teléfono es obligatorio.",
        "string.length": "El número de teléfono debe tener exactamente 10 dígitos.",
        "string.pattern.base": "El número de teléfono solo debe contener números.",
        "string.base":"El numero de telefono debe ser un string"
    })
};

export const patientSchema = Joi.object({
    ...commonValidations,
    email: Joi.string().email().required().messages({
        "string.email": "El correo-elected debe ser valido.",
        "any.required": "El correo-elected es obligatorio."
    }),
    age: Joi.number().integer().required().messages({
        "number.base": "La edad debe ser un número.",
        "any.required": "La edad es obligatoria."
    }),
    birthDate: Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).required()
        .messages({
           "string.pattern.base": "La fecha de nacimiento debe tener el formato YYYY-MM-DD.",
            "any.required": "La fecha de nacimiento es obligatoria."
        }),
    password: Joi.string().min(8).required().messages({
        "string.min": "La contraseña debe tener al menos 8 caracteres.",
        "any.required": "La contraseña es obligatoria."
    }),
    weight: Joi.number().required().messages({
        "number.base": "El peso debe ser un número.",
        "any.required": "El peso es obligatorio."
    }),
    height: Joi.number().required().messages({
        "number.base": "La altura debe ser un número.",
        "any.required": "La altura es obligatoria."
    }),
    token: Joi.string().required().messages({
       "any.required": "El token es obligatorio.",
       "string.base": "El token debe ser un string."
    }),
    emergencyContact: Joi.array().items(Joi.object({
        firstName: Joi.string().max(50).required().messages({
            "string.max": "El nombre no puede tener más de 50 caracteres.",
            "any.required": "El nombre es obligatorio.",
            "string.base": "El nombre debe ser un string"
        }),
        lastName: Joi.string().max(50).required().messages({
            "string.max": "El apellido no puede tener más de 50 caracteres.",
            "any.required": "El apellido es obligatorio.",
            "string.base": "El apellido debe ser un string"
        }),
        phoneNumber: Joi.string().length(10).pattern(/^\d+$/).required().messages({
            "string.length": "El número de teléfono debe tener exactamente 10 dígitos.",
            "string.pattern.base": "El número de teléfono solo debe contener números.",
            "any.required": "El número de teléfono es obligatorio.",
            "string.base": "El numero de telefono debe ser un string"
        }),
        email: Joi.string().email().required().messages({
            "string.email": "El correo electrónico debe ser valido.",
            "any.required": "El correo electrónico es obligatorio.",
            "string.base": "El correo electrónico debe ser un string"
        }),
        relationship: Joi.string().required().messages({
            "any.required": "La relación es obligatoria.",
            "string.base": "La relacion debe ser un string"
        })
    })),
    medications: Joi.array().items(Joi.string()).required().messages({
        "array.base": "La lista de medicamentos debe ser un array de textos.",
        "any.required": "Los medicamentos son obligatorios."
    }),
    conditions: Joi.array().items(Joi.string()).required().messages({
        "array.base": "La lista de condiciones debe ser un array de textos.",
        "any.required": "Las condiciones son obligatorias."
    })
});

export const patientUpadteSchema = Joi.object({
    ...commonValidations,
    age: Joi.number().integer().required().messages({
        "number.base": "La edad debe ser un número.",
        "any.required": "La edad es obligatoria."
    }),
    birthDate: Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).required()
        .messages({
           "string.pattern.base": "La fecha de nacimiento debe tener el formato YYYY-MM-DD.",
            "any.required": "La fecha de nacimiento es obligatoria."
        }),
    weight: Joi.number().required().messages({
        "number.base": "El peso debe ser un número.",
        "any.required": "El peso es obligatorio."
    }),
    height: Joi.number().required().messages({
        "number.base": "La altura debe ser un número.",
        "any.required": "La altura es obligatoria."
    }),
    medications: Joi.array().items(Joi.string()).required().messages({
        "array.base": "La lista de medicamentos debe ser un array de textos.",
        "any.required": "Los medicamentos son obligatorios."
    }),
    conditions: Joi.array().items(Joi.string()).required().messages({
        "array.base": "La lista de condiciones debe ser un array de textos.",
        "any.required": "Las condiciones son obligatorias."
    })
});


export const patientEmergencyContactSchema = Joi.object({
    verification_code: Joi.string().required().messages({
        "any.required": "El código de verificación es obligatorio."
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
    password: Joi.string().min(8).required().messages({
        "string.min": "La contraseña debe tener al menos 8 caracteres.",
        "any.required": "La contraseña es obligatoria."
    })
})
