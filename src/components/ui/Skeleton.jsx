import React from 'react';

export default function Skeleton({ rows = 3, className = '', style }) {
  return (
    <div className={`space-y-2 ${className}`} style={style}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}
