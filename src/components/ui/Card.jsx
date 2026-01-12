/**
 * Card Component
 * 
 * Container component with optional header, footer, and padding options.
 */

import { forwardRef } from 'react';

// Card root component
const Card = forwardRef(function Card(
  {
    children,
    className = '',
    padding = 'md',
    hover = false,
    onClick,
    ...props
  },
  ref
) {
  // Padding options
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const isClickable = !!onClick;

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`
        bg-white dark:bg-[var(--card)] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-lg hover:-translate-y-1 transform-gpu transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600' : ''}
        ${isClickable ? 'cursor-pointer' : ''}
        ${className}
      `}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
});

// Card Header
function CardHeader({ children, className = '', actions }) {
  return (
    <div
      className={`
        flex items-center justify-between
        pb-4 mb-4 border-b border-gray-200
        ${className}
      `}
    >
      <div className="flex-1">{children}</div>
      {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
    </div>
  );
}

// Card Title
function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </h3>
  );
}

// Card Description
function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-500 dark:text-gray-300 mt-1 ${className}`}>
      {children}
    </p>
  );
}

// Card Content (for when you need explicit content wrapper)
function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

// Card Footer
function CardFooter({ children, className = '', align = 'right' }) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={`
        flex items-center ${alignClasses[align]}
        pt-4 mt-4 border-t border-gray-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Export all components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
