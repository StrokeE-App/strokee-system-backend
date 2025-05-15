import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import { activiationEmailTemplate } from '../config/emailTemplates/activationEmailTemplate';
import { alertEmailTemplate } from '../config/emailTemplates/alertEmailTemplate';
import { activationPatientEmailTemplate } from '../config/emailTemplates/activationPatientEmailTemplate';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD  // Asegúrate de usar una contraseña de aplicación válida
    }
});

export async function sendNotification(recipient: string, nombrePaciente: string, apellidoPaciente: string) {
    try {
        const info = await transporter.sendMail({
            from: `"StrokeE System" <${process.env.EMAIL}>`,
            to: recipient,
            subject: '🚑 Información sobre el estado de su familiar',
            html: alertEmailTemplate(nombrePaciente, apellidoPaciente)
        });

        console.log('Correo enviado:', info.messageId);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
}

export const sendRegistrationEmail = async (email: string, code: string) => {
    console.log(email, code);
    const loginLink = 'https://strokee-patient-app.vercel.app/login'

    const registrationLink = `https://strokee-patient-app.vercel.app/register-emergency-contact`;

    const mailOptions = {
        from: "tu_correo@gmail.com",
        to: email,
        subject: "Registro como Contacto de Emergencia",
        html: activiationEmailTemplate(registrationLink, code, loginLink),
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error al enviar el correo de activación:', error);
    }
};

export const sendPatientRegistrationEmail = async (email: string, code: string) => {
    console.log(email, code);

    const registrationLink = `https://strokee-patient-app.vercel.app/register`;

    const mailOptions = {
        from: "tu_correo@gmail.com",
        to: email,
        subject: "invitacion de paciente",
        html: activationPatientEmailTemplate(registrationLink, code),
    };

    await transporter.sendMail(mailOptions);
};

