"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, MessageSquareText, Settings, User, Home, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/providers/i18n-provider';
import { Language } from '@/lib/enums';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
}

const navigationItems = [
  { href: '/', labelKey: 'nav.home', icon: Home },
  { href: '/', labelKey: 'nav.chat', icon: MessageSquareText },
  { href: '/settings', labelKey: 'nav.settings', icon: Settings },
  { href: '/profile', labelKey: 'nav.profile', icon: User },
];

export function Navigation({ className }: NavigationProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t, language, setLanguage } = useI18n();
  const pathname = usePathname();

  const toggleLanguage = () => {
    setLanguage(language === Language.VIETNAMESE ? Language.ENGLISH : Language.VIETNAMESE);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden glass-morphism"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full w-64 glass-morphism transform transition-transform duration-300 ease-in-out z-40",
        "md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center">
                <MessageSquareText size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">pho.chat</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const label = t(item.labelKey);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                    "hover:bg-primary/10 hover:text-primary",
                    isActive && "bg-primary/20 text-primary border border-primary/30"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={20} />
                  <span className="font-medium">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Language Toggle */}
          <div className="mt-auto pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={toggleLanguage}
              className="w-full justify-start space-x-3"
            >
              <Globe size={20} />
              <span>{t('nav.language')}</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}