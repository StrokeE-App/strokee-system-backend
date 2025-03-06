import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid: string = process.env.ACCOUNTSID || '';
const authToken: string = process.env.TWILIOTOKEN || ''; 
const client = twilio(accountSid, authToken);

export const sendMessage = async (firstName: string, lastName: string, phoneNumber: string): Promise<void> => {

    const from: string = 'whatsapp:+14155238886';
    const to: string = 'whatsapp:+573057479364';
    
    const message: string = `StrokeE system te informa que ${firstName} ${lastName} ha sufrido un accidente cerebrovascular y necesita ayuda inmediata. Su teléfono es ${phoneNumber}.`;
    try {
        const response = await client.messages.create({ from, to, body: message });
        console.log(`Mensaje enviado con SID: ${response.sid}`);
    } catch (error) {
        console.error('Error enviando el mensaje:', error);
    }
};

