import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: false,
});

export async function sendMagicLinkEmail(email: string, url: string): Promise<void> {
  await transporter.sendMail({
    from: '"SaaS Cursos" <no-reply@saas-cursos.local>',
    to: email,
    subject: "Tu enlace de acceso a SaaS Cursos",
    text: `Ingresá a SaaS Cursos con este enlace (válido 15 minutos):\n\n${url}\n`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Acceso a SaaS Cursos</h2>
        <p>Hacé clic en el botón para ingresar. El enlace es válido por 15 minutos y de un solo uso.</p>
        <p style="text-align:center;margin:24px 0">
          <a href="${url}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Ingresar</a>
        </p>
        <p style="color:#666;font-size:12px">Si no solicitaste este enlace, ignorá este correo.</p>
      </div>`,
  });
}
