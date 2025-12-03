/**
 * Visual indicator badge for verified fields
 * Shows verification status with optional tooltip displaying timestamp and processing time
 */

'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface VerifiedFieldBadgeProps {
    /**
     * Whether the field has been verified
     */
    verified: boolean;
    /**
     * ISO timestamp when verification occurred
     */
    verifiedAt?: string;
    /**
     * Processing time in milliseconds from the API response
     */
    processingTime?: number;
    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * Badge component to indicate a field has been verified through external API
 * Displays with emerald color scheme to match success states
 */
export function VerifiedFieldBadge({
    verified,
    verifiedAt,
    processingTime,
    className,
}: VerifiedFieldBadgeProps) {
    if (!verified) {
        return null;
    }

    const formattedDate = verifiedAt
        ? new Date(verifiedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : null;

    const formattedTime = processingTime
        ? processingTime < 1000
            ? `${processingTime.toFixed(0)}ms`
            : `${(processingTime / 1000).toFixed(2)}s`
        : null;

    return (
        <div className={cn('group relative inline-flex', className)}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/50">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
            </span>

            {(verifiedAt || processingTime) && (
                <span
                    role="tooltip"
                    className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-48 -translate-x-1/2 rounded-lg border border-(--border-default) bg-(--surface-app-strong) px-3 py-2 text-xs text-(--text-secondary) shadow-(--shadow-card) group-hover:block"
                >
                    <div className="space-y-1">
                        {formattedDate && (
                            <p>
                                <span className="font-medium text-(--text-primary)">Verified:</span>{' '}
                                {formattedDate}
                            </p>
                        )}
                        {formattedTime && (
                            <p>
                                <span className="font-medium text-(--text-primary)">Response time:</span>{' '}
                                {formattedTime}
                            </p>
                        )}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute left-1/2 top-0 -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-(--border-default) bg-(--surface-app-strong)" />
                </span>
            )}
        </div>
    );
}
