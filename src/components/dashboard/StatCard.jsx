/**
 * Stat Card Component
 * 
 * Displays a single statistic with icon, value, and optional trend.
 */

import { Card } from '../ui';

// Color variants
const COLORS = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'bg-primary-100 text-primary-600',
    value: 'text-primary-900',
  },
  success: {
    bg: 'bg-success-50',
    icon: 'bg-success-100 text-success-600',
    value: 'text-success-900',
  },
  warning: {
    bg: 'bg-warning-50',
    icon: 'bg-warning-100 text-warning-600',
    value: 'text-warning-900',
  },
  error: {
    bg: 'bg-error-50',
    icon: 'bg-error-100 text-error-600',
    value: 'text-error-900',
  },
  info: {
    bg: 'bg-info-50',
    icon: 'bg-info-100 text-info-600',
    value: 'text-info-900',
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'bg-gray-100 text-gray-600',
    value: 'text-gray-900',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'gray',
  trend,
  trendLabel,
  className = '',
}) {
  const colorClasses = COLORS[color] || COLORS.gray;

  return (
    <Card padding="sm" className={`${colorClasses.bg} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${colorClasses.value}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  trend > 0
                    ? 'text-success-600'
                    : trend < 0
                    ? 'text-error-600'
                    : 'text-gray-500'
                }`}
              >
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
              </span>
              {trendLabel && (
                <span className="text-xs text-gray-500">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorClasses.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Mini stat for inline displays
 */
StatCard.Mini = function MiniStatCard({ label, value, color = 'gray' }) {
  const colorClasses = COLORS[color] || COLORS.gray;

  return (
    <div className={`px-3 py-2 rounded-lg ${colorClasses.bg}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-semibold ${colorClasses.value}`}>{value}</p>
    </div>
  );
};

/**
 * Horizontal stat row
 */
StatCard.Row = function StatRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
};
