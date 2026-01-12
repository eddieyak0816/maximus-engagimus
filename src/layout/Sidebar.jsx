/**
 * Sidebar Component
 * 
 * Main navigation sidebar with links to all app sections.
 */

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquarePlus,
  Search,
  Eye,
  History,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Navigation items
const navItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: Users,
  },
  {
    name: 'Generator',
    href: '/generator',
    icon: MessageSquarePlus,
  },
  {
    name: 'Analyzer',
    href: '/analyzer',
    icon: Search,
  },
  {
    name: 'Competitors',
    href: '/competitors',
    icon: Eye,
  },
  {
    name: 'History',
    href: '/history',
    icon: History,
  },
];

const bottomNavItems = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      id="main-sidebar"
      className={`
        fixed left-0 top-0 z-40 h-screen
        bg-white dark:bg-[var(--bg)] border-r border-gray-200 dark:border-transparent
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
      `}
      aria-label="Sidebar navigation"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-9 w-9 bg-primary-500 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                Maximus <span className="text-primary-500">Engage</span>imus
              </span>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50
                ${isActive
                  ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-300 border-l-4 border-primary-500 pl-2'
                  : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[var(--card-soft)] hover:text-gray-900 dark:hover:text-gray-100'
                }
                ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0 text-gray-700 dark:text-gray-200" aria-hidden="true" />
              {!collapsed && <span className="text-gray-900 dark:text-gray-100 font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="px-3 py-4 border-t border-gray-200 space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200
                ${isActive
                  ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-300 border-l-4 border-primary-500 pl-2'
                  : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[var(--card-soft)] hover:text-gray-900 dark:hover:text-gray-100'
                }
                ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0 text-gray-700 dark:text-gray-200" />
              {!collapsed && <span className="text-gray-900 dark:text-gray-100 font-medium">{item.name}</span>}
            </NavLink>
          ))}

          {/* Collapse Toggle */}
          <button
            onClick={onToggle}
            aria-controls="main-sidebar"
            aria-expanded={!collapsed}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg w-full
              text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[var(--card-soft)] hover:text-gray-900 dark:hover:text-gray-100
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-200" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" aria-hidden="true" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
