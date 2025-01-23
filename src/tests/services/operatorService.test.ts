import { addOperatorIntoCollection } from '../../services/operators/operatorService';
import { firebaseAdmin } from '../../config/firebase-config';
import operatorModel from '../../models/usersModels/operatorModel';
import rolesModel from '../../models/usersModels/rolesModel';

jest.mock('../../models/usersModels/operatorModel');
jest.mock('../../models/usersModels/rolesModel');
jest.mock('../../config/firebase-config');

describe('addOperatorIntoCollection', () => {
    it('should return an error when a required field is missing', async () => {
        const result = await addOperatorIntoCollection(
            '', // firstName is missing
            'Doe',
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al agregar al Operador: El campo firstName es requerido.');
    });

    it('should return an error when firstName is not valid', async () => {
        const result = await addOperatorIntoCollection(
            'A'.repeat(101), // invalid firstName, exceeds the character limit
            'Doe',
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al agregar al Operador: El nombre AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA excede el límite de caracteres permitido.');
    });

    it('should return an error when lastName is not valid', async () => {
        const result = await addOperatorIntoCollection(
            'John',
            'A'.repeat(101), // invalid lastName, exceeds the character limit
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al agregar al Operador: El apellido AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA excede el límite de caracteres permitido.');
    });

    it('should return an error when email format is invalid', async () => {
        const result = await addOperatorIntoCollection(
            'John',
            'Doe',
            'invalid-email', // invalid email
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al agregar al Operador: El correo electrónico invalid-email no tiene un formato válido.');
    });

    it('should return an error when password is too short', async () => {
        const result = await addOperatorIntoCollection(
            'John',
            'Doe',
            'johndoe@example.com',
            'short' // invalid password, less than 8 characters
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al agregar al Operador: La contraseña debe tener al menos 8 caracteres.');
    });

    it('should return an error if the email is already registered', async () => {
        operatorModel.findOne = jest.fn().mockResolvedValue({ email: 'johndoe@example.com' }); // Mocked existing operator

        const result = await addOperatorIntoCollection(
            'John',
            'Doe',
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('El email johndoe@example.com ya está registrado.');
    });

    it('should return an error when Firebase user creation fails', async () => {
        operatorModel.findOne = jest.fn().mockResolvedValue(null); // No existing operator
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({}); // Firebase creates user but without UID

        const result = await addOperatorIntoCollection(
            'John',
            'Doe',
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al agregar al Operador: No se pudo crear el usuario en Firebase.');
    });

    it('should return success when the operator is added successfully', async () => {
        operatorModel.findOne = jest.fn().mockResolvedValue(null); // No existing operator
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: 'operator123' }); // Firebase user created with UID

        operatorModel.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 1 }); // Mock successful insert
        rolesModel.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 1 }); // Mock successful role assignment

        const result = await addOperatorIntoCollection(
            'John',
            'Doe',
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(true);
        expect(result.message).toBe('Operador agregado exitosamente.');
        expect(result.operatorId).toBe('operator123');
    });

    it('should return success but with no changes when operator is already up-to-date', async () => {
        operatorModel.findOne = jest.fn().mockResolvedValue(null); // No existing operator
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: 'operator123' }); // Firebase user created with UID

        operatorModel.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 0 }); // Mock no changes made
        rolesModel.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 0 }); // Mock no changes made

        const result = await addOperatorIntoCollection(
            'John',
            'Doe',
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('No se realizaron cambios en la base de datos.');
    });
});
