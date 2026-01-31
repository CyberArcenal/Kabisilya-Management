// components/AuditTrail/components/AuditTrailActionsDropdown.tsx
import React, { useRef, useEffect, useState } from 'react';
import {
    Eye, FileText, Download, Copy, Search,
    MoreVertical, ExternalLink, Share2, Bookmark
} from 'lucide-react';

interface AuditTrailActionsDropdownProps {
    auditTrail: any;
    onView: () => void;
    onExport?: () => void;
    onCopyDetails?: () => void;
}

const AuditTrailActionsDropdown: React.FC<AuditTrailActionsDropdownProps> = ({
    auditTrail,
    onView,
    onExport,
    onCopyDetails
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDropdownPosition = () => {
        if (!buttonRef.current) return {};
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = 300;
        const windowHeight = window.innerHeight;

        if (rect.bottom + dropdownHeight > windowHeight) {
            return {
                bottom: `${windowHeight - rect.top + 5}px`,
                right: `${window.innerWidth - rect.right}px`,
            };
        }

        return {
            top: `${rect.bottom + 5}px`,
            right: `${window.innerWidth - rect.right}px`,
        };
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors relative"
                title="More Actions"
            >
                <MoreVertical className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>

            {isOpen && (
                <div
                    className="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-56 z-50 max-h-80 overflow-y-auto"
                    style={getDropdownPosition()}
                >
                    <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions
                        </div>

                        <button
                            onClick={() => handleAction(onView)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Eye className="w-4 h-4" style={{ color: 'var(--accent-sky)' }} />
                            <span>View Details</span>
                        </button>

                        {onCopyDetails && (
                            <button
                                onClick={() => handleAction(onCopyDetails)}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <Copy className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                                <span>Copy Details</span>
                            </button>
                        )}

                        <div className="border-t border-gray-100 my-1"></div>

                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Export
                        </div>

                        {onExport && (
                            <button
                                onClick={() => handleAction(onExport)}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <Download className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
                                <span>Export as JSON</span>
                            </button>
                        )}

                        <div className="border-t border-gray-100 my-1"></div>

                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Future Features
                        </div>

                        <button
                            onClick={() => handleAction(() => {})}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 cursor-not-allowed"
                            disabled
                        >
                            <Share2 className="w-4 h-4" />
                            <span>Share Report</span>
                        </button>
                        <button
                            onClick={() => handleAction(() => {})}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 cursor-not-allowed"
                            disabled
                        >
                            <Bookmark className="w-4 h-4" />
                            <span>Bookmark</span>
                        </button>
                        <button
                            onClick={() => handleAction(() => {})}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 cursor-not-allowed"
                            disabled
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open in New Tab</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditTrailActionsDropdown;