import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const enviarCorreoGanador = async (email,nombreAuto) => {
    try {
        await transporter.sendMail({
            from: "autosmart025@gmail.com",
            to: email,
            subject: "¡Felicitaciones! Ganaste la subastas",
            html: `
                <h1>¡Felicidades!</h1>
                <p>Has ganado la subasta <strong>${nombreAuto}</strong>.</p>
                <p>Pronto nos pondremos en contacto para finalizar la compra.</p>
            `
        });
        console.log("Correo enviado al ganador:", email);
    } catch (error) {
        console.error("Error al enviar el correo:", error);
    }
}