import express from "express";
import Email from "../models/Email.js";
import authMiddleware from "../middleware/authMiddleware.js";
import OpenAI from "openai";

const router = express.Router();

/* ---------------------------------
   LAZY OPENAI INITIALIZATION
---------------------------------- */
let openaiClient = null;

const getOpenAI = () => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY missing");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
};

/* ---------------------------------
   GET EMAILS (INBOX + SENT)
---------------------------------- */
router.get("/", authMiddleware, async (req, res) => {
  const emails = await Email.find({
    $or: [
      { to: req.user.email },
      { from: req.user.email },
    ],
  }).sort({ createdAt: -1 });

  res.json(emails);
});

/* ---------------------------------
   SEND EMAIL (MULTIPLE RECIPIENTS)
---------------------------------- */
router.post("/send", authMiddleware, async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !body) {
    return res.status(400).json({
      message: "Recipient and body required",
    });
  }

  const recipients = to.split(",").map(e => e.trim());
  const savedEmails = [];

  for (const r of recipients) {
    const mail = await Email.create({
      from: req.user.email,
      to: r,
      subject,
      body,
    });
    savedEmails.push(mail);
  }

  res.json({
    message: "Email sent",
    emails: savedEmails,
  });
});

/* ---------------------------------
   ANALYZE EMAIL (FIXED & ROBUST)
---------------------------------- */
router.post("/analyze/:id", authMiddleware, async (req, res) => {
  try {
    const openai = getOpenAI();

    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis assistant. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: `Analyze this email:

"${email.body}"

Return ONLY JSON:
{
  "sentiment": "positive | neutral | negative",
  "recommendation": "short recommendation"
}`,
        },
      ],
    });

    const raw = completion.choices[0].message.content;

    console.log("OPENAI RAW RESPONSE:", raw);

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        message: "OpenAI response not valid JSON",
        raw,
      });
    }

    email.sentiment = result.sentiment;
    email.recommendation = result.recommendation;
    await email.save();

    res.json(result);
  } catch (err) {
    console.error("ANALYZE ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
