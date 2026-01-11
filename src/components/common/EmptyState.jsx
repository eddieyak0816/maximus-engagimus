/**
 * Empty State Component
 * 
 * Consistent empty state displays across the application.
 */

import { Link } from 'react-router-dom';
import {
  Inbox,
  Users,
  MessageSquare,
  Search,
  Clock,
  Eye,
  Settings,
  FileText,
} from 'lucide-react';
import { Button, Card } from '../ui';

// Preset configurations
const PRESETS = {
  clients: {
    icon: Users,
    title: 'No Clients Yet',
    description: 'Add your first client to start generating comments.',
    actionLabel: 'Add Client',
    actionLink: '/clients',
  },
  generators: {
    icon: MessageSquare,
    title: 'Ready to Generate',
    description: 'Fill in the form to create AI-powered comment options.',
  },
  history: {
    icon: Clock,
    title: 'No History Yet',
    description: 'Your generated comments will appear here.',
    actionLabel: 'Generate Comments',
    actionLink: '/generator',
  },
  search: {
    icon: Search,
    title: 'No Results Found',
    description: 'Try adjusting your search or filters.',
  },
  competitors: {
    icon: Eye,
    title: 'No Competitors',
    description: 'Add competitors to track their engagement activity.',
    actionLabel: 'Add Competitor',
  },
  sightings: {
    icon: Eye,
    title: 'No Sightings',
    description: 'Log sightings when you spot competitors engaging online.',
    actionLabel: 'Log Sighting',
  },
  settings: {
    icon: Settings,
    title: 'No Configuration',
    description: 'Configure your settings to get started.',
  },
  generic: {
    icon: Inbox,
    title: 'Nothing Here',
    description: 'There is no data to display.',
  },
  documents: {
    icon: FileText,
    title: 'No Documents',
    description: 'No documents have been added yet.',
  },
};

export default function EmptyState({
  preset,
  icon: CustomIcon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  children,
  compact = false,
  className = '',
}) {
  // Get preset config or use custom props
  const config = preset ? PRESETS[preset] || PRESETS.generic : {};
  
  const Icon = CustomIcon || config.icon || Inbox;
  const displayTitle = title || config.title || 'Nothing Here';
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;
  const displayActionLink = actionLink || config.actionLink;

  if (compact) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <Icon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{displayTitle}</p>
        {displayDescription && (
          <p className="text-xs text-gray-400 mt-1">{displayDescription}</p>
        )}
      </div>
    );
  }

  return (
    <Card className={`text-center py-12 ${className}`}>
      <Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{displayTitle}</h3>
      {displayDescription && (
        <p className="text-gray-500 max-w-md mx-auto mb-6">{displayDescription}</p>
      )}
      
      {/* Custom children */}
      {children}
      
      {/* Action button */}
      {(displayActionLabel || onAction) && !children && (
        <div className="mt-4">
          {displayActionLink ? (
            <Link to={displayActionLink}>
              <Button>{displayActionLabel}</Button>
            </Link>
          ) : onAction ? (
            <Button onClick={onAction}>{displayActionLabel}</Button>
          ) : null}
        </div>
      )}
    </Card>
  );
}

/**
 * Inline empty state for smaller containers
 */
EmptyState.Inline = function InlineEmptyState({
  icon: Icon = Inbox,
  message = 'No items',
  className = '',
}) {
  return (
    <div className={`flex items-center justify-center gap-2 py-4 text-gray-400 ${className}`}>
      <Icon className="h-4 w-4" />
      <span className="text-sm">{message}</span>
    </div>
  );
};

/**
 * Error empty state
 */
EmptyState.Error = function ErrorEmptyState({
  title = 'Something went wrong',
  message = 'An error occurred while loading data.',
  onRetry,
  className = '',
}) {
  return (
    <Card className={`text-center py-12 bg-error-50 border-error-200 ${className}`}>
      <div className="h-12 w-12 rounded-full bg-error-100 mx-auto mb-4 flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-lg font-medium text-error-900 mb-2">{title}</h3>
      <p className="text-error-700 max-w-md mx-auto mb-6">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Card>
  );
};

/**
 * Loading placeholder that matches empty state dimensions
 */
EmptyState.Loading = function LoadingEmptyState({ className = '' }) {
  return (
    <Card className={`py-12 ${className}`}>
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 bg-gray-200 rounded-full mb-4 animate-pulse" />
        <div className="h-5 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
      </div>
    </Card>
  );
};
