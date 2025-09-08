"use client";

import { Navigation } from '@/components/ui/navigation';
import { HeroSection } from '@/components/ui/hero-section';
import { FeaturesSection } from '@/components/ui/features-section';
import { PricingSection } from '@/components/ui/pricing-section';
import { Footer } from '@/components/ui/footer';
import { SettingsPage } from '@/components/ui/settings-page';
import { EnhancedChat } from '@/components/ui/enhanced-chat';
import { ComponentsShowcase } from '@/components/ui/components-showcase';
import { mockRootProps } from '@/app/settingsMockData';
import { SubscriptionTier } from '@/lib/enums';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import * as React from 'react';

const DEMO_MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini", isPro: false },
  { id: "gpt-4o", label: "GPT-4o", isPro: true },
  { id: "claude-3-sonnet", label: "Claude 3.5 Sonnet", isPro: true },
];

const DEMO_SESSION = {
  id: "demo-session",
  title: "Demo Chat Session",
  messages: [
    {
      id: "1",
      role: "user" as const,
      content: "Xin chào! Bạn có thể giúp tôi viết một email chuyên nghiệp không?",
      timestamp: new Date()
    },
    {
      id: "2", 
      role: "assistant" as const,
      content: "Chào bạn! Tôi rất sẵn lòng giúp bạn viết email chuyên nghiệp. Để tôi có thể hỗ trợ bạn tốt nhất, bạn có thể cho tôi biết:\n\n• Mục đích của email\n• Người nhận là ai\n• Nội dung chính cần truyền đạt\n• Tone của email (trang trọng, thân thiện, v.v.)\n\nVới thông tin này, tôi sẽ giúp bạn tạo ra một email chuyên nghiệp và hiệu quả.",
      timestamp: new Date()
    }
  ],
  model: "gpt-4o",
  createdAt: new Date()
};

export default function PhoChatPreview() {
  const [activeDemo, setActiveDemo] = React.useState("landing");
  
  const handleUpdateProfile = async (data: any) => {
    console.log('Demo: Updating profile:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleUpdatePreferences = async (preferences: any) => {
    console.log('Demo: Updating preferences:', preferences);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleSendMessage = (content: string) => {
    console.log('Demo: Sending message:', content);
  };

  const handleNewSession = () => {
    console.log('Demo: Creating new session');
  };

  const handleModelChange = (modelId: string) => {
    console.log('Demo: Changing model to:', modelId);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="md:ml-64">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-4">pho.chat Preview</h1>
            <p className="text-muted-foreground mb-6">
              Comprehensive Vietnamese AI chat assistant with modern design, i18n support, and enhanced features.
            </p>
            
            <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="landing">Landing Page</TabsTrigger>
                <TabsTrigger value="chat">Enhanced Chat</TabsTrigger>
                <TabsTrigger value="settings">Settings Page</TabsTrigger>
                <TabsTrigger value="components">UI Components</TabsTrigger>
              </TabsList>

              <TabsContent value="landing" className="mt-8">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Modern Landing Page</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Perplexity-inspired design with Vietnamese localization, glassmorphism effects, and modern animations.
                    </p>
                    <div className="space-y-2">
                      <Badge variant="outline">Hero Section with Interactive Demo</Badge>
                      <Badge variant="outline">Features Showcase</Badge>
                      <Badge variant="outline">Vietnamese QR Payment Integration</Badge>
                      <Badge variant="outline">Mobile-First Responsive Design</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="border rounded-lg overflow-hidden">
                  <HeroSection />
                  <FeaturesSection />
                  <PricingSection />
                </div>
              </TabsContent>

              <TabsContent value="chat" className="mt-8">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Enhanced Chat Interface</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Modern chat interface with glassmorphism, real-time streaming, and Vietnamese language support.
                    </p>
                    <div className="space-y-2">
                      <Badge variant="outline">Multi-Model Selection</Badge>
                      <Badge variant="outline">Real-time Streaming</Badge>
                      <Badge variant="outline">Theme & Language Toggle</Badge>
                      <Badge variant="outline">Mobile Optimized</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="border rounded-lg overflow-hidden h-[600px]">
                  <EnhancedChat
                    currentSession={DEMO_SESSION}
                    availableModels={DEMO_MODELS}
                    userTier={SubscriptionTier.PRO}
                    isStreaming={false}
                    onSendMessage={handleSendMessage}
                    onNewSession={handleNewSession}
                    onModelChange={handleModelChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-8">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Comprehensive Settings Page</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Complete user settings with profile management, preferences, subscription, and billing history.
                    </p>
                    <div className="space-y-2">
                      <Badge variant="outline">Profile Management</Badge>
                      <Badge variant="outline">Theme & Language Settings</Badge>
                      <Badge variant="outline">Subscription Management</Badge>
                      <Badge variant="outline">Billing History</Badge>
                      <Badge variant="outline">Privacy Controls</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="border rounded-lg overflow-hidden">
                  <SettingsPage
                    user={mockRootProps.user}
                    subscription={mockRootProps.subscription}
                    preferences={mockRootProps.preferences}
                    billingHistory={mockRootProps.billingHistory}
                    onUpdateProfile={handleUpdateProfile}
                    onUpdatePreferences={handleUpdatePreferences}
                  />
                </div>
              </TabsContent>

              <TabsContent value="components" className="mt-8">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Complete UI Component Library</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Interactive showcase of all shadcn/ui components with Vietnamese localization and theme integration.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Badge variant="outline">Table</Badge>
                      <Badge variant="outline">Form</Badge>
                      <Badge variant="outline">Dialog</Badge>
                      <Badge variant="outline">Sheet</Badge>
                      <Badge variant="outline">Toast</Badge>
                      <Badge variant="outline">Alert</Badge>
                      <Badge variant="outline">Progress</Badge>
                      <Badge variant="outline">Checkbox</Badge>
                      <Badge variant="outline">Switch</Badge>
                      <Badge variant="outline">Tabs</Badge>
                      <Badge variant="outline">Badge</Badge>
                      <Badge variant="outline">Avatar</Badge>
                      <Badge variant="outline">Separator</Badge>
                      <Badge variant="outline">Label</Badge>
                      <Badge variant="outline">Skeleton</Badge>
                      <Badge variant="outline">Tooltip</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="border rounded-lg overflow-hidden">
                  <ComponentsShowcase />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}