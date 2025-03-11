export type PatientUpdate = {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    age?: number;
    birthDate?: string; // o Date si manejas fechas en formato Date
    weight?: number;
    height?: number;
    medications?: string[];
    conditions?: string[];
};

export type RegisterEmergencyContactValidation = {
    verification_code: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
};