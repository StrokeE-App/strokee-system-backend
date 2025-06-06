import {
    addOperatorIntoCollection,
    cancelEmergencyCollectionOperator,
    updateEmergencyPickUpFromCollectionOperator,
    updateOperatorFromCollection, 
    getOperatorFromCollection, 
    deleteOperatorFromCollection
} from '../../services/operators/operatorService';
import { firebaseAdmin } from '../../config/firebase-config';
import { operatorSchema, operatorRegisterSchema } from '../../validationSchemas/operatorSchema';
import operatorModel from '../../models/usersModels/operatorModel';
import rolesModel from '../../models/usersModels/rolesModel';
import emergencyModel from '../../models/emergencyModel';
import * as messagePublisher from '../../services/publisherService';

jest.mock('../../validationSchemas/operatorSchema');
jest.mock('../../models/usersModels/operatorModel');
jest.mock('../../models/usersModels/rolesModel');
jest.mock('../../config/firebase-config');
jest.mock('../../services/publisherService', () => ({
    ...jest.requireActual('../../services/publisherService'),
    publishToExchange: jest.fn()
}));

describe('addOperatorIntoCollection', () => {

    it("should successfully create operator with valid data", async () => {
        // Mock data
        const mockData = {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          password: "securePassword123"
        };
        const mockFirebaseUser = { uid: "firebase-uid" };
        const mockOperator = {
          operatorId: mockFirebaseUser.uid,
          ...mockData
        };
      
        // Mock dependencies
        operatorRegisterSchema.validate = jest.fn().mockReturnValue({ error: null });
        operatorModel.findOne = jest.fn().mockResolvedValue(null);
        firebaseAdmin.createUser = jest.fn().mockResolvedValue(mockFirebaseUser);
        operatorModel.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 1 });
        rolesModel.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 1 });
      
        // Execute
        const result = await addOperatorIntoCollection(
          mockData.firstName,
          mockData.lastName,
          mockData.email,
          mockData.password
        );
      
        // Assertions
        expect(result.success).toBe(true);
        expect(result.message).toBe("Operador agregado exitosamente.");
      });

    
    describe('updateEmergencyPickUpFromCollectionOperator', () => {
        it('should return an error when emergencyId is missing', async () => {
            const result = await updateEmergencyPickUpFromCollectionOperator('', 'ambulance123');
            expect(result.success).toBe(false);
            expect(result.message).toBe('El ID de emergencia es obligatorio.');
        });

        it('should return an error when ambulanceId is missing', async () => {
            const result = await updateEmergencyPickUpFromCollectionOperator('emergency123', '');
            expect(result.success).toBe(false);
            expect(result.message).toBe('El ID de la ambulancia es obligatoria.');
        });

    });

    describe('cancelEmergencyCollectionOperator', () => {
        it('should return an error when emergencyId is missing', async () => {
            const result = await cancelEmergencyCollectionOperator('');
            expect(result.success).toBe(false);
            expect(result.message).toBe('El ID de emergencia es obligatorio.');
        });

        it('should cancel the emergency successfully', async () => {
            emergencyModel.updateOne = jest.fn().mockResolvedValue({ nModified: 1 });

            const result = await cancelEmergencyCollectionOperator('emergency123');
            expect(result.success).toBe(true);
            expect(result.message).toBe('Emergencia stroke descartada.');
            expect(emergencyModel.updateOne).toHaveBeenCalledWith(
                { emergencyId: 'emergency123' },
                { $set: { status: 'CANCELLED' } },
                { upsert: false }
            );
        });

        it('should handle errors during cancellation', async () => {
            emergencyModel.updateOne = jest.fn().mockRejectedValue(new Error('Database error'));

            const result = await cancelEmergencyCollectionOperator('emergency123');
            expect(result.success).toBe(false);
            expect(result.message).toContain('Error al descartar la emergencia: Database error');
        });
    });


    describe('updateOperatorFromCollection', () => {
        it('should return an error when operatorId is missing', async () => {
            const result = await updateOperatorFromCollection('', { firstName: 'John Doe', lastName: 'Doe' });
            expect(result.success).toBe(false);
            expect(result.message).toBe('El ID del operador es obligatorio.');
        });

        it('should return an error when validation fails', async () => {
            (operatorSchema.validate as jest.Mock).mockReturnValue({
                error: { details: [{ message: 'Campo inválido' }] },
            });

            const result = await updateOperatorFromCollection('operator123', { firstName: 'Invalid Name', lastName: 'Invalid Last Name' });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Error de validación: Campo inválido');
        });

        it('should return an error if no operator is found', async () => {
            (operatorSchema.validate as jest.Mock).mockReturnValue({ error: null });
            (operatorModel.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 0 });

            const result = await updateOperatorFromCollection('operator123', { firstName: 'John Doe', lastName: 'Doe' });

            expect(result.success).toBe(false);
            expect(result.message).toBe('No se encontró un operador con ese ID.');
        });

        it('should update the operator successfully', async () => {
            (operatorSchema.validate as jest.Mock).mockReturnValue({ error: null });
            (operatorModel.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

            const result = await updateOperatorFromCollection('operator123', { firstName: 'John Doe', lastName: 'Doe' });

            expect(result.success).toBe(true);
            expect(result.message).toBe('Operador actualizado exitosamente.');
        });

        it('should handle database errors', async () => {
            (operatorSchema.validate as jest.Mock).mockReturnValue({ error: null });
            (operatorModel.updateOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await updateOperatorFromCollection('operator123', { firstName: 'John Doe', lastName: 'Doe' });

            expect(result.success).toBe(false);
            expect(result.message).toContain('Error al actualizar el operador: Database error');
        });
    });

    describe('getOperatorFromCollection', () => {
        it('should return an error when operatorId is missing', async () => {
            const result = await getOperatorFromCollection('');
            expect(result.success).toBe(false);
            expect(result.message).toBe('El ID del operador es obligatorio.');
        });
    
        it('should return an error if no operator is found', async () => {
            (operatorModel.findOne as jest.Mock).mockResolvedValue(null);
    
            const result = await getOperatorFromCollection('operator123');
            expect(result.success).toBe(false);
            expect(result.message).toBe('No se encontró un operador con ese ID.');
        });
    
        it('should return operator data when operator is found', async () => {
            const mockOperator = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
            };
    
            (operatorModel.findOne as jest.Mock).mockResolvedValue(mockOperator);
    
            const result = await getOperatorFromCollection('operator123');
            expect(result.success).toBe(true);
            expect(result.message).toBe('Operador obtenido exitosamente.');
            expect(result.operator).toEqual(mockOperator);
        });
    
        it('should handle database errors gracefully', async () => {
            (operatorModel.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));
    
            const result = await getOperatorFromCollection('operator123');
            expect(result.success).toBe(false);
            expect(result.message).toContain('Error al obtener el operador: Database error');
        });
    
        it('should handle unexpected errors', async () => {
            (operatorModel.findOne as jest.Mock).mockImplementation(() => {
                throw new Error('Unexpected error');
            });
    
            const result = await getOperatorFromCollection('operator123');
            expect(result.success).toBe(false);
            expect(result.message).toBe('Error al obtener el operador: Unexpected error');
        });
    });

    describe('deleteOperatorFromCollection', () => {
        beforeEach(() => {
          jest.clearAllMocks(); // Clear previous mocks before each test
        });
      
        it('should return 400 if operatorId is missing', async () => {
          const result = await deleteOperatorFromCollection('');
      
          expect(result.success).toBe(false);
          expect(result.message).toBe('El ID del operador es obligatorio.');
        });
      
        it('should return 404 if no operator is found', async () => {
          const operatorId = 'nonexistentOperatorId';
          operatorModel.findOne = jest.fn().mockResolvedValue(null); // Mock that operator does not exist
      
          const result = await deleteOperatorFromCollection(operatorId);
      
          expect(result.success).toBe(false);
          expect(result.message).toBe('No se encontró un operador con ese ID.');
        });
      
        it('should return 500 if firebase deletion fails', async () => {
          const operatorId = 'operator123';
          const operator = { operatorId };
          operatorModel.findOne = jest.fn().mockResolvedValue(operator); // Mock that operator exists
          firebaseAdmin.deleteUser = jest.fn().mockRejectedValue(new Error('Firebase deletion failed'));
      
          const result = await deleteOperatorFromCollection(operatorId);
      
          expect(result.success).toBe(false);
          expect(result.message).toBe('Error al eliminar el operador: Firebase deletion failed');
        });
      
        it('should return 200 and successfully delete operator if all operations succeed', async () => {
          const operatorId = 'operator123';
          const operator = { operatorId };
          operatorModel.findOne = jest.fn().mockResolvedValue(operator); // Mock that operator exists
          firebaseAdmin.deleteUser = jest.fn().mockResolvedValue({}); // Mock successful Firebase deletion
          operatorModel.deleteOne = jest.fn().mockResolvedValue({}); // Mock operator deletion
          rolesModel.deleteOne = jest.fn().mockResolvedValue({}); // Mock roles deletion
      
          const result = await deleteOperatorFromCollection(operatorId);
      
          expect(result.success).toBe(true);
          expect(result.message).toBe('Operador eliminado exitosamente.');
          expect(operatorModel.deleteOne).toHaveBeenCalledWith({ operatorId });
          expect(rolesModel.deleteOne).toHaveBeenCalledWith({ userId: operatorId });
        });
      
        it('should return 500 if operatorModel.deleteOne throws an error', async () => {
          const operatorId = 'operator123';
          const operator = { operatorId };
          operatorModel.findOne = jest.fn().mockResolvedValue(operator); // Mock that operator exists
          firebaseAdmin.deleteUser = jest.fn().mockResolvedValue({}); // Mock successful Firebase deletion
          operatorModel.deleteOne = jest.fn().mockRejectedValue(new Error('Operator deletion failed')); // Mock deletion failure
      
          const result = await deleteOperatorFromCollection(operatorId);
      
          expect(result.success).toBe(false);
          expect(result.message).toBe('Error al eliminar el operador: Operator deletion failed');
        });
      
        it('should return 500 if rolesModel.deleteOne throws an error', async () => {
          const operatorId = 'operator123';
          const operator = { operatorId };
          operatorModel.findOne = jest.fn().mockResolvedValue(operator); // Mock that operator exists
          firebaseAdmin.deleteUser = jest.fn().mockResolvedValue({}); // Mock successful Firebase deletion
          operatorModel.deleteOne = jest.fn().mockResolvedValue({}); // Mock operator deletion success
          rolesModel.deleteOne = jest.fn().mockRejectedValue(new Error('Roles deletion failed')); // Mock roles deletion failure
      
          const result = await deleteOperatorFromCollection(operatorId);
      
          expect(result.success).toBe(false);
          expect(result.message).toBe('Error al eliminar el operador: Roles deletion failed');
        });
      });
});
