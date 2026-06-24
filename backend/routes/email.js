const express = require("express");
const router  = express.Router();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/send-ad", async (req, res) => {
  const {
    guestEmail, guestName, persona, variantLabel,
    svgString, formUrl, offer, roomRec,
  } = req.body;

  if (!guestEmail || !guestName) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/>
<style>
  body{margin:0;padding:0;background:#f5f4f0;font-family:'Helvetica Neue',sans-serif;color:#1c1917}
  .wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e0da}
  .hdr{background:#1c1917;padding:28px 36px}
  .hdr h1{margin:0;color:#fff;font-size:18px;font-weight:700}
  .hdr p{margin:6px 0 0;color:#a8a29e;font-size:13px}
  .body{padding:32px 36px}
  .label{font-size:10px;font-weight:700;color:#a8a29e;text-transform:uppercase;letter-spacing:.09em;margin-bottom:10px}
  .divider{height:1px;background:#edebe5;margin:22px 0}
  .info-row{display:flex;gap:16px;margin-bottom:16px}
  .info-item{flex:1;padding:12px 14px;background:#f5f4f0;border-radius:8px;border:1px solid #e2e0da}
  .info-item .lbl{font-size:9px;font-weight:700;color:#a8a29e;text-transform:uppercase;margin-bottom:4px}
  .info-item .val{font-size:13px;font-weight:600;color:#1c1917}
  .cta-box{background:#f5f4f0;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;border:1px solid #e2e0da}
  .cta-btn{display:inline-block;background:#1c1917;color:#fff;text-decoration:none;padding:12px 28px;border-radius:7px;font-size:13px;font-weight:600}
  .qr-wrap{text-align:center;margin:20px 0}
  .qr-wrap img{width:150px;height:150px;border:1px solid #e2e0da;border-radius:8px;padding:8px;background:#fff}
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
    <p style="font-size:15px;margin-bottom:20px;line-height:1.6">
      Dear <strong>${guestName}</strong>,<br/><br/>
      We have curated a personalised offer based on your profile as a <strong>${persona || "valued guest"}</strong>.
      Your exclusive <strong>${variantLabel || "offer"}</strong> is ready below.
    </p>

    ${(offer || roomRec) ? `
    <div class="label">Your Exclusive Package</div>
    <div class="info-row">
      ${offer   ? `<div class="info-item"><div class="lbl">Special Offer</div><div class="val">${offer}</div></div>` : ""}
      ${roomRec ? `<div class="info-item"><div class="lbl">Room Recommendation</div><div class="val">${roomRec}</div></div>` : ""}
    </div>` : ""}

    <div class="divider"></div>

    <div class="cta-box">
      <div class="label">Complete Your Preference Profile</div>
      <p style="font-size:13px;color:#57534e;margin:0 0 16px;line-height:1.6">
        Help us serve you better — fill in your preferences so we can tailor every aspect of your stay.
      </p>
      <a href="${formUrl}" class="cta-btn">Fill Guest Preferences &rarr;</a>
    </div>

    <div class="label" style="text-align:center">Or Scan the QR Code</div>
    <div class="qr-wrap">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(formUrl)}" alt="QR Code"/>
    </div>
    <p style="font-size:11px;color:#a8a29e;text-align:center;margin-top:6px">
      Scan with your phone camera to open the preference form
    </p>

    <div class="divider"></div>
    <p style="font-size:12px;color:#57534e;line-height:1.7;margin:0">
      This offer was generated specifically for <strong>${persona || "you"}</strong> based on your profile.
      Your information is handled with complete confidentiality.
    </p>
  </div>
  <div class="footer">
    <p>Hospitality Guest Intelligence System &middot; Powered by AI<br/>
    You received this because a hospitality staff member sent you a personalised offer.</p>
  </div>
</div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: "Hospitality Intelligence <onboarding@resend.dev>",
      to:   "santhiyadeepa17@gmail.com",
      subject: `Your Personalised Offer — ${variantLabel || "Exclusive Package"}`,
      html,
      attachments: svgString ? [{
        filename:    "ad_poster.svg",
        content:     Buffer.from(svgString).toString("base64"),
      }] : [],
    });
    console.log("Email sent →", guestEmail);
    res.json({ success: true, message: "Email sent to " + guestEmail });
  } catch (err) {
    console.error("Email error:", err.message);
    res.status(500).json({ error: "Failed to send email: " + err.message });
  }
});

module.exports = router;