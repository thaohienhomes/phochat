"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/components/providers/i18n-provider';
import { useTheme } from '@/components/providers/theme-provider';
import { Language, Theme, SubscriptionTier, PaymentStatus } from '@/lib/enums';
import { formatCurrency, formatDate, formatSubscriptionTier, formatPaymentStatus } from '@/lib/formatters';
import { User, Settings, CreditCard, Bell, Shield, HelpCircle, Sun, Moon, Monitor, Globe, Save, X } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  createdAt: Date;
  lastLoginAt: Date;
}

interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: 'active' | 'inactive' | 'cancelled';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  price: number;
  currency: 'VND' | 'USD';
}

interface UserPreferences {
  language: Language;
  theme: Theme;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
    dataCollection: boolean;
  };
}

interface BillingRecord {
  id: string;
  date: Date;
  amount: number;
  currency: 'VND' | 'USD';
  status: PaymentStatus;
  description: string;
  method: 'VietQR' | 'MoMo' | 'ZaloPay' | 'Stripe';
}

interface SettingsPageProps {
  user: UserProfile;
  subscription: SubscriptionInfo;
  preferences: UserPreferences;
  billingHistory: BillingRecord[];
  onUpdateProfile?: (data: Partial<UserProfile>) => Promise<void>;
  onUpdatePreferences?: (preferences: Partial<UserPreferences>) => Promise<void>;
}

