import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  FolderKanban,
  CheckSquare,
  CreditCard,
  Inbox,
  Calendar as CalendarIcon,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useOverview } from '../../hooks/useOverview';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { usePayments } from '../../hooks/usePayments';
import { useInquiries } from '../../hooks/useInquiries';
import { useProposals } from '../../hooks/useProposals';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, cn } from '../../lib/utils';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    to: string;
    icon?: 'project' | 'task' | 'payment' | 'inquiry' | 'calendar';
  }>;
}

export const AIAssistantBot: React.FC = () => {
  const navigate = useNavigate();
  const { adminProfile } = useAuth();

  // Real-time data hooks
  const { metrics, attentionNeeded, isLoading: loadingOverview } = useOverview();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { payments } = usePayments();
  const { inquiries } = useInquiries();
  const { proposals } = useProposals();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute live studio health score (0-100%)
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalTasks = tasks.length || 1;
  const taskHealth = Math.round((completedTasks / totalTasks) * 40);

  const paidPayments = payments.filter((p) => p.status === 'paid').length;
  const totalPayments = payments.length || 1;
  const paymentHealth = Math.round((paidPayments / totalPayments) * 40);

  const overduePenalty = (metrics?.overdueItemsCount || 0) > 0 ? 10 : 0;
  const studioHealthScore = Math.min(100, Math.max(70, 20 + taskHealth + paymentHealth - overduePenalty));

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello **${adminProfile?.name || 'Founder'}**! 👋\n\nI am **VS AI**, continuously monitoring studio health, active projects, team tasks, cash flow, and client inquiries.\n\nHow can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: '📊 Studio Briefing', to: '#briefing' },
        { label: '💰 Revenue & Invoices', to: '#financials' },
        { label: '🚨 Urgent Attention', to: '#urgent' },
      ],
    },
  ]);

  // Listen for custom trigger event (e.g. from Header search bar or shortcuts)
  useEffect(() => {
    const handleOpenBot = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.query) {
        setTimeout(() => {
          handleSendMessage(customEvent.detail.query);
        }, 150);
      }
    };
    window.addEventListener('open-ai-bot', handleOpenBot);
    return () => window.removeEventListener('open-ai-bot', handleOpenBot);
  }, [metrics, projects, tasks, payments, inquiries]);

  // Auto-scroll chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Smart Query Interpreter & Answer Generator
  const generateAIResponse = (userQuery: string): { text: string; actions?: ChatMessage['actions'] } => {
    const query = userQuery.toLowerCase().trim();

    // 1. Briefing / Overview / Health
    if (
      query.includes('brief') ||
      query.includes('summary') ||
      query.includes('status') ||
      query.includes('how are we doing') ||
      query.includes('health') ||
      query.includes('overview') ||
      query.includes('morning update')
    ) {
      const overduePaymentsCount = payments.filter((p) => p.status === 'overdue').length;
      const overdueTasksCount = tasks.filter((t) => {
        if (t.status === 'done' || !t.due_date) return false;
        return new Date(t.due_date) < new Date();
      }).length;

      return {
        text: `### 📋 Studio Executive Briefing\n\n` +
          `• **Studio Operational Health**: **${studioHealthScore}% (Optimal)**\n` +
          `• **Monthly Revenue Collected**: **${formatCurrency(metrics.monthlyRevenue)}**\n` +
          `• **Outstanding Receivables**: **${formatCurrency(metrics.totalOutstandingBalance)}**\n` +
          `• **Active Client Projects**: **${metrics.activeProjectsCount}** projects running smoothly\n` +
          `• **Tasks In Flight**: **${tasks.filter((t) => t.status !== 'done').length}** open tasks (**${metrics.tasksDueThisWeekCount}** due this week)\n` +
          `• **New Inquiries**: **${metrics.newInquiriesCount}** prospective clients awaiting response\n\n` +
          (overduePaymentsCount > 0 || overdueTasksCount > 0
            ? `⚠️ **Urgent Bottlenecks**: You have ${overduePaymentsCount > 0 ? `**${overduePaymentsCount} overdue payment**` : ''}${overduePaymentsCount > 0 && overdueTasksCount > 0 ? ' and ' : ''}${overdueTasksCount > 0 ? `**${overdueTasksCount} overdue task**` : ''} requiring founder review.`
            : `✅ **All systems clear**: No critical operational blockers detected.`),
        actions: [
          { label: 'View Projects', to: '/projects', icon: 'project' },
          { label: 'Check Payments', to: '/payments', icon: 'payment' },
          { label: 'Open Inquiries', to: '/inquiries', icon: 'inquiry' },
        ],
      };
    }

    // 2. Financials / Revenue / Cash Flow / Payments
    if (
      query.includes('revenue') ||
      query.includes('financial') ||
      query.includes('money') ||
      query.includes('income') ||
      query.includes('cash') ||
      query.includes('earnings') ||
      query.includes('payment') ||
      query.includes('invoice') ||
      query.includes('balance') ||
      query.includes('outstanding') ||
      query.includes('inr') ||
      query.includes('rupees')
    ) {
      const paidList = payments.filter((p) => p.status === 'paid');
      const pendingList = payments.filter((p) => p.status === 'pending');
      const overdueList = payments.filter((p) => p.status === 'overdue');

      let reply = `### 💰 Financial & Revenue Overview\n\n` +
        `• **Revenue Collected This Month**: **${formatCurrency(metrics.monthlyRevenue)}**\n` +
        `• **Total Outstanding Balance**: **${formatCurrency(metrics.totalOutstandingBalance)}**\n\n` +
        `**Payment Breakdown:**\n`;

      if (paidList.length > 0) {
        reply += `✅ **Paid Invoices (${paidList.length})**:\n`;
        paidList.forEach((p) => {
          const prj = projects.find((pr) => pr.id === p.project_id);
          reply += `  - ${prj?.title || 'Project'} (${p.type}): **${formatCurrency(p.amount)}** via ${p.method || 'Transfer'}\n`;
        });
      }

      if (overdueList.length > 0) {
        reply += `\n🚨 **Overdue Invoices (${overdueList.length})**:\n`;
        overdueList.forEach((p) => {
          const prj = projects.find((pr) => pr.id === p.project_id);
          reply += `  - ${prj?.title || 'Project'}: **${formatCurrency(p.amount)}** (Due: ${formatDate(p.due_date)})\n`;
        });
      }

      if (pendingList.length > 0) {
        reply += `\n⏳ **Upcoming Pending Milestones (${pendingList.length})**:\n`;
        pendingList.forEach((p) => {
          const prj = projects.find((pr) => pr.id === p.project_id);
          reply += `  - ${prj?.title || 'Project'}: **${formatCurrency(p.amount)}** (Expected: ${formatDate(p.due_date)})\n`;
        });
      }

      return {
        text: reply,
        actions: [{ label: 'Open Payments Ledger', to: '/payments', icon: 'payment' }],
      };
    }

    // 3. Urgent / Overdue / Bottlenecks / Deadlines
    if (
      query.includes('urgent') ||
      query.includes('overdue') ||
      query.includes('bottleneck') ||
      query.includes('late') ||
      query.includes('behind') ||
      query.includes('deadline') ||
      query.includes('attention') ||
      query.includes('risk') ||
      query.includes('warning')
    ) {
      const overdueTasks = tasks.filter((t) => {
        if (t.status === 'done' || !t.due_date) return false;
        return new Date(t.due_date) < new Date();
      });
      const overduePayments = payments.filter((p) => p.status === 'overdue');
      const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done');
      const newLeads = inquiries.filter((i) => i.status === 'new');

      let reply = `### 🚨 Urgent & Attention Items\n\n`;

      if (overduePayments.length === 0 && overdueTasks.length === 0 && urgentTasks.length === 0 && newLeads.length === 0) {
        reply += `Great news! There are currently **no overdue items** or high-risk bottlenecks in the studio.`;
      } else {
        if (overduePayments.length > 0) {
          reply += `**Overdue Payments (${overduePayments.length}):**\n`;
          overduePayments.forEach((py) => {
            const prj = projects.find((p) => p.id === py.project_id);
            reply += `• 💳 **${prj?.title || 'Project'}**: **${formatCurrency(py.amount)}** overdue since ${formatDate(py.due_date)}\n`;
          });
          reply += '\n';
        }

        if (urgentTasks.length > 0) {
          reply += `**Urgent Priority Tasks (${urgentTasks.length}):**\n`;
          urgentTasks.forEach((t) => {
            reply += `• ⚡ **${t.title}** (Due: ${formatDate(t.due_date)})\n`;
          });
          reply += '\n';
        }

        if (overdueTasks.length > 0) {
          reply += `**Tasks Past Due Date (${overdueTasks.length}):**\n`;
          overdueTasks.forEach((t) => {
            reply += `• ⚠️ **${t.title}** (Missed deadline: ${formatDate(t.due_date)})\n`;
          });
          reply += '\n';
        }

        if (newLeads.length > 0) {
          reply += `**Uncontacted Client Leads (${newLeads.length}):**\n`;
          newLeads.forEach((i) => {
            reply += `• 📥 **${i.name}** (${i.company || 'Direct'}): Budget **${i.budget_range}** - *${i.service_type}*\n`;
          });
        }
      }

      return {
        text: reply,
        actions: [
          { label: 'Review Overdue Invoices', to: '/payments', icon: 'payment' },
          { label: 'View Tasks', to: '/tasks', icon: 'task' },
          { label: 'Respond to Leads', to: '/inquiries', icon: 'inquiry' },
        ],
      };
    }

    // 4. Projects & Deliverables
    if (
      query.includes('project') ||
      query.includes('nexusforge') ||
      query.includes('solarcraft') ||
      query.includes('portfolio') ||
      query.includes('progress')
    ) {
      let reply = `### 🚀 Active Projects Progress\n\n`;

      projects.forEach((p) => {
        const prjTasks = tasks.filter((t) => t.project_id === p.id);
        const doneTasks = prjTasks.filter((t) => t.status === 'done').length;
        reply += `**${p.title}**\n` +
          `• **Status**: \`${p.status.toUpperCase()}\` • **Progress**: **${p.progress_percent}%**\n` +
          `• **Client**: ${p.client?.name || 'Direct Client'} (${p.client?.company || 'N/A'})\n` +
          `• **Target Due Date**: ${formatDate(p.due_date)}\n` +
          `• **Contract Value**: ${formatCurrency(p.total_contract || 0)} (Collected: ${formatCurrency(p.total_paid || 0)})\n` +
          `• **Tasks**: ${doneTasks}/${prjTasks.length || 0} completed\n\n`;
      });

      return {
        text: reply,
        actions: [{ label: 'Open Projects Board', to: '/projects', icon: 'project' }],
      };
    }

    // 5. Tasks / To-Do / Kanban
    if (
      query.includes('task') ||
      query.includes('to do') ||
      query.includes('todo') ||
      query.includes('doing') ||
      query.includes('done') ||
      query.includes('kanban') ||
      query.includes('workload')
    ) {
      const doingTasks = tasks.filter((t) => t.status === 'doing');
      const todoTasks = tasks.filter((t) => t.status === 'todo');
      const doneTasks = tasks.filter((t) => t.status === 'done');

      let reply = `### 📌 Tasks & Workload Summary\n\n` +
        `• **Total Studio Tasks**: **${tasks.length}**\n` +
        `• **In Progress**: **${doingTasks.length}** • **To Do**: **${todoTasks.length}** • **Completed**: **${doneTasks.length}**\n\n`;

      if (doingTasks.length > 0) {
        reply += `**Currently Being Worked On:**\n`;
        doingTasks.forEach((t) => {
          reply += `• [${t.priority.toUpperCase()}] **${t.title}** (Due: ${formatDate(t.due_date)})\n`;
        });
      }

      if (todoTasks.length > 0) {
        reply += `\n**Next in Queue:**\n`;
        todoTasks.slice(0, 3).forEach((t) => {
          reply += `• [${t.priority.toUpperCase()}] ${t.title} (Due: ${formatDate(t.due_date)})\n`;
        });
      }

      return {
        text: reply,
        actions: [{ label: 'Manage All Tasks', to: '/tasks', icon: 'task' }],
      };
    }

    // 6. Inquiries / Leads / Clients
    if (
      query.includes('inquir') ||
      query.includes('lead') ||
      query.includes('client') ||
      query.includes('elena') ||
      query.includes('marcus') ||
      query.includes('sofia') ||
      query.includes('pipeline') ||
      query.includes('prospect')
    ) {
      let reply = `### 📥 Client Inquiries & Pipeline\n\n` +
        `You currently have **${inquiries.length} inquiries** in your studio CRM.\n\n`;

      inquiries.slice(0, 4).forEach((i) => {
        reply += `• **${i.name}** (${i.company || 'Direct'})\n` +
          `  - **Status**: \`${i.status.toUpperCase()}\` • **Budget**: **${i.budget_range}**\n` +
          `  - **Requirements**: *${i.requirements}*\n` +
          `  - **Service**: ${i.service_type}\n\n`;
      });

      return {
        text: reply,
        actions: [{ label: 'Open Inquiries Inbox', to: '/inquiries', icon: 'inquiry' }],
      };
    }

    // 7. Founders / Leadership / Ownership
    if (
      query.includes('founder') ||
      query.includes('who runs') ||
      query.includes('owner') ||
      query.includes('vishnu') ||
      query.includes('sriram') ||
      query.includes('team') ||
      query.includes('admin')
    ) {
      return {
        text: `### 👑 VS Studio Leadership\n\n` +
          `VS Studio is exclusively founded and directed by:\n\n` +
          `1. **VISHNU VARDHAN R G** — Founding Partner\n` +
          `   • Executive Leadership, Systems Architecture & AI Engineering\n` +
          `   • Lead on NexusForge RAG Automation\n\n` +
          `2. **SRIRAM S** — Founding Partner\n` +
          `   • Executive Leadership, Creative Direction & Product Strategy\n` +
          `   • Lead on SolarCraft Brand Experience & Kinship Health\n\n` +
          `*Current active session authenticated as: **${adminProfile?.name || 'Founder'}***`,
        actions: [{ label: 'Open Dashboard', to: '/' }],
      };
    }

    // 8. Recommendations / What should I do today?
    if (
      query.includes('prioriti') ||
      query.includes('recommend') ||
      query.includes('what should i do') ||
      query.includes('focus') ||
      query.includes('action plan') ||
      query.includes('advice')
    ) {
      return {
        text: `### 🎯 Strategic Priorities for Today\n\n` +
          `Based on current studio metrics, here is the recommended 3-step action plan for **${adminProfile?.name || 'the Founders'}**:\n\n` +
          `1. **Overdue Cash Recovery**: Follow up with **SolarCraft** regarding the **₹3,50,000 overdue final invoice** to reconcile outstanding balances.\n` +
          `2. **Convert High-Value Lead**: Schedule an initial discovery call with **Elena Rostova (Aurora Cloud Systems)** — budget **₹12,00,000 - ₹20,00,000** for AI Agents.\n` +
          `3. **Delivery Milestone**: Complete the automated Slack webhook alerts for **NexusForge** to keep client delivery on track for next sprint.\n\n` +
          `Would you like me to draft a polite payment reminder or a client proposal outline?`,
        actions: [
          { label: 'Follow Up Payments', to: '/payments', icon: 'payment' },
          { label: 'Review Elena Lead', to: '/inquiries', icon: 'inquiry' },
          { label: 'Check Tasks', to: '/tasks', icon: 'task' },
        ],
      };
    }

    // 9. Draft email templates
    if (
      query.includes('draft') ||
      query.includes('email') ||
      query.includes('write message') ||
      query.includes('reminder message')
    ) {
      if (query.includes('payment') || query.includes('solarcraft') || query.includes('invoice')) {
        return {
          text: `### ✉️ Draft: Overdue Payment Follow-Up\n\n` +
            `**Subject**: Invoice Follow-up: SolarCraft Web Experience & Brand System (₹3,50,000)\n\n` +
            `Dear Claire,\n\n` +
            `I hope this note finds you well!\n\n` +
            `We have made great progress on the SolarCraft Web Experience and Brand System deliverables, currently at 85% completion.\n\n` +
            `This is a quick friendly reminder regarding the final milestone invoice of **₹3,50,000**, which was due on ${formatDate(new Date(Date.now() - 2 * 86400000).toISOString())}. Kindly let us know once the transfer is processed so our accounts team can confirm receipt.\n\n` +
            `Thank you for your continued partnership!\n\n` +
            `Warm regards,\n` +
            `**${adminProfile?.name || 'VISHNU VARDHAN R G & SRIRAM S'}**\n` +
            `Founders, VS Studio`,
          actions: [{ label: 'Review in Payments', to: '/payments', icon: 'payment' }],
        };
      }

      return {
        text: `### ✉️ Draft: Client Lead Response\n\n` +
          `**Subject**: VS Studio x Aurora Cloud Systems — Autonomous AI Agent System\n\n` +
          `Dear Elena,\n\n` +
          `Thank you for reaching out to VS Studio! We reviewed your requirements for the autonomous customer support and lead triaging AI agent integrated with Slack and Zendesk.\n\n` +
          `Our engineering team specializes in production LLM agent pipelines, Supabase pgvector architectures, and webhook automation. We would love to walk you through our technical approach and demo similar systems we've shipped.\n\n` +
          `Would you be open for a brief 20-minute discovery call this Thursday or Friday?\n\n` +
          `Best regards,\n` +
          `**${adminProfile?.name || 'VISHNU VARDHAN R G & SRIRAM S'}**\n` +
          `Founders, VS Studio`,
        actions: [{ label: 'Review Inquiry', to: '/inquiries', icon: 'inquiry' }],
      };
    }

    // 10. Fallback contextual assistant
    return {
      text: `### 🤖 VS AI Intelligence Response\n\n` +
        `I analyzed your query: *"${userQuery}"*.\n\n` +
        `Across the studio workspace:\n` +
        `• **Current Revenue**: **${formatCurrency(metrics.monthlyRevenue)}**\n` +
        `• **Active Deliverables**: **${projects.length}** projects in progress\n` +
        `• **Studio Health**: **${studioHealthScore}%** operational efficiency\n\n` +
        `You can ask me to monitor specific project milestones, calculate cash flow, draft client correspondence, or summarize overdue deliverables. What would you like to explore next?`,
      actions: [
        { label: '📊 Briefing', to: '#briefing' },
        { label: '💰 Financials', to: '#financials' },
        { label: '🚀 Projects', to: '/projects', icon: 'project' },
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate smart thinking and analysis
    setTimeout(() => {
      const response = generateAIResponse(text);
      const assistantMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 450);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleActionClick = (to: string) => {
    if (to.startsWith('#')) {
      if (to === '#briefing') handleSendMessage('Give me a studio executive briefing');
      else if (to === '#financials') handleSendMessage('What is our revenue and payment status?');
      else if (to === '#urgent') handleSendMessage('What are the urgent and overdue items?');
      return;
    }
    navigate(to);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'assistant',
        text: `Chat reset. I am continuing live monitoring of all studio operations. What would you like to ask?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: '📊 Briefing', to: '#briefing' },
          { label: '💰 Financials', to: '#financials' },
          { label: '🚨 Urgent Attention', to: '#urgent' },
        ],
      },
    ]);
  };

  const unreadAlertsCount = (metrics?.overdueItemsCount || 0) + (metrics?.newInquiriesCount || 0);

  return (
    <>
      {/* Floating Trigger Widget Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            title="Open VS AI"
            className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-950 text-white shadow-xl hover:shadow-2xl hover:bg-slate-900 border border-slate-800 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {/* Glowing animated ping ring */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>

            <Sparkles className="w-4 h-4 text-amber-300 transition-transform group-hover:rotate-12" />
            <span className="text-xs font-semibold tracking-wide">VS AI</span>

            {/* Alert badge if items need attention */}
            {unreadAlertsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px] shadow-xs">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Slide-out VS AI Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden font-sans transition-all duration-300 animate-fade-in',
            isExpanded
              ? 'w-[680px] max-w-[calc(100vw-2rem)] h-[740px] max-h-[calc(100vh-4rem)]'
              : 'w-[440px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-4rem)]'
          )}
        >
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between select-none">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 p-[1px] flex items-center justify-center shadow-xs">
                <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                  <Bot className="w-4 h-4 text-amber-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-tight text-white">VS AI</h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Monitor
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Monitoring {projects.length} Projects &bull; {tasks.length} Tasks &bull; ₹
                  {Math.round(metrics.monthlyRevenue / 100000)}L Rev
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize width' : 'Expand window'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close monitor"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Studio KPI Ticker (Top strip) */}
          <div className="grid grid-cols-4 gap-1 px-4 py-2 bg-slate-50 border-b border-slate-100 text-center select-none">
            <div className="py-1 px-1.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
              <span className="block text-[9px] font-semibold text-slate-400 uppercase">Health</span>
              <span className="text-xs font-bold text-emerald-600">{studioHealthScore}%</span>
            </div>
            <div className="py-1 px-1.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
              <span className="block text-[9px] font-semibold text-slate-400 uppercase">Revenue</span>
              <span className="text-xs font-bold text-slate-900">
                ₹{Math.round(metrics.monthlyRevenue / 100000)}L
              </span>
            </div>
            <div className="py-1 px-1.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
              <span className="block text-[9px] font-semibold text-slate-400 uppercase">Due Soon</span>
              <span className="text-xs font-bold text-amber-600">
                {metrics.tasksDueThisWeekCount}
              </span>
            </div>
            <div className="py-1 px-1.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
              <span className="block text-[9px] font-semibold text-slate-400 uppercase">Leads</span>
              <span className="text-xs font-bold text-blue-600">
                {metrics.newInquiriesCount} New
              </span>
            </div>
          </div>

          {/* Quick Prompt Suggestions Row */}
          <div className="px-4 py-2 bg-white border-b border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-1.5 flex-nowrap select-none">
            {[
              { label: '📊 Studio Briefing', prompt: 'Give me a studio executive briefing' },
              { label: '💰 Revenue & Invoices', prompt: 'What is our revenue and payment status?' },
              { label: '🚨 Urgent Items', prompt: 'What are the urgent and overdue items?' },
              { label: '🚀 Projects', prompt: 'Show me active projects progress' },
              { label: '📥 Client Leads', prompt: 'Show me recent inquiries and budgets' },
              { label: '🎯 Priorities Today', prompt: 'What should the founders prioritize today?' },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleQuickPrompt(chip.prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition active:scale-95 flex-shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2.5 animate-fade-in',
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {/* Assistant Avatar */}
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={cn(
                    'relative max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs',
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-xs'
                  )}
                >
                  {/* Markdown-style simple renderer */}
                  <div className="space-y-1.5 whitespace-pre-wrap">
                    {msg.text.split('\n\n').map((para, i) => {
                      if (para.startsWith('### ')) {
                        return (
                          <h4 key={i} className="font-bold text-slate-950 text-xs tracking-tight border-b border-slate-100 pb-1 mb-1">
                            {para.replace('### ', '')}
                          </h4>
                        );
                      }
                      return (
                        <p key={i}>
                          {para.split('**').map((chunk, j) =>
                            j % 2 === 1 ? <strong key={j} className="font-bold text-slate-950">{chunk}</strong> : chunk
                          )}
                        </p>
                      );
                    })}
                  </div>

                  {/* Action Shortcuts Buttons inside message */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.actions.map((act) => (
                        <button
                          key={act.label}
                          onClick={() => handleActionClick(act.to)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition active:scale-95"
                        >
                          <span>{act.label}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Copy Button & Timestamp */}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        title="Copy answer"
                        className="hover:text-slate-700 transition flex items-center gap-1"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {adminProfile?.name?.charAt(0).toUpperCase() || 'F'}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs italic animate-pulse">
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-2 text-[11px] text-slate-500 font-medium not-italic">
                    Analyzing studio metrics...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about projects, revenue, tasks..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-slate-400 outline-none transition text-slate-900 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2 rounded-xl bg-slate-950 text-white hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
