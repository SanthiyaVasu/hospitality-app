const express    = require("express");
const router     = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/send-ad", async (req, res) => {
  const { guestName, guestEmail, persona, variantLabel, svgString, formUrl, offer, roomRec } = req.body;

  if (!guestEmail) return res.status(400).json({ error: "Guest email required" });

  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(formUrl);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F4F0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E2E0DA;">

    <!-- Header -->
    <div style="background:#1C1917;padding:24px 32px;">
      <div style="font-size:11px;font-weight:700;color:#A8A29E;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">Hospitality Intelligence Suite</div>
      <div style="font-size:20px;font-weight:700;color:#ffffff;">Hello, ${guestName}!</div>
      <div style="font-size:13px;color:#A8A29E;margin-top:4px;">We have something special prepared just for you.</div>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;">

      <div style="font-size:11px;font-weight:700;color:#A8A29E;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Your Guest Persona</div>
      <div style="font-size:16px;font-weight:700;color:#1C1917;margin-bottom:20px;">${persona}</div>

      <!-- Ad Poster placeholder -->
      <div style="font-size:11px;font-weight:700;color:#A8A29E;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">${variantLabel}</div>
      <div style="background:#F5F4F0;border-radius:10px;border:1px solid #E2E0DA;padding:16px;margin-bottom:20px;font-size:13px;color:#57534E;line-height:1.6;">
        ${svgString ? '<p style="margin:0 0 8px;font-weight:600;color:#1C1917;">Your Personalised Hotel Ad</p><p style="margin:0;font-size:12px;color:#A8A29E;">View the attached ad creative for your exclusive hotel offer.</p>' : ""}
      </div>

      <!-- Offer -->
      <div style="background:#F5F4F0;border-left:3px solid #1C1917;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:20px;">
        <div style="font-size:10px;font-weight:700;color:#A8A29E;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Special Offer For You</div>
        <div style="font-size:13px;color:#1C1917;line-height:1.6;">${offer}</div>
      </div>

      <!-- Room -->
      <div style="background:#F5F4F0;border-left:3px solid #1C1917;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <div style="font-size:10px;font-weight:700;color:#A8A29E;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Room Recommendation</div>
        <div style="font-size:13px;color:#1C1917;line-height:1.6;">${roomRec}</div>
      </div>

      <!-- QR Code -->
      <div style="text-align:center;padding:24px;background:#F5F4F0;border-radius:10px;border:1px solid #E2E0DA;margin-bottom:20px;">
        <div style="font-size:13px;font-weight:600;color:#1C1917;margin-bottom:6px;">Complete Your Preference Form</div>
        <div style="font-size:12px;color:#57534E;margin-bottom:16px;">Scan the QR code or click the link below to tell us your preferences.</div>
        <img src="${qrUrl}" width="160" height="160" alt="QR Code" style="border-radius:8px;border:1px solid #E2E0DA;"/>
        <div style="margin-top:16px;">
          <a href="${formUrl}" style="display:inline-block;padding:10px 24px;background:#1C1917;color:#ffffff;text-decoration:none;border-radius:7px;font-size:13px;font-weight:600;">Fill Preference Form →</a>
        </div>
      </div>

      <p style="font-size:12px;color:#A8A29E;text-align:center;margin:0;">This is a personalised message from our hotel intelligence system.<br>We look forward to welcoming you!</p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;background:#F5F4F0;border-top:1px solid #E2E0DA;text-align:center;">
      <div style="font-size:11px;color:#A8A29E;">Hospitality Intelligence Suite · Powered by AI</div>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from:    `"Hospitality Intelligence" <${process.env.EMAIL_USER}>`,
      to:      guestEmail,
      subject: `Your Personalised Stay Experience, ${guestName}`,
      html,
      attachments: svgString ? [{
        filename:    `hotel_ad_${variantLabel.replace(/\s+/g,"_").toLowerCase()}.svg`,
        content:     svgString,
        contentType: "image/svg+xml",
      }] : [],
    });

    res.json({ success:true, message:"Email sent to " + guestEmail });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;