import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Inquiry, InquiryStatus } from '../../types';
import {
  getInquiryStatusBadge,
  formatDate,
  formatDateTime,
  formatServiceType,
} from '../../lib/utils';
import { getSignedFileUrl, getFileNameFromPath } from '../../lib/storage';
import {
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  ExternalLink,
  FileText,
  Download,
  ArrowRight,
  Save,
  CheckCircle,
} from 'lucide-react';

interface InquiryDetailDrawerProps {
  inquiry: Inquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: InquiryStatus) => Promise<unknown>;
  onNotesChange: (notes: string) => Promise<unknown>;
  onOpenConvertModal: (inquiry: Inquiry) => void;
}

export const InquiryDetailDrawer: React.FC<InquiryDetailDrawerProps> = ({
  inquiry,
  isOpen,
  onClose,
  onStatusChange,
  onNotesChange,
  onOpenConvertModal,
}) => {
  const [notes, setNotes] = useState(inquiry?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  React.useEffect(() => {
    if (inquiry) {
      setNotes(inquiry.notes || '');
    }
  }, [inquiry]);

  if (!inquiry) return null;

  const statusBadge = getInquiryStatusBadge(inquiry.status);

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onNotesChange(notes);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDownloadFile = async (filePath: string) => {
    setDownloadingFile(filePath);
    try {
      const { signedUrl, error } = await getSignedFileUrl(filePath);
      if (error || !signedUrl) {
        alert('Could not generate signed download link: ' + (error?.message || 'File not found'));
        return;
      }
      window.open(signedUrl, '_blank');
    } finally {
      setDownloadingFile(null);
    }
  };

  const referenceLinks = inquiry.reference_links
    ? inquiry.reference_links.split(',').map((l) => l.trim())
    : [];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={inquiry.name}
      description={`Submitted ${formatDateTime(inquiry.created_at)}`}
      width="xl"
    >
      <div className="space-y-6 text-sm">
        {/* Top Status & Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={inquiry.status}
              onChange={(e) => onStatusChange(e.target.value as InquiryStatus)}
              className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-primary-500"
            >
              <option value="new">New Lead</option>
              <option value="reviewing">Reviewing</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="accepted">Accepted (Converted)</option>
              <option value="rejected">Rejected</option>
            </select>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${statusBadge.className}`}
            >
              {statusBadge.label}
            </span>
          </div>

          {inquiry.status !== 'accepted' && (
            <Button
              variant="gradient"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                onOpenConvertModal(inquiry);
              }}
            >
              Convert to Client + Project
            </Button>
          )}
        </div>

        {/* Contact & Meta Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <a
              href={`mailto:${inquiry.email}`}
              className="text-xs hover:text-cyan-400 hover:underline truncate"
            >
              {inquiry.email}
            </a>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-xs">{inquiry.phone || 'No phone provided'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <Building className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-xs">{inquiry.company || 'Private Individual'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-emerald-300">
              Budget: {inquiry.budget_range}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <Calendar className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <span className="text-xs">Deadline: {formatDate(inquiry.deadline)}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <span className="text-xs font-medium text-slate-400">Service:</span>
            <span className="text-xs font-semibold text-cyan-300">
              {formatServiceType(inquiry.service_type)}
            </span>
          </div>
        </div>

        {/* Project Requirements & Brief */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Project Scope & Requirements
          </h4>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans">
            {inquiry.requirements}
          </div>
        </div>

        {/* Reference Links */}
        {referenceLinks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inspiration & Reference Links
            </h4>
            <div className="space-y-1.5">
              {referenceLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.startsWith('http') ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/40 transition"
                >
                  <span className="truncate">{link}</span>
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 ml-2 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Client Files (Signed URLs) */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Client Attached Documents (Private Storage)
          </h4>
          {inquiry.file_urls && inquiry.file_urls.length > 0 ? (
            <div className="space-y-2">
              {inquiry.file_urls.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-200 truncate">
                      {getFileNameFromPath(file)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    isLoading={downloadingFile === file}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleDownloadFile(file)}
                  >
                    Download Signed URL
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic p-3 rounded-lg bg-slate-900/30 border border-slate-800/50">
              No files uploaded by client with this submission.
            </p>
          )}
        </div>

        {/* Internal Founder Notes */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Internal Founder Notes
            </h4>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs"
              isLoading={isSavingNotes}
              leftIcon={<Save className="w-3 h-3" />}
              onClick={handleSaveNotes}
            >
              Save Notes
            </Button>
          </div>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal founder discussion, scope notes, call takeaways..."
            className="w-full rounded-xl bg-slate-900/80 border border-slate-800 p-3 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>
    </Drawer>
  );
};
