const { Resend } = require("resend");

const REQUIRED_RESULT_FIELDS = [
  "whyYouGotThisResult",
  "whatInfrastructureLooksLike",
  "shareMessage",
];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" }, { Allow: "POST" });
  }

  if (!process.env.RESEND_API_KEY) {
    return jsonResponse(500, { error: "RESEND_API_KEY is not configured" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Request body must be valid JSON" });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const result = body.result;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(400, { error: "A valid email address is required" });
  }

  if (
    !result ||
    REQUIRED_RESULT_FIELDS.some(
      (field) => typeof result[field] !== "string" || !result[field].trim(),
    ) ||
    !Array.isArray(result.checklist) ||
    result.checklist.length === 0 ||
    result.checklist.some((item) => typeof item !== "string" || !item.trim())
  ) {
    return jsonResponse(400, { error: "A complete result is required" });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: `IOMETE <${fromEmail}>`,
      to: email,
      subject: "Your Data Sovereignty Risk Report",
      html: buildReportHtml(result),
    });

    if (error) {
      console.error("Resend API error", error);
      return jsonResponse(502, { error: "Unable to send report" });
    }

    return jsonResponse(200, { success: true, id: data?.id });
  } catch (error) {
    console.error("Report email failed", error);
    return jsonResponse(502, { error: "Unable to send report" });
  }
};

function buildReportHtml(result) {
  const checklist = result.checklist
    .map(
      (item) =>
        `<li style="margin-bottom:10px;line-height:1.6;">${escapeHtml(item)}</li>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#F2EEEB;color:#202020;font-family:Arial,sans-serif;">
    <div style="max-width:680px;margin:0 auto;padding:32px 20px;">
      <div style="background:#2D382D;border-radius:8px;padding:28px;">
        <p style="margin:0 0 8px;color:#A0B8A0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">IOMETE</p>
        <h1 style="margin:0;color:#D3F52C;font-size:30px;line-height:1.2;">Your Data Sovereignty Risk Report</h1>
        ${
          result.headlineInsight
            ? `<p style="margin:16px 0 0;color:#FCFCF8;line-height:1.6;">${escapeHtml(result.headlineInsight)}</p>`
            : ""
        }
      </div>

      ${reportSection("Why You Got This Result", result.whyYouGotThisResult)}
      ${reportSection(
        "What the Right Infrastructure Looks Like",
        result.whatInfrastructureLooksLike,
      )}

      <div style="margin-top:18px;background:#FFFFFF;border:1px solid #D0D0CD;border-radius:8px;padding:24px;">
        <h2 style="margin:0 0 14px;font-size:21px;">What To Do Next</h2>
        <ul style="margin:0;padding-left:22px;">${checklist}</ul>
      </div>

      ${reportSection("Share This With Your Team", result.shareMessage)}

      <p style="margin:26px 0 0;color:#626261;font-size:12px;line-height:1.5;">
        This report is informational and does not constitute legal advice.
      </p>
    </div>
  </body>
</html>`;
}

function reportSection(title, body) {
  return `<div style="margin-top:18px;background:#FFFFFF;border:1px solid #D0D0CD;border-radius:8px;padding:24px;">
    <h2 style="margin:0 0 12px;font-size:21px;">${escapeHtml(title)}</h2>
    <p style="margin:0;line-height:1.7;">${escapeHtml(body)}</p>
  </div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}
