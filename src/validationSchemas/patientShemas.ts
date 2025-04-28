import Joi from "joi";

const commonValidations = {
    firstName: Joi.string().max(50).required().messages({
        "string.max": "El nombre no puede tener más de 50 caracteres.",
        "any.required": "El nombre es obligatorio.",
        "string.empty": "El nombre no puede estar vacio.",
    }),
    lastName: Joi.string().max(50).required().messages({
        "string.max": "El apellido no puede tener más de 50 caracteres.",
        "any.required": "El apellido es obligatorio.",
        "string.empty": "El apellido no puede estar vacio.",
    }),
    phoneNumber: Joi.string().length(10).pattern(/^\d+$/).required().messages({
        "any.required": "El número de teléfono es obligatorio.",
        "string.length": "El número de teléfono debe tener exactamente 10 dígitos.",
        "string.pattern.base": "El número de teléfono solo debe contener números.",
        "string.base":"El numero de telefono debe ser un string",
        "string.empty": "El número de teléfono no puede estar vacio."
    })
};

export const patientSchema = Joi.object({
    ...commonValidations,
    email: Joi.string().email().required().messages({
        "string.email": "El correo debe ser valido.",
        "any.required": "El correo es obligatorio.",
        "string.empty": "El correo no puede estar vacio.",
    }),
    age: Joi.number().integer().required().messages({
        "number.base": "La edad debe ser un número.",
        "any.required": "La edad es obligatoria.",
        "number.empty": "La edad no puede estar vacia."
    }),
    birthDate: Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).required()
        .messages({
           "string.pattern.base": "La fecha de nacimiento debe tener el formato YYYY-MM-DD.",
            "any.required": "La fecha de nacimiento es obligatoria.",
            "string.empty": "La fecha de nacimiento no puede estar vacia."
        }),
    password: Joi.string().min(8).required().messages({
        "string.min": "La contraseña debe tener al menos 8 caracteres.",
        "any.required": "La contraseña es obligatoria.",
        "string.empty": "La contraseña no puede estar vacia."
    }),
    weight: Joi.number().required().messages({
        "number.base": "El peso debe ser un número.",
        "any.required": "El peso es obligatorio.",
        "number.empty": "El peso no puede estar vacio."
    }),
    height: Joi.number().required().messages({
        "number.base": "La altura debe ser un número.",
        "any.required": "La altura es obligatoria.",
        "number.empty": "La altura no puede estar vacia."
    }),
    token: Joi.string().required().messages({
       "any.required": "El token es obligatorio.",
       "string.base": "El token debe ser un string.",
        "string.empty": "El token no puede estar vacio."
    }),
    emergencyContact: Joi.array().items(Joi.object({
        firstName: Joi.string().max(50).required().messages({
            "string.max": "El nombre del contacto de emergencia no puede tener más de 50 caracteres.",
            "any.required": "El nombre del contacto de emergencia es obligatorio.",
            "string.base": "El nombre del contacto de emergencia debe ser un string",
            "string.empty": "El nombre del contacto de emergencia no puede estar vacio."
        }),
        lastName: Joi.string().max(50).required().messages({
            "string.max": "El apellido del contacto de emergencia no puede tener más de 50 caracteres.",
            "any.required": "El apellido del contacto de emergencia es obligatorio.",
            "string.base": "El apellido del contacto de emergencia debe ser un string",
            "string.empty": "El apellido del contacto de emergencia no puede estar vacio."
        }),
        phoneNumber: Joi.string().length(10).pattern(/^\d+$/).required().messages({
            "string.length": "El número de teléfono del contacto de emergencia debe tener exactamente 10 dígitos.",
            "string.pattern.base": "El número de teléfono del contacto de emergencia solo debe contener números.",
            "any.required": "El número de del contacto de emergencia teléfono es obligatorio.",
            "string.base": "El numero de telefono del contacto de emergencia debe ser un string",
            "string.empty": "El número de teléfono del contacto de emergencia no puede estar vacio."
        }),
        email: Joi.string().email().required().messages({
            "string.email": "El correo electrónico del contacto de emergencia debe ser valido.",
            "any.required": "El correo electrónico del contacto de emergencia es obligatorio.",
            "string.base": "El correo electrónico del contacto de emergencia debe ser un string",
            "string.empty": "El correo electrónico del contacto de emergencia no puede estar vacio."
        }),
        relationship: Joi.string().required().messages({
            "any.required": "La relación con contacto el emergencia es obligatoria.",
            "string.base": "La relacion con contacto el emergencia debe ser un string",
            "string.empty": "La relacion con contacto el emergencia no puede estar vacia."
        })
    })),
    medications: Joi.array().items(Joi.string()).required().messages({
        "array.base": "La lista de medicamentos debe ser un array de textos.",
        "any.required": "Los medicamentos son obligatorios.",
        "array.empty": "La lista de medicamentos no puede estar vacia."
    }),
    conditions: Joi.array().items(Joi.string()).required().messages({
        "array.base": "La lista de condiciones debe ser un array de textos.",
        "any.required": "Las condiciones son obligatorias.",
        "array.empty": "La lista de condiciones no puede estar vacia."
    }),
    termsAndConditions: Joi.boolean().required().messages({
        "boolean.base": "Los terminos y condiciones deben ser un booleano.",
        "any.required": "Los terminos y condiciones son obligatorios.",
        "boolean.empty": "Los terminos y condiciones no pueden estar vacios."
    }), 
    registerDate: Joi.date().required().messages({
        "date.base": "La fecha de registro debe ser una fecha.",
        "any.required": "La fecha de registro es obligatoria.",
        "date.empty": "La fecha de registro no puede estar vacia."
    })
});

