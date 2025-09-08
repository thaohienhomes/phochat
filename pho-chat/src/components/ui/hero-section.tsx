"use client";

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquareText, Zap, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  const [demoMessage, setDemoMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoMessage.trim()) return;
    
    setIsTyping(true);
    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      setDemoMessage('');
    }, 2000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-purple opacity-5" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles size={16} />
                <span>Trí tuệ nhân tạo tiên tiến</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-gradient">pho.chat</span>
                <br />
                <span className="text-foreground">Trợ lý AI</span>
                <br />
                <span className="text-foreground">cho người Việt</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Trải nghiệm trò chuyện với AI thông minh nhất, được tối ưu hóa cho tiếng Việt. 
                Hỗ trợ đa mô hình, streaming thời gian thực và thanh toán QR tiện lợi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/chat">
                <Button size="lg" className="group">
                  Bắt đầu trò chuyện
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Xem bảng giá
              </Button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageSquareText size={24} className="text-primary" />
                </div>
                <p className="text-sm font-medium">Đa mô hình AI</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap size={24} className="text-primary" />
                </div>
                <p className="text-sm font-medium">Streaming thời gian thực</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} className="text-primary" />
                </div>
                <p className="text-sm font-medium">Bảo mật cao</p>
              </div>
            </div>
          </div>

          {/* Right Content - Demo Chat */}
          <div className="relative animate-fade-in">
            <div className="absolute -inset-4 gradient-purple rounded-3xl opacity-20 blur-xl animate-pulse-slow" />
            
            <Card className="relative glass-morphism p-6 space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-border">
                <div className="w-10 h-10 gradient-purple rounded-full flex items-center justify-center">
                  <MessageSquareText size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">pho.chat AI</h3>
                  <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                </div>
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Demo Messages */}
              <div className="space-y-4 h-64 overflow-y-auto">
                <div className="flex space-x-3">
                  <Image
                    src="https://i.pravatar.cc/32?img=1"
                    alt="User avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2 max-w-xs">
                    <p className="text-sm">Xin chào! Bạn có thể giúp tôi viết một email chuyên nghiệp không?</p>
                  </div>
                </div>

                <div className="flex space-x-3 justify-end">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                    <p className="text-sm">Chào bạn! Tôi rất sẵn lòng giúp bạn viết email chuyên nghiệp. Bạn có thể cho tôi biết:</p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Mục đích của email</li>
                      <li>• Người nhận là ai</li>
                      <li>• Nội dung chính cần truyền đạt</li>
                    </ul>
                  </div>
                  <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center">
                    <MessageSquareText size={16} className="text-white" />
                  </div>
                </div>

                {isTyping && (
                  <div className="flex space-x-3 justify-end">
                    <div className="bg-primary/20 rounded-2xl rounded-tr-sm px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                    <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center">
                      <MessageSquareText size={16} className="text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Demo Input */}
              <form onSubmit={handleDemoSubmit} className="flex space-x-2">
                <Input
                  value={demoMessage}
                  onChange={(e) => setDemoMessage(e.target.value)}
                  placeholder="Thử hỏi gì đó..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isTyping}>
                  <ArrowRight size={16} />
                </Button>
              </form>
            </Card>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-purple-primary/20 rounded-full animate-float" />
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-secondary/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}