// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code is designed to run in Supabase Edge Functions with Deno runtime.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FOUNDER_EMAILS = Deno.env.get("FOUNDER_EMAILS") || "sanjay@vsstudio.com,sriram@vsstudio.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "hello@vsstudio.com";

interface InquiryPayload {
  record: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    service_type: string;
    requirements: string;
    budget_range: string;
    deadline?: string;
    file_urls?: string[];
  };
}

serve(async (req: Request) => {
  // CORS check
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const payload: InquiryPayload = await req.json();
    const inq = payload.record;

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not configured in Supabase secrets.");
      return new Response(
        JSON.stringify({ message: "Resend API key missing, skipped email delivery." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Send Confirmation Email to Client
    const clientEmailPromise = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `VS Studio <${FROM_EMAIL}>`,
        to: [inq.email],
        subject: `We've received your project inquiry — VS Studio`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
            <div style="background: linear-gradient(135deg, #7c3aed, #06b6d4); padding: 2px; border-radius: 12px; margin-bottom: 24px;">
              <div style="background: #090d16; padding: 20px; border-radius: 10px; color: #f8fafc;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800;">VS Studio</h1>
                <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Web &bull; Brand &bull; AI Automations</p>
              </div>
            </div>
            
            <h2 style="font-size: 18px; color: #0f172a;">Hi ${inq.name},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Thanks for reaching out to VS Studio! We have received your project details regarding <strong>${inq.service_type}</strong>.
            </p>
            
            <div style="background: #f1f5f9; border-left: 4px solid #7c3aed; padding: 14px; border-radius: 6px; margin: 20px 0; font-size: 13px;">
              <p style="margin: 0 0 6px 0;"><strong>Budget Range:</strong> ${inq.budget_range}</p>
              ${inq.deadline ? `<p style="margin: 0 0 6px 0;"><strong>Target Deadline:</strong> ${inq.deadline}</p>` : ''}
              <p style="margin: 0;"><strong>Requirements:</strong> ${inq.requirements}</p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Our founders (Sanjay & Sriram) are reviewing your brief and will get back to you with initial scope questions and proposal availability within 24 hours.
            </p>
            
            <p style="margin-top: 30px; font-size: 13px; color: #64748b;">
              Warm regards,<br />
              <strong>VS Studio Founders</strong>
            </p>
          </div>
        `,
      }),
    });

    // 2. Send Alert Email to Both Founders
    const founderEmails = FOUNDER_EMAILS.split(",").map((e) => e.trim());
    const founderEmailPromise = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `VS Studio Alerts <${FROM_EMAIL}>`,
        to: founderEmails,
        subject: `🚀 [New Lead] ${inq.name} — ${inq.company || 'Private'} (${inq.budget_range})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
            <h2 style="color: #7c3aed; margin-top: 0;">New Client Lead Submitted!</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr><td style="padding: 6px 0; color: #64748b;">Client:</td><td style="font-weight: 600;">${inq.name}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td><a href="mailto:${inq.email}">${inq.email}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Phone:</td><td>${inq.phone || '—'}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Company:</td><td>${inq.company || '—'}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Service:</td><td style="font-weight: 600; color: #0284c7;">${inq.service_type}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Budget:</td><td style="font-weight: 700; color: #16a34a;">${inq.budget_range}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Deadline:</td><td>${inq.deadline || '—'}</td></tr>
            </table>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #475569;">Client Requirements:</h4>
              <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5;">${inq.requirements}</p>
            </div>
            
            <a href="https://your-admin-dashboard.vercel.app/inquiries" style="display: inline-block; background: #7c3aed; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">
              Open in VS Studio Admin &rarr;
            </a>
          </div>
        `,
      }),
    });

    await Promise.all([clientEmailPromise, founderEmailPromise]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
