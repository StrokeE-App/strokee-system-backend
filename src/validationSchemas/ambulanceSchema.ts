import Joi from "joi";

export const ambulanceUpdateSchema = Joi.object({
    ambulanceId: Joi.string().messages({
        "any.string": "El ID de ambulancia debe ser un texto."
    }),
    status: Joi.string()
        .valid('TO_AMBULANCE', 'CONFIRMED', 'AVAILABLE')
        .messages({
            'any.only': 'El estado debe ser uno de los siguientes: TO_AMBULANCE, CONFIRMED, AVAILABLE.',
            'string.base': 'El estado debe ser un texto válido.'
        })
})