/**
 * Utility Functions
 * 
 * Common helper functions used throughout the application.
 */

/**
 * Classname utility - combines class names conditionally
 * Similar to clsx/classnames libraries
 */
export function cn(...classes) {
  return classes
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format a date to a human-readable string
 */
export function formatDate(date, options = {}) {
  const {
    format = 'medium', // 'short', 'medium', 'long', 'relative'
    includeTime = false,
  } = options;

  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }

  // Relative time (e.g., "2 hours ago")
  if (format === 'relative') {
    return formatRelativeTime(d);
  }

  const dateOptions = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' },
  };

  const timeOptions = includeTime
    ? { hour: 'numeric', minute: '2-digit', hour12: true }
    : {};

  return d.toLocaleDateString('en-US', {
    ...dateOptions[format],
    ...timeOptions,
  });
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  
  return formatDate(date, { format: 'medium' });
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text, maxLength = 100, suffix = '...') {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Generate a URL-friendly slug from text
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Capitalize first letter only
 */
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (e) {
      console.error('Copy failed:', e);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Open URL in new tab
 */
export function openInNewTab(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Debounce function calls
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep/delay utility
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random ID
 */
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Format percentage
 */
export function formatPercent(value, decimals = 0) {
  if (value === null || value === undefined) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Get character count with limit indicator
 */
export function getCharCount(text, limit) {
  const count = text?.length || 0;
  return {
    count,
    limit,
    remaining: limit - count,
    isOver: count > limit,
    isNear: count > limit * 0.9,
    display: `${count}/${limit}`,
  };
}

/**
 * Platform display names and icons
 */
export const PLATFORMS = {
  instagram: { name: 'Instagram', icon: 'instagram', color: '#E4405F' },
  facebook: { name: 'Facebook', icon: 'facebook', color: '#1877F2' },
  linkedin: { name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2' },
  x: { name: 'X (Twitter)', icon: 'twitter', color: '#000000' },
  tiktok: { name: 'TikTok', icon: 'music', color: '#000000' },
  reddit: { name: 'Reddit', icon: 'message-circle', color: '#FF4500' },
  forum: { name: 'Forum', icon: 'messages-square', color: '#6B7280' },
  houzz: { name: 'Houzz', icon: 'home', color: '#4DBC15' },
  youtube: { name: 'YouTube', icon: 'youtube', color: '#FF0000' },
  other: { name: 'Other', icon: 'globe', color: '#6B7280' },
};

/**
 * Get platform info by key
 */
export function getPlatformInfo(platform) {
  return PLATFORMS[platform] || PLATFORMS.other;
}

/**
 * Location types for competitor sightings
 */
export const LOCATION_TYPES = {
  facebook_group: { name: 'Facebook Group', icon: 'users' },
  linkedin_group: { name: 'LinkedIn Group', icon: 'users' },
  forum: { name: 'Forum', icon: 'messages-square' },
  subreddit: { name: 'Subreddit', icon: 'message-circle' },
  discord: { name: 'Discord', icon: 'message-circle' },
  slack: { name: 'Slack', icon: 'hash' },
  youtube: { name: 'YouTube', icon: 'youtube' },
  podcast: { name: 'Podcast', icon: 'mic' },
  blog: { name: 'Blog', icon: 'file-text' },
  news_article: { name: 'News Article', icon: 'newspaper' },
  review_site: { name: 'Review Site', icon: 'star' },
  other: { name: 'Other', icon: 'globe' },
};

/**
 * Get location type info
 */
export function getLocationTypeInfo(type) {
  return LOCATION_TYPES[type] || LOCATION_TYPES.other;
}

/**
 * Comment style labels
 */
export const COMMENT_STYLES = {
  conversational: { name: 'Conversational', description: 'Friendly and casual' },
  professional: { name: 'Professional', description: 'Formal and polished' },
  question: { name: 'Question-Based', description: 'Asks engaging questions' },
  'value-add': { name: 'Value-Add', description: 'Provides helpful insights' },
  brief: { name: 'Brief', description: 'Short and punchy' },
};

/**
 * Parse JSON safely
 */
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Deep clone an object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj) {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

/**
 * Group array by key
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {});
}

/**
 * Sort array by key
 */
export function sortBy(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Pick specific keys from object
 */
export function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

/**
 * Omit specific keys from object
 */
export function omit(obj, keys) {
  return Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}
