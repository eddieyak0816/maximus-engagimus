/**
 * Sighting Card Component
 * 
 * Displays a competitor sighting with location info and actions.
 */

import { useState } from 'react';
import {
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Clock,
  User,
} from 'lucide-react';
import { Card, Badge } from '../ui';
import { formatRelativeTime, getLocationTypeInfo } from '../../lib/utils';

export default function SightingCard({
  sighting,
  onEdit,
  onDelete,
  onMarkSeen,
  compact = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const locationInfo = getLocationTypeInfo(sighting.location_type);

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3 min-w-0">
          <Badge variant="secondary" size="xs">
            {locationInfo.name}
          </Badge>
          <span className="text-sm font-medium text-gray-900 truncate">
            {sighting.location_name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge.Priority priority={sighting.priority} />
          <span className="text-xs text-gray-500">
            {formatRelativeTime(sighting.last_seen_at)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card padding="none">
      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Location */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" size="sm">
                {locationInfo.name}
              </Badge>
              <Badge.Priority priority={sighting.priority} />
            </div>

            <h3 className="font-semibold text-gray-900 mt-2">
              {sighting.location_name}
            </h3>

            {/* URL */}
            {sighting.location_url && (
              <a
                href={sighting.location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-1"
              >
                <span className="truncate max-w-xs">
                  {sighting.location_url.replace(/^https?:\/\//, '')}
                </span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            )}

            {/* Competitor info */}
            {sighting.competitor && (
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{sighting.competitor.name}</span>
                {sighting.competitor.client && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">
                      {sighting.competitor.client.name}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Notes */}
            {sighting.notes && (
              <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">
                {sighting.notes}
              </p>
            )}

            {/* Last seen */}
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              Last seen: {formatRelativeTime(sighting.last_seen_at)}
            </div>
          </div>

          {/* Menu */}
          <div className="relative ml-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[var(--card)] rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onMarkSeen();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Eye className="h-4 w-4" />
                    Mark as Seen
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-error-600 hover:bg-error-50 w-full"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Grouped sighting card (by location)
 */
SightingCard.Grouped = function GroupedSightingCard({
  location,
  onViewAll,
}) {
  const locationInfo = getLocationTypeInfo(location.location_type);
  const competitorNames = Array.from(location.competitors).filter(Boolean);

  return (
    <Card padding="sm" hover onClick={onViewAll} className="cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" size="sm">
              {locationInfo.name}
            </Badge>
            <span className="text-sm text-gray-500">
              {location.sightings.length} sighting(s)
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mt-1">
            {location.location_name}
          </h3>
          {competitorNames.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {competitorNames.slice(0, 3).join(', ')}
              {competitorNames.length > 3 && ` +${competitorNames.length - 3} more`}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Last activity</p>
          <p className="text-sm font-medium text-gray-900">
            {location.lastSeen ? formatRelativeTime(location.lastSeen) : 'Never'}
          </p>
        </div>
      </div>
    </Card>
  );
};
