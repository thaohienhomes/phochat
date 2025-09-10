"use client";

import * as React from 'react';
import { Language } from '@/lib/enums';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const I18nContext = React.createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  [Language.VIETNAMESE]: {
    // Navigation
    'nav.home': 'Trang chủ',
    'nav.chat': 'Trò chuyện',
    'nav.settings': 'Cài đặt',
    'nav.profile': 'Hồ sơ',
    'nav.language': 'Tiếng Việt',
    
    // Settings
    'settings.title': 'Cài đặt',
    'settings.account': 'Tài khoản',
    'settings.preferences': 'Tùy chọn',
    'settings.subscription': 'Gói đăng ký',
    'settings.billing': 'Thanh toán',
    'settings.help': 'Trợ giúp',
    
    // Profile
    'profile.title': 'Thông tin cá nhân',
    'profile.name': 'Họ và tên',
    'profile.email': 'Email',
    'profile.avatar': 'Ảnh đại diện',
    'profile.save': 'Lưu thay đổi',
    'profile.cancel': 'Hủy',
    
    // Theme
    'theme.title': 'Giao diện',
    'theme.light': 'Sáng',
    'theme.dark': 'Tối',
    'theme.system': 'Hệ thống',
    
    // Subscription
    'subscription.current': 'Gói hiện tại',
    'subscription.upgrade': 'Nâng cấp',
    'subscription.manage': 'Quản lý',
    'subscription.billing_history': 'Lịch sử thanh toán',
    
    // Common
    'common.loading': 'Đang tải...',
    'common.error': 'Lỗi',
    'common.success': 'Thành công',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.confirm': 'Xác nhận',
    'common.delete': 'Xóa',
    'common.edit': 'Chỉnh sửa',
    'common.close': 'Đóng',
    
    // Notifications
    'notifications.title': 'Thông báo',
    'notifications.email': 'Email',
    'notifications.push': 'Đẩy',
    'notifications.marketing': 'Tiếp thị',
    
    // Privacy
    'privacy.title': 'Quyền riêng tư',
    'privacy.profile_visible': 'Hiển thị hồ sơ',
    'privacy.activity_visible': 'Hiển thị hoạt động',
    'privacy.data_collection': 'Thu thập dữ liệu',
  },
  [Language.ENGLISH]: {
    // Navigation
    'nav.home': 'Home',
    'nav.chat': 'Chat',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.language': 'English',
    
    // Settings
    'settings.title': 'Settings',
    'settings.account': 'Account',
    'settings.preferences': 'Preferences',
    'settings.subscription': 'Subscription',
    'settings.billing': 'Billing',
    'settings.help': 'Help',
    
    // Profile
    'profile.title': 'Personal Information',
    'profile.name': 'Full Name',
    'profile.email': 'Email',
    'profile.avatar': 'Avatar',
    'profile.save': 'Save Changes',
    'profile.cancel': 'Cancel',
    
    // Theme
    'theme.title': 'Theme',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    
    // Subscription
    'subscription.current': 'Current Plan',
    'subscription.upgrade': 'Upgrade',
    'subscription.manage': 'Manage',
    'subscription.billing_history': 'Billing History',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.email': 'Email',
    'notifications.push': 'Push',
    'notifications.marketing': 'Marketing',
    
    // Privacy
    'privacy.title': 'Privacy',
    'privacy.profile_visible': 'Profile Visible',
    'privacy.activity_visible': 'Activity Visible',
    'privacy.data_collection': 'Data Collection',
  }
};

interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export function I18nProvider({ children, defaultLanguage = Language.VIETNAMESE }: I18nProviderProps) {
  const [language, setLanguageState] = React.useState<Language>(defaultLanguage);

  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('pho-chat-language') as Language;
    if (savedLanguage && Object.values(Language).includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = React.useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('pho-chat-language', newLanguage);
  }, []);

  const t = React.useCallback((key: string): string => {
    const dict = translations[language] as Record<string, string>;
    return dict[key] ?? key;
  }, [language]);

  const value = React.useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, setLanguage, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}