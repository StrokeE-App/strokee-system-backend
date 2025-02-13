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
        "string.length": "El número de teléfono debe tener exactamente 10 dígitos.",
        "string.pattern.base": "El número de teléfono solo debe contener números.",
        "any.required": "El número de teléfono es obligatorio."
    })
};

export const patientSchema = Joi.object({
    ...commonValidations,
    age: Joi.number().integer().required().messages({
        "number.base": "La edad debe ser un número.",
        "any.required": "La edad es obligatoria."
    }),
    birthDate: Joi.string().pattern(/^\d{2}\/\d{2}\/\d{4}$/).required().messages({
        "string.pattern.base": "La fecha de nacimiento debe tener el formato DD/MM/AAAA.",
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
