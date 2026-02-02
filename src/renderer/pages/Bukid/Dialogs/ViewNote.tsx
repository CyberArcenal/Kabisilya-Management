// components/Dialogs/ViewNoteDialog.tsx
import React, { useState, useEffect } from 'react';
import { X, BookOpen, Calendar, Edit, Trash2, Download, Printer, Share2, Bookmark, Tag, User } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';
import { dialogs } from '../../../utils/dialogs';

interface ViewNoteDialogProps {
  id: number;
  bukidName: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  tags?: string[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: number) => void;
}

const ViewNoteDialog: React.FC<ViewNoteDialogProps> = ({
  id,
  bukidName,
  note,
  createdAt,
  updatedAt,
  createdBy,
  tags = [],
  onClose,
  onEdit,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = await dialogs.confirm({
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      setIsDeleting(true);
      onDelete(id);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('note-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write(`
        <html>
          <head>
            <title>Note - ${bukidName}</title>
            <style>
              body { font-family: 'Georgia', serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .bukid-name { color: #2a623d; font-size: 28px; font-weight: bold; }
              .note-content { font-size: 16px; line-height: 1.8; white-space: pre-wrap; }
              .metadata { color: #666; font-size: 14px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; }
              .tag { display: inline-block; background: #f0fdf4; padding: 4px 12px; border-radius: 20px; margin: 2px 4px 2px 0; font-size: 12px; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="bukid-name">${bukidName}</h1>
              <p><strong>Note Created:</strong> ${formatDate(createdAt, 'MMMM dd, yyyy hh:mm a')}</p>
              ${createdBy ? `<p><strong>Created By:</strong> ${createdBy}</p>` : ''}
            </div>
            <div class="note-content">${note}</div>
            <div class="metadata">
              ${tags.length > 0 ? `<p><strong>Tags:</strong> ${tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</p>` : ''}
              <p><strong>Last Updated:</strong> ${formatDate(updatedAt, 'MMMM dd, yyyy hh:mm a')}</p>
            </div>
          </body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.focus();
      printWindow?.print();
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(note);
      await dialogs.alert({
        title: 'Copied',
        message: 'Note content copied to clipboard'
      });
    } catch (err) {
      await dialogs.alert({
        title: 'Error',
        message: 'Failed to copy to clipboard'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-modalSlideIn">
        {/* Header - Book Cover Style */}
        <div className="p-6 border-b" style={{ 
          background: 'linear-gradient(135deg, #2a623d 0%, #1a472a 100%)',
          borderTopLeftRadius: '1rem',
          borderTopRightRadius: '1rem'
        }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Note Viewer</h2>
                  <p className="text-white/80 text-sm">Viewing note for bukid</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mt-4">{bukidName}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Book Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Side - Book Spine Effect */}
          <div className="w-6 hidden md:block" style={{ 
            background: 'linear-gradient(to right, #1a472a 0%, #2a623d 100%)'
          }}></div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6" style={{ 
            background: '#f9f7f2',
            backgroundImage: 'linear-gradient(rgba(212, 165, 116, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 165, 116, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>
            {/* Note Metadata */}
            <div className="mb-6 p-4 bg-white/80 rounded-lg border border-amber-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-gray-600">
                    Created: <span className="font-semibold">{formatDate(createdAt, 'MMM dd, yyyy HH:mm')}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-gray-600">
                    Updated: <span className="font-semibold">{formatDate(updatedAt, 'MMM dd, yyyy HH:mm')}</span>
                  </span>
                </div>
                {createdBy && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-gray-600">
                      By: <span className="font-semibold">{createdBy}</span>
                    </span>
                  </div>
                )}
              </div>
              
              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: 'var(--accent-green-light)',
                        color: 'var(--accent-green)',
                        border: '1px solid rgba(42, 98, 61, 0.2)'
                      }}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Note Content - Book Page Style */}
            <div 
              id="note-content"
              className="bg-white border-2 border-amber-300 rounded-lg shadow-inner p-8 min-h-[400px]"
              style={{
                background: 'linear-gradient(transparent, transparent 28px, #f0f0f0 28px)',
                backgroundSize: '100% 30px',
                lineHeight: '30px',
                position: 'relative'
              }}
            >
              {/* Page Corner */}
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400 rounded-tr-lg"></div>
              
              {/* Note Text */}
              <div className="whitespace-pre-wrap font-serif text-lg text-gray-800 leading-relaxed">
                {note}
              </div>

              {/* Page Number */}
              <div className="absolute bottom-4 right-8 text-gray-400 text-sm font-serif">
                1
              </div>
            </div>

            {/* Note Stats */}
            <div className="mt-4 text-sm text-gray-500 text-center">
              <span className="mr-4">📝 {note.length} characters</span>
              <span>📄 {Math.ceil(note.length / 1500)} minute read</span>
            </div>
          </div>
        </div>

        {/* Footer - Book Actions */}
        <div className="p-4 border-t bg-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Printer className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Print</span>
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Copy</span>
            </button>
            <button
              onClick={() => {/* Bookmark functionality */}}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Bookmark className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Bookmark</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2 border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center gap-2"
              style={{
                background: 'var(--primary-color)',
                color: 'var(--sidebar-text)'
              }}
            >
              <Edit className="w-4 h-4" />
              Edit Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNoteDialog;