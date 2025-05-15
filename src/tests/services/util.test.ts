import { hashEmail, validateVerificationCodePatient } from '../../services/utils';
import modelVerificationCode from '../../models/verificationCode';
import crypto from 'crypto';

jest.mock('../../models/verificationCode');

describe('hashEmail', () => {
  it('should return the correct SHA-256 hash for a given email', () => {
    const email = 'test@example.com';
    const expectedHash = crypto.createHash('sha256').update(email).digest('hex');

    const result = hashEmail(email);

    expect(result).toBe(expectedHash);
  });
});

describe('validateVerificationCodePatient', () => {
  const mockEmail = 'test@example.com';
  const mockCode = '123456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if no record is found for the email and type', async () => {
    (modelVerificationCode.findOne as jest.Mock).mockResolvedValue(null);

    await expect(validateVerificationCodePatient(mockEmail, mockCode)).rejects.toThrow(
      'El correo electronico o el codigo de verificacion es incorrecto.'
    );
  });

  it('should throw an error if the verification code does not match', async () => {
    const fakeRecord = {
      email: mockEmail,
      type: 'REGISTER_PATIENT',
      code: 'wrongcode',
      data: { medicId: 'medic123' }
    };

    (modelVerificationCode.findOne as jest.Mock).mockResolvedValue(fakeRecord);

    await expect(validateVerificationCodePatient(mockEmail, mockCode)).rejects.toThrow(
      'El código de verificación es incorrecto'
    );
  });

  it('should return medicId when email and code match', async () => {
    const fakeRecord = {
      email: mockEmail,
      type: 'REGISTER_PATIENT',
      code: mockCode,
      data: { medicId: 'medic123' }
    };

    (modelVerificationCode.findOne as jest.Mock).mockResolvedValue(fakeRecord);

    const result = await validateVerificationCodePatient(mockEmail, mockCode);

    expect(result).toEqual({ medicId: 'medic123' });
  });
});
