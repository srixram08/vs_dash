# Public Website &mdash; Supabase Form Integration Guide

This guide provides the exact frontend code to drop into your **public website** to submit project inquiries and upload attachments directly into your shared Supabase project.

---

## 1. Security Architecture Recap

- The public site uses only the **Supabase URL** and **Anon Public Key**.
- Due to strict Row Level Security (RLS) on PostgreSQL:
  - Anonymous users **CAN ONLY INSERT** into `public.inquiries`.
  - Anonymous users **CANNOT SELECT, UPDATE, or DELETE** any records.
  - Anonymous users **CANNOT READ** any other tables (`admins`, `clients`, `projects`, `tasks`, `proposals`, `payments`, `activity_log`).
  - Storage: Anonymous users can only upload into the private `client-files` bucket. They cannot browse or download stored files.

---

## 2. React Example (Drop into your Public Site)

```tsx
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize with public anon key only
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
);

export function PublicInquiryForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service_type: 'website_design_dev',
    requirements: '',
    budget_range: '$8k - $15k',
    deadline: '',
    reference_links: '',
  });

  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const uploadedFilePaths: string[] = [];

      // 1. Upload files to private storage bucket 'client-files'
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `inquiries/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('client-files')
            .upload(filePath, file);

          if (!uploadError) {
            uploadedFilePaths.push(filePath);
          }
        }
      }

      // 2. Insert inquiry into public.inquiries table
      const { error: insertError } = await supabase.from('inquiries').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          company: formData.company || null,
          service_type: formData.service_type,
          requirements: formData.requirements,
          budget_range: formData.budget_range,
          deadline: formData.deadline || null,
          reference_links: formData.reference_links || null,
          file_urls: uploadedFilePaths,
          status: 'new',
        },
      ]);

      if (insertError) throw insertError;

      setIsSuccess(true);
    } catch (err) {
      console.error('Inquiry submission error:', err);
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-emerald-500/30 rounded-2xl">
        <h3 className="text-xl font-bold text-white">Project Brief Received!</h3>
        <p className="mt-2 text-sm text-slate-300">
          Thank you for reaching out. Sanjay & Sriram will review your requirements and respond within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <input
        type="text"
        placeholder="Your Full Name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Business Email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <select
        value={formData.service_type}
        onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
      >
        <option value="website_design_dev">Website Design & Development</option>
        <option value="logo_branding">Logo & Brand Identity</option>
        <option value="ai_agents_automation">AI Agents & Workflow Automation</option>
      </select>
      <select
        value={formData.budget_range}
        onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
      >
        <option value="$3k - $5k">$3,000 - $5,000</option>
        <option value="$5k - $10k">$5,000 - $10,000</option>
        <option value="$10k - $25k">$10,000 - $25,000</option>
        <option value="$25k+">$25,000+</option>
      </select>
      <textarea
        placeholder="Describe your vision and requirements..."
        required
        value={formData.requirements}
        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
      />
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending Brief...' : 'Submit Project Inquiry'}
      </button>
    </form>
  );
}
```

---

## 3. Verify RLS Lockout (Acceptance Test)

To prove that an anonymous user cannot read any table from the browser, open the browser developer console on your public site and execute:

```javascript
// Test 1: Try reading inquiries as anonymous user
const { data, error } = await supabase.from('inquiries').select('*');
console.log('Inquiries read test:', { data, error });
// Output: data: [] (Empty array or permission denied! Anonymous users CANNOT read inquiries!)

// Test 2: Try reading clients table
const { data: clients, error: clientErr } = await supabase.from('clients').select('*');
console.log('Clients read test:', { clients, clientErr });
// Output: clients: [] (Blocked by RLS!)
```
