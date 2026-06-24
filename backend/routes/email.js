const express    = require("express");
const router     = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "74.125.133.109",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    servername: "smtp.gmail.com",
  },
});
// POST /api/email/send-ad
// Body: { guestEmail, guestName, persona, variant, variantLabel,
//         svgString, qrDataUrl, formUrl, offer, roomRec }
router.post("/send-ad", async (req, res) => {
  const {
    guestEmail, guestName, persona, variantLabel,
    svgString,  qrDataUrl, formUrl, offer, roomRec,
  } = req.body;

  if (!guestEmail || !guestName || !svgString) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body{margin:0;padding:0;background:#f5f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1c1917}
    .wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e0da}
    .hdr{background:#1c1917;padding:28px 36px}
    .hdr h1{margin:0;color:#fff;font-size:18px;font-weight:700;letter-spacing:-.3px}
    .hdr p{margin:6px 0 0;color:#a8a29e;font-size:13px}
    .body{padding:32px 36px}
    .greeting{font-size:15px;color:#1c1917;margin-bottom:20px;line-height:1.6}
    .label{font-size:10px;font-weight:700;color:#a8a29e;text-transform:uppercase;letter-spacing:.09em;margin-bottom:10px}
    .poster{border-radius:10px;overflow:hidden;margin-bottom:24px;border:1px solid #e2e0da;background:#1c1917}
    .poster img{width:100%;display:block}
    .divider{height:1px;background:#edebe5;margin:22px 0}
    .cta-box{background:#f5f4f0;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;border:1px solid #e2e0da}
    .cta-box p{margin:0 0 16px;font-size:13px;color:#57534e;line-height:1.6}
    .cta-btn{display:inline-block;background:#1c1917;color:#fff;text-decoration:none;padding:12px 28px;border-radius:7px;font-size:13px;font-weight:600;letter-spacing:.02em}
    .qr-center{text-align:center;margin-bottom:6px}
    .qr-center img{width:140px;height:140px;border:1px solid #e2e0da;border-radius:8px;padding:8px;background:#fff}
    .qr-note{font-size:11px;color:#a8a29e;text-align:center;margin-top:6px}
    .info-row{display:flex;gap:24px;margin-bottom:12px}
    .info-item{flex:1;padding:12px 14px;background:#f5f4f0;border-radius:8px;border:1px solid #e2e0da}
    .info-item .lbl{font-size:9px;font-weight:700;color:#a8a29e;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
    .info-item .val{font-size:13px;font-weight:600;color:#1c1917}
    .footer{padding:18px 36px;background:#f5f4f0;border-top:1px solid #e2e0da}
    .footer p{margin:0;font-size:11px;color:#a8a29e;line-height:1.7}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h1>Hospitality Guest Intelligence</h1>
      <p>A personalised experience crafted just for you</p>
    </div>
    <div class="body">
      <p class="greeting">
        Dear <strong>${guestName}</strong>,<br/><br/>
        We have curated a personalised offer based on your profile.
        Your exclusive <strong>${variantLabel || "offer"}</strong> is ready below.
      </p>

      <!-- Ad Poster -->
      <div class="label">Your Personalised Ad Creative</div>
      <div class="poster">
        <img src="cid:adposter" alt="Personalised Ad Poster"/>
      </div>

      ${(offer || roomRec) ? `
      <div class="info-row">
        ${offer   ? `<div class="info-item"><div class="lbl">Special Offer</div><div class="val">${offer}</div></div>` : ""}
        ${roomRec ? `<div class="info-item"><div class="lbl">Room Recommendation</div><div class="val">${roomRec}</div></div>` : ""}
      </div>` : ""}

      <div class="divider"></div>

      <!-- Preference Form CTA -->
      <div class="cta-box">
        <div class="label">Complete Your Preference Profile</div>
        <p>Help us serve you better — fill in your preferences so we can tailor every aspect of your stay.</p>
        <a href="${formUrl}" class="cta-btn">Fill Guest Preferences &rarr;</a>
      </div>

      <!-- QR Code -->
      ${qrDataUrl ? `
      <div class="label" style="text-align:center">Or Scan the QR Code</div>
      <div class="qr-center">
        <img src="cid:qrcode" alt="Preference Form QR Code"/>
      </div>
      <p class="qr-note">Scan with your phone camera to open the preference form</p>
      ` : ""}

      <div class="divider"></div>

      <p style="font-size:12px;color:#57534e;line-height:1.7;margin:0">
        This offer was generated specifically for
        <strong>${persona || "you"}</strong>
        based on your publicly available profile data.
        Your information is handled with complete confidentiality.
      </p>
    </div>
    <div class="footer">
      <p>
        Hospitality Guest Intelligence System &nbsp;&middot;&nbsp; Powered by AI<br/>
        You received this because a hospitality staff member sent you a personalised offer.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // ── Attachments ─────────────────────────────────────────────
  const attachments = [
    {
      filename:    "ad_poster.svg",
      content:     Buffer.from(svgString).toString("base64"),
      encoding:    "base64",
      contentType: "image/svg+xml",
      cid:         "adposter",
    },
  ];

  if (qrDataUrl) {
    const qrBase64 = qrDataUrl.split(",")[1];
    if (qrBase64) {
      attachments.push({
        filename:    "qr_code.png",
        content:     qrBase64,
        encoding:    "base64",
        contentType: "image/png",
        cid:         "qrcode",
      });
    }
  }

  // ── Send ─────────────────────────────────────────────────────
  try {
    await transporter.sendMail({
      from:    `"Hospitality Intelligence" <${process.env.EMAIL_USER}>`,
      to:      guestEmail,
      subject: `Your Personalised Offer — ${variantLabel || "Exclusive Package"}`,
      html,
      attachments,
    });
    console.log("Email sent →", guestEmail);
    res.json({ success: true, message: "Email sent to " + guestEmail });
  } catch (err) {
    console.error("Email error:", err.message);
    res.status(500).json({ error: "Failed to send email: " + err.message });
  }
});

module.exports = router;