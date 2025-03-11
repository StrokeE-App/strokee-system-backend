import { IEmergencyContact } from "../models/usersModels/emergencyContactModel";
import { MAX_FIRST_NAME_LENGTH, MAX_LAST_NAME_LENGTH } from "../config/constantsUsers";
import { isBoolean } from "util";


export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phoneNumber);
};

export const isValidFirstName = (firstName: string): boolean => {
    return firstName.length <= MAX_FIRST_NAME_LENGTH;
}

export const isValidLastName = (lastName: string): boolean => {
    return lastName.length <= MAX_LAST_NAME_LENGTH;
}

export const isValidPassword = (password: string): boolean => {
    return password.length >= 8;
}

export const validateEmergencyContact = (contact: IEmergencyContact) => {
    if (contact.email && !isValidEmail(contact.email)) {
        throw new Error(`El correo electrónico ${contact.email} no tiene un formato válido.`);
    }

    if (contact.phoneNumber && !isValidPhoneNumber(contact.phoneNumber)) {
        throw new Error(`El número de teléfono ${contact.phoneNumber} no tiene un formato válido.`);
    }

    if (!contact.firstName || !contact.lastName || !contact.phoneNumber || !contact.email) {
        throw new Error("Cada contacto debe tener un nombre, apellido, un número de teléfono y correo electrónico.");
    }

    if (contact.firstName && contact.firstName.length > MAX_FIRST_NAME_LENGTH) {
        throw new Error(`El nombre del contacto ${contact.firstName} excede el límite de ${MAX_FIRST_NAME_LENGTH} caracteres.`);
    }

    if (contact.lastName && contact.lastName.length > MAX_LAST_NAME_LENGTH) {
        throw new Error(`El apellido del contacto ${contact.lastName} excede el límite de ${MAX_LAST_NAME_LENGTH} caracteres.`);
    }
};