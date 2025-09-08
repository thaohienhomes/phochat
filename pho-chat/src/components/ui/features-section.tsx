"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareText, Zap, ShieldCheck, Globe, Smartphone, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: MessageSquareText,
    title: 'Đa mô hình AI tiên tiến',
    titleEn: 'Advanced Multi-Model AI',
    description: 'Truy cập GPT-4o, Claude 3.5, Llama 3.3 và nhiều mô hình AI hàng đầu trong một giao diện thống nhất.',
    descriptionEn: 'Access GPT-4o, Claude 3.5, Llama 3.3 and top AI models in one unified interface.',
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    icon: Zap,
    title: 'Streaming thời gian thực',
    titleEn: 'Real-time Streaming',
    description: 'Trải nghiệm trò chuyện mượt mà với streaming từng từ, không bị gián đoạn khi refresh trang.',
    descriptionEn: 'Smooth chat experience with word-by-word streaming, persistent across page refreshes.',
    gradient: 'from-yellow-500 to-orange-600'
  },
  {
    icon: ShieldCheck,
    title: 'Bảo mật & Riêng tư',
    titleEn: 'Security & Privacy',
    description: 'Dữ liệu được mã hóa end-to-end, tuân thủ các tiêu chuẩn bảo mật quốc tế cao nhất.',
    descriptionEn: 'End-to-end encrypted data, compliant with highest international security standards.',
    gradient: 'from-green-500 to-teal-600'
  },
  {
    icon: Globe,
    title: 'Tối ưu cho tiếng Việt',
    titleEn: 'Vietnamese Optimized',
    description: 'Được huấn luyện đặc biệt cho ngôn ngữ và văn hóa Việt Nam, hiểu context địa phương.',
    descriptionEn: 'Specially trained for Vietnamese language and culture, understands local context.',
    gradient: 'from-red-500 to-pink-600'
  },
  {
    icon: Smartphone,
    title: 'Thanh toán QR tiện lợi',
    titleEn: 'Convenient QR Payment',
    description: 'Hỗ trợ VietQR, MoMo, ZaloPay và các phương thức thanh toán phổ biến tại Việt Nam.',
    descriptionEn: 'Support for VietQR, MoMo, ZaloPay and popular Vietnamese payment methods.',
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    icon: BarChart3,
    title: 'Phân tích & Báo cáo',
    titleEn: 'Analytics & Reports',
    description: 'Dashboard quản lý team với thống kê sử dụng, phân tích hiệu suất và báo cáo chi tiết.',
    descriptionEn: 'Team management dashboard with usage statistics, performance analytics and detailed reports.',
    gradient: 'from-cyan-500 to-blue-600'
  }
];

export function FeaturesSection() {
  const [language, setLanguage] = React.useState<'vi' | 'en'>('vi');

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/20" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            <span className="text-gradient">Tính năng</span> <span className="text-foreground">nổi bật</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            pho.chat mang đến trải nghiệm AI chat hoàn hảo với các tính năng được thiết kế đặc biệt 
            cho người dùng Việt Nam
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const title = language === 'vi' ? feature.title : feature.titleEn;
            const description = language === 'vi' ? feature.description : feature.descriptionEn;

            return (
              <Card 
                key={index} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 glass-morphism border-0"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="space-y-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-primary/5 border border-primary/20 rounded-full px-8 py-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/32?img=${i}`}
                  alt={`User ${i}`}
                  className="w-8 h-8 rounded-full border-2 border-background"
                />
              ))}
            </div>
            <div className="text-left">
              <p className="font-semibold text-primary">10,000+ người dùng</p>
              <p className="text-sm text-muted-foreground">đã tin tưởng pho.chat</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}