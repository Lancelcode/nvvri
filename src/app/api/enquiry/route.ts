import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EnquiryPayload {
  nurseryName: string;
  nurseryArea: string;
  name: string;
  email: string;
  phone: string;
  childDob: string;
  startDate: string;
  message: string;
}

function formatDate(iso: string): string {
  if (!iso) return "Not provided";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export async function POST(req: NextRequest) {
  let body: EnquiryPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { nurseryName, nurseryArea, name, email, phone, childDob, startDate, message } = body;

  // Basic validation
  if (!name || !email || !phone || !childDob || !startDate || !nurseryName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "nvvri <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL!,
      subject: `Your enquiry to ${nurseryName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; color: #0f172a;">
          <div style="background: #1a7a4a; padding: 24px 28px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">nvvri</h1>
            <p style="color: #bbf7d0; margin: 4px 0 0; font-size: 14px;">Nursery enquiry confirmation</p>
          </div>

          <div style="background: white; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 28px;">
            <p style="font-size: 16px; font-weight: 600; margin: 0 0 4px;">Hi ${name},</p>
            <p style="font-size: 14px; color: #64748b; margin: 0 0 24px; line-height: 1.6;">
              Your enquiry to <strong style="color: #0f172a;">${nurseryName}</strong> in ${nurseryArea} has been submitted.
              They will be in touch within 24 hours.
            </p>

            <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
              <p style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 14px;">Enquiry summary</p>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="font-size: 13px; color: #64748b; padding: 6px 0; width: 40%;">Nursery</td>
                  <td style="font-size: 13px; color: #0f172a; font-weight: 500; padding: 6px 0;">${nurseryName}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #64748b; padding: 6px 0;">Your name</td>
                  <td style="font-size: 13px; color: #0f172a; font-weight: 500; padding: 6px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #64748b; padding: 6px 0;">Phone</td>
                  <td style="font-size: 13px; color: #0f172a; font-weight: 500; padding: 6px 0;">${phone}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #64748b; padding: 6px 0;">Child date of birth</td>
                  <td style="font-size: 13px; color: #0f172a; font-weight: 500; padding: 6px 0;">${formatDate(childDob)}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #64748b; padding: 6px 0;">Desired start</td>
                  <td style="font-size: 13px; color: #0f172a; font-weight: 500; padding: 6px 0;">${formatDate(startDate)}</td>
                </tr>
                ${message ? `
                <tr>
                  <td style="font-size: 13px; color: #64748b; padding: 6px 0; vertical-align: top;">Message</td>
                  <td style="font-size: 13px; color: #0f172a; font-weight: 500; padding: 6px 0; line-height: 1.5;">${message}</td>
                </tr>` : ""}
              </table>
            </div>

            <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.6;">
              If you did not make this enquiry, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}