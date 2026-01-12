/**
 * RecentActivity Component
 *
 * Simple list of recent activity items used in the dashboard.
 */

import React from 'react';
import { Card } from '../ui';
import { formatRelativeTime } from '../../lib/utils';

export default function RecentActivity({ items = [], loading = false }) {
  if (loading) {
    return (
      <Card padding="md">
        <div className="space-y-3">
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card padding="md">
        <p className="text-sm text-gray-600">No recent activity.</p>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="p-4 space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-900">{it.summary || it.text || 'Activity'}</p>
              <p className="text-xs text-gray-500">{formatRelativeTime(it.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