export const patientUpadteSchema = Joi.object({
    ...commonValidations,
    age: Joi.number().integer().required().messages({
        "number.base": "La edad debe ser un número.",
        "any.required": "La edad es obligatoria.",
        "number.empty": "La edad no puede estar vacia."
    }),
    birthDate: Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).required()
        .messages({
           "string.pattern.base": "La fecha de nacimiento debe tener el formato YYYY-MM-DD.",
            "any.required": "La fecha de nacimiento es obligatoria.",
            "string.empty": "La fecha de nacimiento no puede estar vacia."
        }),
    weight: Joi.number().required().messages({
        "number.base": "El peso debe ser un número.",
        "any.required": "El peso es obligatorio.",
        "number.empty": "El peso no puede estar vacio."
    }),
    height: Joi.number().required().messages({
        "number.base": "La altura debe ser un número.",
        "any.required": "La altura es obligatoria.",
        "number.empty": "La altura no puede estar vacia."
    }),
    medications: Joi.array().items(Joi.string()).required().messages({
        "array.base": "La lista de medicamentos debe ser un array de textos.",
        "any.required": "Los medicamentos son obligatorios.",
        "array.empty": "La lista de medicamentos no puede estar vacia."
    }),
    conditions: Joi.array().items(Joi.string()).required().messages({
        "array.base": "La lista de condiciones debe ser un array de textos.",
        "any.required": "Las condiciones son obligatorias.",
        "array.empty": "La lista de condiciones no puede estar vacia."
    })
});


export const patientEmergencyContactSchema = Joi.object({
    verification_code: Joi.string().required().messages({
        "any.required": "El código de verificación es obligatorio.",
        "string.base": "El código de verificación debe ser un string.",
        "string.empty": "El código de verificación no puede estar vacio."
    }),
    phoneNumber: Joi.string().length(10).pattern(/^\d+$/).required().messages({
        "string.length": "El número de teléfono debe tener exactamente 10 dígitos.",
        "string.pattern.base": "El número de teléfono solo debe contener números.",
        "any.required": "El número de teléfono es obligatorio.",
        "string.empty": "El número de teléfono no puede estar vacio."
    }),
    email: Joi.string().email().required().messages({
        "string.email": "El correo debe ser valido.",
        "any.required": "El correo es obligatorio.",
        "string.base": "El correo debe ser un string",
        "string.empty": "El correo no puede estar vacio."
    }),
    password: Joi.string().min(8).required().messages({
        "string.min": "La contraseña debe tener al menos 8 caracteres.",
        "any.required": "La contraseña es obligatoria.",
        "string.empty": "La contraseña no puede estar vacia."
    })
})
