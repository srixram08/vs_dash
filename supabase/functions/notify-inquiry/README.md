# Supabase Edge Function: `notify-inquiry`

This Edge Function triggers automatically whenever a new client submits an inquiry on your public website.

It performs two parallel tasks via **Resend**:
1. Sends a professional confirmation email to the client acknowledging their project brief.
2. Sends an instant lead notification alert to both founders (`sanjay@vsstudio.com` & `sriram@vsstudio.com`).

---

## 1. Set Edge Function Secrets in Supabase

Run using the Supabase CLI:

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
supabase secrets set FOUNDER_EMAILS=sanjay@vsstudio.com,sriram@vsstudio.com
supabase secrets set FROM_EMAIL=hello@yourdomain.com
```

Or configure via the **Supabase Dashboard**:
- Go to **Project Settings > Edge Functions > Secrets**.

---

## 2. Deploy the Edge Function

```bash
supabase functions deploy notify-inquiry --no-verify-jwt
```

---

## 3. Configure Database Webhook

In your **Supabase Dashboard**:
1. Navigate to **Database > Webhooks**.
2. Click **Create a new webhook**.
3. Name: `on_inquiry_created`
4. Table: `inquiries`
5. Events: Check `INSERT`
6. Webhook Type: **Supabase Edge Function**
7. Select Function: `notify-inquiry`
8. Click **Save Webhook**.
