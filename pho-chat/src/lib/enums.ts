// Language and theme enums for the application
export enum Language {
  VIETNAMESE = 'vi',
  ENGLISH = 'en'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  TEAM = 'team'
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  TEAM_OWNER = 'team_owner'
}