export function SettingsPage({
  user,
  subscription,
  preferences,
  billingHistory,
  onUpdateProfile,
  onUpdatePreferences
}: SettingsPageProps) {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  
  const [profileData, setProfileData] = React.useState({
    name: user.name,
    email: user.email
  });
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveProfile = async () => {
    if (!onUpdateProfile) return;
    
    setIsSaving(true);
    try {
      await onUpdateProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    const lang = newLanguage as Language;
    setLanguage(lang);
    onUpdatePreferences?.({ language: lang });
  };

  const handleThemeChange = (newTheme: string) => {
    const themeValue = newTheme as Theme;
    setTheme(themeValue);
    onUpdatePreferences?.({ theme: themeValue });
  };

  const handleNotificationChange = (key: keyof UserPreferences['notifications'], value: boolean) => {
    const newNotifications = { ...preferences.notifications, [key]: value };
    onUpdatePreferences?.({ notifications: newNotifications });
  };

  const handlePrivacyChange = (key: keyof UserPreferences['privacy'], value: boolean) => {
    const newPrivacy = { ...preferences.privacy, [key]: value };
    onUpdatePreferences?.({ privacy: newPrivacy });
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          {language === Language.VIETNAMESE 
            ? 'Quản lý tài khoản và tùy chọn của bạn' 
            : 'Manage your account and preferences'
          }
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User size={16} />
            <span>{t('settings.account')}</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Settings size={16} />
            <span>{t('settings.preferences')}</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center space-x-2">
            <CreditCard size={16} />
            <span>{t('settings.subscription')}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell size={16} />
            <span>{t('notifications.title')}</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center space-x-2">
            <Shield size={16} />
            <span>{t('privacy.title')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User size={20} />
                <span>{t('profile.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === Language.VIETNAMESE 
                      ? `Tham gia từ ${formatDate(user.createdAt, language)}`
                      : `Member since ${formatDate(user.createdAt, language)}`
                    }
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('profile.name')}</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData({ name: user.name, email: user.email });
                      }}
                    >
                      <X size={16} className="mr-2" />
                      {t('profile.cancel')}
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      <Save size={16} className="mr-2" />
                      {isSaving ? t('common.loading') : t('profile.save')}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    {t('common.edit')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe size={20} />
                <span>{language === Language.VIETNAMESE ? 'Ngôn ngữ' : 'Language'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Language.VIETNAMESE}>Tiếng Việt</SelectItem>
                  <SelectItem value={Language.ENGLISH}>English</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sun size={20} />
                <span>{t('theme.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Theme.LIGHT}>
                    <div className="flex items-center space-x-2">
                      <Sun size={16} />
                      <span>{t('theme.light')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={Theme.DARK}>
                    <div className="flex items-center space-x-2">
                      <Moon size={16} />
                      <span>{t('theme.dark')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={Theme.SYSTEM}>
                    <div className="flex items-center space-x-2">
                      <Monitor size={16} />
                      <span>{t('theme.system')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard size={20} />
                  <span>{t('subscription.current')}</span>
                </div>
                <Badge variant={subscription.status === 'active' ? 'success' : 'secondary'}>
                  {formatSubscriptionTier(subscription.tier, language)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === Language.VIETNAMESE ? 'Giá' : 'Price'}
                  </p>
                  <p className="font-semibold">
                    {formatCurrency(subscription.price, subscription.currency)}/
                    {language === Language.VIETNAMESE ? 'tháng' : 'month'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === Language.VIETNAMESE ? 'Gia hạn tiếp theo' : 'Next renewal'}
                  </p>
                  <p className="font-semibold">{formatDate(subscription.endDate, language)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  {language === Language.VIETNAMESE ? 'Tự động gia hạn' : 'Auto-renewal'}
                </span>
                <Switch checked={subscription.autoRenew} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle>{t('subscription.billing_history')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{record.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(record.date, language)} • {record.method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(record.amount, record.currency)}
                      </p>
                      <Badge 
                        variant={record.status === PaymentStatus.COMPLETED ? 'success' : 
                                record.status === PaymentStatus.FAILED ? 'destructive' : 'secondary'}
                      >
                        {formatPaymentStatus(record.status, language)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell size={20} />
                <span>{t('notifications.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('notifications.email')}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === Language.VIETNAMESE 
                      ? 'Nhận thông báo qua email' 
                      : 'Receive notifications via email'
                    }
                  </p>
                </div>
                <Switch 
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked: boolean) => handleNotificationChange('email', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('notifications.push')}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === Language.VIETNAMESE 
                      ? 'Nhận thông báo đẩy' 
                      : 'Receive push notifications'
                    }
                  </p>
                </div>
                <Switch 
                  checked={preferences.notifications.push}
                  onCheckedChange={(checked: boolean) => handleNotificationChange('push', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('notifications.marketing')}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === Language.VIETNAMESE 
                      ? 'Nhận thông tin khuyến mãi và cập nhật sản phẩm' 
                      : 'Receive promotional and product updates'
                    }
                  </p>
                </div>
                <Switch 
                  checked={preferences.notifications.marketing}
                  onCheckedChange={(checked: boolean) => handleNotificationChange('marketing', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield size={20} />
                <span>{t('privacy.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('privacy.profile_visible')}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === Language.VIETNAMESE 
                      ? 'Cho phép người khác xem hồ sơ của bạn' 
                      : 'Allow others to view your profile'
                    }
                  </p>
                </div>
                <Switch 
                  checked={preferences.privacy.profileVisible}
                  onCheckedChange={(checked: boolean) => handlePrivacyChange('profileVisible', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('privacy.activity_visible')}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === Language.VIETNAMESE 
                      ? 'Hiển thị hoạt động của bạn cho người khác' 
                      : 'Show your activity to others'
                    }
                  </p>
                </div>
                <Switch 
                  checked={preferences.privacy.activityVisible}
                  onCheckedChange={(checked: boolean) => handlePrivacyChange('activityVisible', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('privacy.data_collection')}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === Language.VIETNAMESE 
                      ? 'Cho phép thu thập dữ liệu để cải thiện dịch vụ' 
                      : 'Allow data collection to improve services'
                    }
                  </p>
                </div>
                <Switch 
                  checked={preferences.privacy.dataCollection}
                  onCheckedChange={(checked: boolean) => handlePrivacyChange('dataCollection', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}