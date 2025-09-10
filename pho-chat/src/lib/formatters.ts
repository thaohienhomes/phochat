import { Language, Theme, SubscriptionTier, PaymentStatus } from './enums';

export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (date: Date, language: Language): string => {
  const locale = language === Language.VIETNAMESE ? 'vi-VN' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatDateTime = (date: Date, language: Language): string => {
  const locale = language === Language.VIETNAMESE ? 'vi-VN' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatSubscriptionTier = (tier: SubscriptionTier, language: Language): string => {
  const translations = {
    [SubscriptionTier.FREE]: {
      [Language.VIETNAMESE]: 'Miễn phí',
      [Language.ENGLISH]: 'Free'
    },
    [SubscriptionTier.PRO]: {
      [Language.VIETNAMESE]: 'Pro',
      [Language.ENGLISH]: 'Pro'
    },
    [SubscriptionTier.TEAM]: {
      [Language.VIETNAMESE]: 'Team',
      [Language.ENGLISH]: 'Team'
    }
  };
  return translations[tier][language];
};

export const formatPaymentStatus = (status: PaymentStatus, language: Language): string => {
  const translations = {
    [PaymentStatus.PENDING]: {
      [Language.VIETNAMESE]: 'Đang xử lý',
      [Language.ENGLISH]: 'Pending'
    },
    [PaymentStatus.COMPLETED]: {
      [Language.VIETNAMESE]: 'Hoàn thành',
      [Language.ENGLISH]: 'Completed'
    },
    [PaymentStatus.FAILED]: {
      [Language.VIETNAMESE]: 'Thất bại',
      [Language.ENGLISH]: 'Failed'
    },
    [PaymentStatus.CANCELLED]: {
      [Language.VIETNAMESE]: 'Đã hủy',
      [Language.ENGLISH]: 'Cancelled'
    }
  };
  return translations[status][language];
};

export const formatTheme = (theme: Theme, language: Language): string => {
  const translations = {
    [Theme.LIGHT]: {
      [Language.VIETNAMESE]: 'Sáng',
      [Language.ENGLISH]: 'Light'
    },
    [Theme.DARK]: {
      [Language.VIETNAMESE]: 'Tối',
      [Language.ENGLISH]: 'Dark'
    },
    [Theme.SYSTEM]: {
      [Language.VIETNAMESE]: 'Hệ thống',
      [Language.ENGLISH]: 'System'
    }
  };
  return translations[theme][language];
};