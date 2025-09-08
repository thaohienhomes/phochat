"use client";

import * as React from 'react';
import Link from 'next/link';
import { MessageSquareText, Mail, Phone, MapPin, Github, Twitter, Facebook } from 'lucide-react';

const footerLinks = {
  product: {
    title: 'Sản phẩm',
    titleEn: 'Product',
    links: [
      { href: '/chat', label: 'Trò chuyện AI', labelEn: 'AI Chat' },
      { href: '/pricing', label: 'Bảng giá', labelEn: 'Pricing' },
      { href: '/features', label: 'Tính năng', labelEn: 'Features' },
      { href: '/api', label: 'API', labelEn: 'API' }
    ]
  },
  company: {
    title: 'Công ty',
    titleEn: 'Company',
    links: [
      { href: '/about', label: 'Về chúng tôi', labelEn: 'About Us' },
      { href: '/blog', label: 'Blog', labelEn: 'Blog' },
      { href: '/careers', label: 'Tuyển dụng', labelEn: 'Careers' },
      { href: '/contact', label: 'Liên hệ', labelEn: 'Contact' }
    ]
  },
  support: {
    title: 'Hỗ trợ',
    titleEn: 'Support',
    links: [
      { href: '/help', label: 'Trung tâm trợ giúp', labelEn: 'Help Center' },
      { href: '/docs', label: 'Tài liệu', labelEn: 'Documentation' },
      { href: '/status', label: 'Trạng thái hệ thống', labelEn: 'System Status' },
      { href: '/feedback', label: 'Phản hồi', labelEn: 'Feedback' }
    ]
  },
  legal: {
    title: 'Pháp lý',
    titleEn: 'Legal',
    links: [
      { href: '/privacy', label: 'Chính sách bảo mật', labelEn: 'Privacy Policy' },
      { href: '/terms', label: 'Điều khoản sử dụng', labelEn: 'Terms of Service' },
      { href: '/cookies', label: 'Chính sách Cookie', labelEn: 'Cookie Policy' },
      { href: '/security', label: 'Bảo mật', labelEn: 'Security' }
    ]
  }
};

export function Footer() {
  const [language, setLanguage] = React.useState<'vi' | 'en'>('vi');

  return (
    <footer className="relative bg-card border-t border-border">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-purple rounded-xl flex items-center justify-center">
                <MessageSquareText size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">pho.chat</span>
            </Link>
            
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Trợ lý AI thông minh nhất cho người Việt. Trải nghiệm trò chuyện với đa mô hình AI, 
              streaming thời gian thực và thanh toán QR tiện lợi.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Mail size={16} />
                <span>support@pho.chat</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Phone size={16} />
                <span>+84 (0) 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <MapPin size={16} />
                <span>Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-all duration-200"
              >
                <Github size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-all duration-200"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-all duration-200"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([key, section]) => {
            const title = language === 'vi' ? section.title : section.titleEn;
            
            return (
              <div key={key} className="space-y-4">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, index) => {
                    const label = language === 'vi' ? link.label : link.labelEn;
                    
                    return (
                      <li key={index}>
                        <Link 
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                        >
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 pho.chat. Tất cả quyền được bảo lưu.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Được phát triển với ❤️ tại Việt Nam</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Hệ thống hoạt động bình thường</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}