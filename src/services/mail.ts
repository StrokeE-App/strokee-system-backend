import nodemailer from 'nodemailer';
import dotenv from "dotenv";

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
            text: `Estimado(a),

Queremos informarle que su familiar ${nombrePaciente} ${apellidoPaciente} ha sufrido un accidente cerebrovascular y en este momento está siendo trasladado a la Clínica Imbanaco para recibir atención médica inmediata.

El equipo médico de la Clínica Imbanaco está preparado para atenderlo.

Si necesita más información, no dude en comunicarse con la clínica.

Atentamente,
StrokeE System`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; line-height: 1.6;">
          <h2 style="color: #D32F2F;">🚑 Información sobre el estado de su familiar</h2>
          <p>Estimado(a),</p>
          <p>Queremos informarle que su familiar <strong>${nombrePaciente} ${apellidoPaciente}</strong> ha sufrido un <strong>accidente cerebrovascular</strong> y en este momento está siendo trasladado a la <strong>Clínica Imbanaco</strong> para recibir atención médica inmediata.</p>
          <p>El equipo médico de la Clínica Imbanaco está preparado para atenderlo.</p>
          <p><strong>Si necesita más información, no dude en comunicarse con la clínica.</strong></p>
          <br>
          <p style="color: #777;">Atentamente,<br><strong>StrokeE System</strong></p>
        </div>
      `
        });

        console.log('Correo enviado:', info.messageId);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
}

export const sendRegistrationEmail = async (email: string, code: string, token: string) => {
    console.log(email, code);

    const registrationLink = `http://localhost:4000/patient/register-emergency-contact?verificationId=${token}`;

    const mailOptions = {
        from: "tu_correo@gmail.com",
        to: email,
        subject: "Registro como Contacto de Emergencia",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #D32F2F;">Registro como Contacto de Emergencia</h2>
                <p>Estimado(a),</p>
                <p>Has sido designado como contacto de emergencia. Para completar tu registro, por favor sigue estos pasos:</p>
                <ol>
                    <li>Haz clic en el siguiente enlace: <a href="${registrationLink}" style="color: #D32F2F; font-weight: bold;">Registrarme</a></li>
                    <li>Ingresa el siguiente código de verificación cuando se te solicite:</li>
                </ol>
                <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold;">
                    ${code}
                </div>
                <p>⚠️ Este código es válido por <strong>30 minutos</strong>. Si no has solicitado este registro, ignora este mensaje.</p>
                <p>Atentamente,<br><strong>StrokeE System</strong></p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};
