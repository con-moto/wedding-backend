import nodemailer from "nodemailer";

const ALLOWED_ORIGIN = "https://con-moto.github.io";

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept"
    );
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res
      .status(405)
      .setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
      .json({ success: false, message: "Method not allowed" });
    return;
  }

  try {
    const params = req.body || {};

    const form_type = params.form_type || "";
    const first_name = params.first_name || "";
    const last_name = params.last_name || "";
    const attendance = params.attendance || "";
    const message = params.message || "";
    const food_preference = params.food_preference || "";
    const child = params.child || "";
    const event = params.event || "";
    const alcoholArray = params["alcohol[]"] || params.alcohol || [];
    const alcohol = Array.isArray(alcoholArray)
      ? alcoholArray.join(", ")
      : alcoholArray || "";

    const subject =
      form_type === "rsvp-form"
        ? `RSVP от гостя: ${first_name} ${last_name}`
        : `Детали от гостя: ${first_name} ${last_name}`;

    const textLines = [
      `Тип формы: ${form_type}`,
      `Событие: ${event}`,
      `Имя: ${first_name}`,
      `Фамилия: ${last_name}`,
      `Присутствие: ${attendance}`,
      `Питание: ${food_preference}`,
      `Алкоголь: ${alcohol}`,
      `Ребёнок: ${child}`,
      `Комментарий: ${message}`,
      `Дата: ${new Date().toISOString()}`,
    ];

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 465),
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let toAddress = process.env.MAIL_TO || "";

    if (form_type === "rsvp-form" && process.env.MAIL_TO_RSVP) {
      toAddress = process.env.MAIL_TO_RSVP;
    } else if (form_type === "details-form" && process.env.MAIL_TO_DETAILS) {
      toAddress = process.env.MAIL_TO_DETAILS;
    }

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: toAddress,
      subject,
      text: textLines.join("\n"),
    });

    res
      .status(200)
      .setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
      .json({
        success: true,
        message: "Спасибо! Форма отправлена.",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
      .json({ success: false, message: "Ошибка на сервере." });
  }
}