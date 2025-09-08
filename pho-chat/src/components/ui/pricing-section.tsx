"use client";

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Zap, Crown } from 'lucide-react';

const pricingPlans = [
  {
    name: 'Miễn phí',
    nameEn: 'Free',
    price: '0',
    period: 'tháng',
    periodEn: 'month',
    description: 'Hoàn hảo để bắt đầu',
    descriptionEn: 'Perfect to get started',
    features: [
      '600 tin nhắn/tháng',
      '2-3 mô hình AI cơ bản',
      'Không lưu lịch sử',
      'Hỗ trợ Tiếng Việt/English',
      'Hỗ trợ cộng đồng'
    ],
    featuresEn: [
      '600 messages/month',
      '2-3 basic AI models',
      'No history save',
      'Vietnamese/English support',
      'Community support'
    ],
    buttonText: 'Bắt đầu miễn phí',
    buttonTextEn: 'Start Free',
    popular: false,
    icon: Star,
    gradient: 'from-gray-400 to-gray-600'
  },
  {
    name: 'Pro',
    nameEn: 'Pro',
    price: '199,000',
    priceUsd: '8',
    period: 'tháng',
    periodEn: 'month',
    description: 'Cho người dùng chuyên nghiệp',
    descriptionEn: 'For professional users',
    features: [
      'Tin nhắn không giới hạn',
      '10+ mô hình AI cao cấp',
      'Lưu lịch sử trò chuyện',
      'Xuất dữ liệu',
      'Hỗ trợ ưu tiên',
      'API access'
    ],
    featuresEn: [
      'Unlimited messages',
      '10+ premium AI models',
      'Chat history save',
      'Data export',
      'Priority support',
      'API access'
    ],
    buttonText: 'Nâng cấp Pro',
    buttonTextEn: 'Upgrade to Pro',
    popular: true,
    icon: Zap,
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    name: 'Team',
    nameEn: 'Team',
    price: '499,000',
    priceUsd: '20',
    period: 'tháng',
    periodEn: 'month',
    description: 'Cho nhóm và doanh nghiệp',
    descriptionEn: 'For teams and businesses',
    features: [
      '5 tài khoản',
      'Tất cả tính năng Pro',
      'Dashboard quản lý',
      'Phân tích chi tiết',
      'Hóa đơn VAT',
      'Hỗ trợ 24/7'
    ],
    featuresEn: [
      '5 seats included',
      'All Pro features',
      'Admin dashboard',
      'Advanced analytics',
      'VAT invoice',
      '24/7 support'
    ],
    buttonText: 'Liên hệ bán hàng',
    buttonTextEn: 'Contact Sales',
    popular: false,
    icon: Crown,
    gradient: 'from-yellow-500 to-orange-600'
  }
];

export function PricingSection() {
  const [language, setLanguage] = React.useState<'vi' | 'en'>('vi');
  const [showQR, setShowQR] = React.useState<string | null>(null);

  const handleSubscribe = (planName: string) => {
    if (planName === 'Pro' || planName === 'Team') {
      setShowQR(planName);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-background" />
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            <span className="text-foreground">Bảng giá</span> <span className="text-gradient">minh bạch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Chọn gói phù hợp với nhu cầu của bạn. Thanh toán dễ dàng với QR code và các phương thức phổ biến tại Việt Nam.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon;
            const name = language === 'vi' ? plan.name : plan.nameEn;
            const description = language === 'vi' ? plan.description : plan.descriptionEn;
            const features = language === 'vi' ? plan.features : plan.featuresEn;
            const buttonText = language === 'vi' ? plan.buttonText : plan.buttonTextEn;
            const period = language === 'vi' ? plan.period : plan.periodEn;

            return (
              <Card 
                key={index}
                className={`relative group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                  plan.popular ? 'ring-2 ring-primary scale-105' : ''
                } glass-morphism border-0`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Phổ biến nhất
                    </div>
                  </div>
                )}

                <CardHeader className="text-center space-y-4 pb-8">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${plan.gradient} p-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  
                  <div>
                    <CardTitle className="text-2xl font-bold mb-2">{name}</CardTitle>
                    <p className="text-muted-foreground">{description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center space-x-2">
                      <span className="text-4xl font-bold text-gradient">
                        {plan.price === '0' ? 'Miễn phí' : `₫${plan.price}`}
                      </span>
                      {plan.price !== '0' && (
                        <span className="text-muted-foreground">/{period}</span>
                      )}
                    </div>
                    {plan.priceUsd && (
                      <p className="text-sm text-muted-foreground">≈ ${plan.priceUsd} USD</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check size={20} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${plan.popular ? 'gradient-purple text-white' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.name)}
                  >
                    {buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* QR Payment Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full glass-morphism">
              <CardHeader className="text-center">
                <CardTitle>Thanh toán QR Code</CardTitle>
                <p className="text-muted-foreground">
                  Quét mã QR để thanh toán gói {showQR}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1545063328-c8e3faffa16f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxRUiUyMGNvZGUlMjBtb2JpbGUlMjBwYXltZW50JTIwYmFua2luZyUyMHRlY2hub2xvZ3l8ZW58MHwyfHxibHVlfDE3NTcyMTk4NDh8MA&ixlib=rb-4.1.0&q=85"
                    alt="QR Code payment interface by Balázs Kétyi on Unsplash"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-semibold">
                    {showQR === 'Pro' ? '₫199,000' : '₫499,000'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hỗ trợ: VietQR, MoMo, ZaloPay
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowQR(null)}>
                    Hủy
                  </Button>
                  <Button className="flex-1">
                    Xác nhận thanh toán
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Methods */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">Phương thức thanh toán được hỗ trợ</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold">VietQR</div>
            <div className="text-2xl font-bold text-pink-500">MoMo</div>
            <div className="text-2xl font-bold text-blue-500">ZaloPay</div>
            <div className="text-2xl font-bold text-purple-500">Stripe</div>
          </div>
        </div>
      </div>
    </section>
  );
}