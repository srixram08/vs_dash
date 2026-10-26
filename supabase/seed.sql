-- ==============================================================================
-- VS STUDIO ADMIN — REALISTIC SEED DATA
-- Covers: Web Design/Dev, Logo & Branding, AI Agents & Workflow Automation
-- ==============================================================================

-- 1. Insert Founders (Admins)
-- Note: Replace user_id values with actual Supabase auth.users UUIDs after creating founder accounts
INSERT INTO public.admins (id, user_id, name, email)
VALUES
    ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Sanjay (Dev & AI Lead)', 'sanjay@vsstudio.com'),
    ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Sriram (Brand & Design Lead)', 'sriram@vsstudio.com')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Inquiries
INSERT INTO public.inquiries (
    id, name, email, phone, company, service_type, requirements, budget_range, deadline, reference_links, file_urls, status, assigned_to, notes, created_at
) VALUES
(
    'i0000000-0000-0000-0000-000000000001',
    'Elena Rostova',
    'elena@auroratech.io',
    '+1 (555) 234-5678',
    'Aurora Cloud Systems',
    'ai_agents_automation',
    'We need an autonomous customer support and lead triaging AI agent integrated with our Slack, Linear, and Zendesk. Must support webhook events and LLM reasoning.',
    '$10k - $20k',
    '2026-11-20',
    'https://linear.app, https://resend.com',
    ARRAY['inquiries/aurora-arch-spec.pdf'],
    'new',
    'a0000000-0000-0000-0000-000000000001',
    'High priority enterprise lead. Met at TechStars demo night.',
    NOW() - INTERVAL '1 hour'
),
(
    'i0000000-0000-0000-0000-000000000002',
    'Marcus Vance',
    'marcus@vancecapital.com',
    '+1 (555) 890-1234',
    'Vance Ventures',
    'website_design_dev',
    'High-end luxury corporate website redesign with Next.js, dark glassmorphism, Framer Motion animations, and custom CMS for portfolio investments.',
    '$8k - $15k',
    '2026-12-01',
    'https://stripe.com/press, https://linear.app/features',
    ARRAY['inquiries/vance-brand-guidelines.pdf'],
    'reviewing',
    'a0000000-0000-0000-0000-000000000001',
    'Sanjay reviewing frontend animations and hosting options.',
    NOW() - INTERVAL '1 day'
),
(
    'i0000000-0000-0000-0000-000000000003',
    'Sofia Mendez',
    'sofia@kinshiphealth.co',
    '+1 (555) 432-8765',
    'Kinship Health',
    'logo_branding',
    'Complete visual identity: modern geometric logo, typography system, brand style guide, 3D icon set, and social media templates for health-tech launch.',
    '$5k - $8k',
    '2026-11-15',
    'https://dribbble.com/kinship-moodboard',
    ARRAY['inquiries/kinship-moodboard.jpg'],
    'proposal_sent',
    'a0000000-0000-0000-0000-000000000002',
    'Sent comprehensive proposal for $6,500 on Oct 25.',
    NOW() - INTERVAL '3 days'
),
(
    'i0000000-0000-0000-0000-000000000004',
    'Liam Chen',
    'liam@nexusforge.ai',
    '+1 (555) 765-4321',
    'NexusForge',
    'ai_agents_automation',
    'Internal document retrieval agent using pgvector and automated email draft generation for sales reps.',
    '$15k - $25k',
    '2026-11-30',
    'https://langchain.com',
    ARRAY['inquiries/nexusforge-brief.docx'],
    'accepted',
    'a0000000-0000-0000-0000-000000000001',
    'Converted to active client and kickoff project.',
    NOW() - INTERVAL '7 days'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Clients
INSERT INTO public.clients (
    id, inquiry_id, name, email, phone, company, notes, created_at
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'i0000000-0000-0000-0000-000000000004',
    'Liam Chen',
    'liam@nexusforge.ai',
    '+1 (555) 765-4321',
    'NexusForge AI',
    'Fast-moving Series A AI company. Values prompt responsiveness and clean code.',
    NOW() - INTERVAL '6 days'
),
(
    'c0000000-0000-0000-0000-000000000002',
    NULL,
    'Claire DeWitt',
    'claire@solarcraft.design',
    '+1 (555) 901-2345',
    'SolarCraft Studios',
    'Repeat design customer. Great relationship.',
    NOW() - INTERVAL '20 days'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Projects
INSERT INTO public.projects (
    id, client_id, title, service_type, status, start_date, due_date, assigned_to, progress_percent, created_at
) VALUES
(
    'p0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'NexusForge RAG & Sales Automation System',
    'ai_agents_automation',
    'in_progress',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '14 days',
    'a0000000-0000-0000-0000-000000000001',
    60,
    NOW() - INTERVAL '6 days'
),
(
    'p0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'SolarCraft Web Experience & Brand System',
    'website_design_dev',
    'review',
    CURRENT_DATE - INTERVAL '18 days',
    CURRENT_DATE + INTERVAL '2 days',
    'a0000000-0000-0000-0000-000000000002',
    85,
    NOW() - INTERVAL '20 days'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Tasks
INSERT INTO public.tasks (
    id, project_id, title, description, assignee, status, priority, due_date, created_at
) VALUES
(
    't0000000-0000-0000-0000-000000000001',
    'p0000000-0000-0000-0000-000000000001',
    'Implement vector embeddings pipeline in pgvector',
    'Chunk docx files and embed using OpenAI text-embedding-3-small into Supabase pgvector.',
    'a0000000-0000-0000-0000-000000000001',
    'done',
    'high',
    CURRENT_DATE - INTERVAL '1 day',
    NOW() - INTERVAL '4 days'
),
(
    't0000000-0000-0000-0000-000000000002',
    'p0000000-0000-0000-0000-000000000001',
    'Connect automated Slack webhook alerts',
    'Stream real-time agent execution summaries to #nexus-sales channel.',
    'a0000000-0000-0000-0000-000000000001',
    'doing',
    'urgent',
    CURRENT_DATE + INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
),
(
    't0000000-0000-0000-0000-000000000003',
    'p0000000-0000-0000-0000-000000000002',
    'Final client QA on responsive mobile nav',
    'Verify hamburger animations and viewport transitions on iOS Safari.',
    'a0000000-0000-0000-0000-000000000002',
    'doing',
    'high',
    CURRENT_DATE + INTERVAL '1 day',
    NOW() - INTERVAL '2 days'
),
(
    't0000000-0000-0000-0000-000000000004',
    'p0000000-0000-0000-0000-000000000002',
    'Hand off Figma asset tokens and typography guide',
    'Package SVG logos, favicon bundles, and brand kit.',
    'a0000000-0000-0000-0000-000000000002',
    'todo',
    'medium',
    CURRENT_DATE + INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Proposals
INSERT INTO public.proposals (
    id, inquiry_id, project_id, total_price, deliverables, status, sent_at, valid_until, created_at
) VALUES
(
    'pr000000-0000-0000-0000-000000000001',
    'i0000000-0000-0000-0000-000000000004',
    'p0000000-0000-0000-0000-000000000001',
    18000,
    '[
        {"id": "d1", "title": "Knowledge Extraction & Chunking Engine", "description": "Custom parser for PDF, Docx, and Notion exports", "price": 5000},
        {"id": "d2", "title": "Supabase pgvector & Semantic Search", "description": "Hybrid fulltext and cosine similarity vector database", "price": 6000},
        {"id": "d3", "title": "Autonomous Agent & Webhook Integration", "description": "Custom LangGraph pipeline with Slack & Resend notifications", "price": 7000}
    ]'::jsonb,
    'accepted',
    NOW() - INTERVAL '6 days',
    CURRENT_DATE + INTERVAL '24 days',
    NOW() - INTERVAL '6 days'
),
(
    'pr000000-0000-0000-0000-000000000002',
    'i0000000-0000-0000-0000-000000000003',
    NULL,
    6500,
    '[
        {"id": "d1", "title": "Primary Visual Identity & Logo System", "description": "3 distinct design directions with vector files", "price": 3000},
        {"id": "d2", "title": "Complete Brand Style Guidelines", "description": "Typography, color scales, usage rules, 3D icons", "price": 2000},
        {"id": "d3", "title": "Marketing Collateral & Deck Template", "description": "Pitch deck templates in Figma & Keynote", "price": 1500}
    ]'::jsonb,
    'sent',
    NOW() - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '11 days',
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Payments
INSERT INTO public.payments (
    id, project_id, type, amount, status, due_date, paid_at, method, created_at
) VALUES
(
    'py000000-0000-0000-0000-000000000001',
    'p0000000-0000-0000-0000-000000000001',
    'advance',
    9000,
    'paid',
    CURRENT_DATE - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    'Wire Transfer',
    NOW() - INTERVAL '5 days'
),
(
    'py000000-0000-0000-0000-000000000002',
    'p0000000-0000-0000-0000-000000000001',
    'final',
    9000,
    'pending',
    CURRENT_DATE + INTERVAL '14 days',
    NULL,
    NULL,
    NOW() - INTERVAL '5 days'
),
(
    'py000000-0000-0000-0000-000000000003',
    'p0000000-0000-0000-0000-000000000002',
    'advance',
    5000,
    'paid',
    CURRENT_DATE - INTERVAL '18 days',
    NOW() - INTERVAL '18 days',
    'Stripe Invoice',
    NOW() - INTERVAL '18 days'
),
(
    'py000000-0000-0000-0000-000000000004',
    'p0000000-0000-0000-0000-000000000002',
    'final',
    4500,
    'overdue',
    CURRENT_DATE - INTERVAL '2 days',
    NULL,
    NULL,
    NOW() - INTERVAL '18 days'
)
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Activity Log
INSERT INTO public.activity_log (
    id, entity_type, entity_id, action, actor, metadata, created_at
) VALUES
(
    'al00000-0000-0000-0000-000000000001',
    'inquiry',
    'i0000000-0000-0000-0000-000000000004',
    'Converted inquiry to client and launched project',
    'Sanjay (Dev & AI Lead)',
    '{"clientId": "c0000000-0000-0000-0000-000000000001", "projectId": "p0000000-0000-0000-0000-000000000001"}'::jsonb,
    NOW() - INTERVAL '6 days'
),
(
    'al00000-0000-0000-0000-000000000002',
    'payment',
    'py000000-0000-0000-0000-000000000001',
    'Received advance payment of $9,000 via Wire Transfer',
    'Sanjay (Dev & AI Lead)',
    '{"amount": 9000, "type": "advance"}'::jsonb,
    NOW() - INTERVAL '5 days'
),
(
    'al00000-0000-0000-0000-000000000003',
    'proposal',
    'pr000000-0000-0000-0000-000000000002',
    'Sent branding proposal to Sofia Mendez ($6,500)',
    'Sriram (Brand & Design Lead)',
    '{"total_price": 6500, "client": "Sofia Mendez"}'::jsonb,
    NOW() - INTERVAL '3 days'
);
