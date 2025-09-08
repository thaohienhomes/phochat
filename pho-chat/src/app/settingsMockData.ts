import { Language, Theme, SubscriptionTier, PaymentStatus, UserRole } from '@/lib/enums';

// Mock data for settings and profile
export const mockRootProps = {
  user: {
    id: "user_123",
    email: "nguyen.van.a@gmail.com",
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: UserRole.USER as const,
    createdAt: new Date('2024-01-15'),
    lastLoginAt: new Date('2025-01-12')
  },
  subscription: {
    tier: SubscriptionTier.PRO as const,
    status: "active" as const,
    startDate: new Date('2024-06-15'),
    endDate: new Date('2025-06-15'),
    autoRenew: true,
    price: 199000,
    currency: "VND" as const
  },
  preferences: {
    language: Language.VIETNAMESE as const,
    theme: Theme.DARK as const,
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisible: true,
      activityVisible: false,
      dataCollection: true
    }
  },
  billingHistory: [
    {
      id: "payment_001",
      date: new Date('2024-12-15'),
      amount: 199000,
      currency: "VND" as const,
      status: PaymentStatus.COMPLETED as const,
      description: "Pro subscription renewal",
      method: "VietQR" as const
    },
    {
      id: "payment_002", 
      date: new Date('2024-11-15'),
      amount: 199000,
      currency: "VND" as const,
      status: PaymentStatus.COMPLETED as const,
      description: "Pro subscription renewal",
      method: "MoMo" as const
    },
    {
      id: "payment_003",
      date: new Date('2024-10-15'),
      amount: 199000,
      currency: "VND" as const,
      status: PaymentStatus.FAILED as const,
      description: "Pro subscription renewal",
      method: "ZaloPay" as const
    }
  ],
  chatStats: {
    totalMessages: 1247,
    totalSessions: 89,
    favoriteModel: "gpt-4o" as const,
    averageSessionLength: 12.5,
    totalTokensUsed: 156789
  },
  systemInfo: {
    version: "1.2.3",
    lastUpdate: new Date('2025-01-10'),
    status: "operational" as const
  }
};