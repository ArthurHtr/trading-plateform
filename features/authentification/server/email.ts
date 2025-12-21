import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendVerificationEmail({ user, url }: { user: { email: string }, url: string }) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: "Vérifiez votre adresse email - SimTrading",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bienvenue sur SimTrading !</h2>
        <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
        <p style="margin: 20px 0;">
          <a href="${url}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Vérifier mon email
          </a>
        </p>
        <p style="font-size: 12px; color: #666;">
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
          ${url}
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`📧 Email envoyé à ${user.email}`)
  } catch (error) {
    console.error("❌ Erreur d'envoi d'email:", error)
  }
}
