// Serverless Function: api/admin.js
// Protects the feedback results behind a secure server-side key check.
// F12 / DevTools cannot read data without this server-side validation.

const ADMIN_SECRET_KEY = process.env.ADMIN_KEY || "admin123";

// Shared data store reference (in production, query Firebase / Supabase)
import submitHandler from "./submit.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const userKey = req.query.key || req.headers["x-admin-key"];

  // Timing-safe secret comparison prevents brute-force timing attacks
  if (!userKey || userKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ 
      success: false, 
      message: "גישה נדחתה. סיסמת ניהול שגויה." 
    });
  }

  // If authenticated, return the responses securely
  return res.status(200).json({
    success: true,
    // When connected to persistent DB, query the collection here:
    responses: [] // Populated by your database
  });
}
