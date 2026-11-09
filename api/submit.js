// Serverless Function: api/submit.js (Compatible with Vercel, Netlify, Cloudflare, Firebase Functions)
// Prevents duplicate submissions anonymously, sanitizes text, and securely stores responses.

const crypto = require("crypto");

// IN-MEMORY / DB MOCK (Connect to Firestore / Supabase / Redis / Google Sheets in production)
// In production, configure environment variables: ADMIN_KEY and DB_URL
const submissionsStore = [];
const seenFingerprints = new Set();
const SECRET_SALT = process.env.ANON_SALT || "super-secret-salt-brand-feedback-2026";

export default async function handler(req, res) {
  // CORS & Method Check
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { role, traits, goTo, diff, roleSpecific, story, improve, metaphor, token } = req.body;

    // 1. Generate anonymous Salted Hash (IP + User-Agent + Salt)
    // The IP address itself is NEVER saved anywhere - strictly irreversible SHA-256
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown-ip";
    const userAgent = req.headers["user-agent"] || "unknown-agent";
    
    // Hash key combines IP + browser + secret salt
    const deduplicationKey = token 
      ? `token:${token}` 
      : crypto.createHash("sha256").update(`${clientIp}-${userAgent}-${SECRET_SALT}`).digest("hex");

    // 2. Check for Duplicate Submission
    if (seenFingerprints.has(deduplicationKey)) {
      return res.status(429).json({ 
        success: false, 
        message: "כבר נקלט מענה ממכשיר זה. תודה רבה על השתתפותך!" 
      });
    }

    // 3. Basic Input Sanitization (strip script tags, enforce length limits)
    const sanitize = (text, max = 1500) => {
      if (!text || typeof text !== "string") return "";
      return text.replace(/<[^>]*>?/gm, "").trim().slice(0, max);
    };

    const newFeedback = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      role: sanitize(role, 20) || "peer",
      traits: Array.isArray(traits) ? traits.slice(0, 10).map(t => sanitize(t, 50)) : [],
      goTo: sanitize(goTo),
      diff: sanitize(diff),
      roleSpecific: sanitize(roleSpecific),
      story: sanitize(story),
      improve: sanitize(improve),
      metaphor: sanitize(metaphor)
    };

    // 4. Save to Store (Memory/Database)
    submissionsStore.push(newFeedback);
    seenFingerprints.add(deduplicationKey);

    return res.status(200).json({ 
      success: true, 
      message: "המשוב נשמר בהצלחה ובאנונימיות מלאה." 
    });

  } catch (err) {
    console.error("Submission error:", err);
    return res.status(500).json({ success: false, message: "שגיאת שרת פנימית." });
  }
}
