"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/components/providers/i18n-provider';
import { useTheme } from '@/components/providers/theme-provider';
import { Language, SubscriptionTier, Theme } from '@/lib/enums';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { MessageSquareText, Send, Plus, Settings, Moon, Sun, Globe, Zap, Copy, Download, StopCircle, Lock } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: Date;
}

interface EnhancedChatProps {
  currentSession?: ChatSession;
  availableModels: Array<{ id: string; label: string; isPro?: boolean }>;
  userTier: SubscriptionTier;
  isStreaming?: boolean;
  streamingText?: string;
  onSendMessage: (content: string) => void;
  onNewSession: () => void;
  onModelChange: (modelId: string) => void;
  onStopStreaming?: () => void;
  modelInfo?: string;
}

export function EnhancedChat({
  currentSession,
  availableModels,
  userTier,
  isStreaming = false,
  streamingText = '',
  onSendMessage,
  onNewSession,
  onModelChange,
  onStopStreaming,
  modelInfo,
}: EnhancedChatProps) {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme, actualTheme } = useTheme();
  const toast = useToast();
  const [input, setInput] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, streamingText]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === Language.VIETNAMESE ? Language.ENGLISH : Language.VIETNAMESE);
  };

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? Theme.LIGHT : Theme.DARK);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <Card className="glass-morphism border-b rounded-none">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center">
                  <MessageSquareText size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-gradient">pho.chat</h1>
              </div>

              {currentSession && (
                <Badge variant="outline" className="hidden md:flex">
                  {currentSession.title}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Model Selector */}
              <Select
                value={currentSession?.model || availableModels[0]?.id}
                onValueChange={(val) => {
                  const selected = availableModels.find((m) => m.id === val);
                  if (selected?.isPro && userTier === SubscriptionTier.FREE) {
                    // Show toast and do not change model
                    const msg = language === Language.VIETNAMESE
                      ? 'Mô hình này yêu cầu gói Pro. Nâng cấp để sử dụng.'
                      : 'This model requires a Pro plan. Upgrade to use it.';
                    try { toast.error(msg, 2200); } catch {}
                    return;
                  }
                  onModelChange(val);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={language === Language.VIETNAMESE ? 'Chọn mô hình' : 'Select model'} />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      disabled={model.isPro && userTier === SubscriptionTier.FREE}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center gap-1">
                          {model.isPro && userTier === SubscriptionTier.FREE ? <Lock size={12} className="opacity-70" /> : null}
                          {model.label}
                        </span>
                        {model.isPro && (
                          <Badge variant={userTier === SubscriptionTier.FREE ? 'outline' : 'secondary'} className="text-xs">Pro</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}




                </SelectContent>
              </Select>

              {/* Model info tooltip */}
              {modelInfo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center text-xs text-muted-foreground cursor-help select-none">
                      <Zap size={14} className="mr-1" />
                      Info
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs text-xs whitespace-pre-wrap">{modelInfo}</div>
                  </TooltipContent>
                </Tooltip>
              )}
              {userTier === SubscriptionTier.FREE && (
                <button type="button" onClick={() => setUpgradeOpen(true)} className="text-xs text-blue-600 underline ml-2">
                  Upgrade to unlock all models
                </button>
              )}

              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {actualTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </Button>

              {/* Language Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleLanguage}>
                <Globe size={18} />
              </Button>

              {/* New Session */}
              <Button onClick={onNewSession} className="hidden md:flex">
                <Plus size={16} className="mr-2" />
                {language === Language.VIETNAMESE ? 'Cuộc trò chuyện mới' : 'New Chat'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-6 space-y-6">
          {!currentSession?.messages.length && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-16 h-16 gradient-purple rounded-2xl flex items-center justify-center animate-pulse-slow">
                <MessageSquareText size={32} className="text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gradient">
                  {language === Language.VIETNAMESE
                    ? 'Chào mừng đến với pho.chat!'
                    : 'Welcome to pho.chat!'
                  }
                </h2>
                <p className="text-muted-foreground max-w-md">
                  {language === Language.VIETNAMESE
                    ? 'Bắt đầu cuộc trò chuyện với AI thông minh nhất được tối ưu cho tiếng Việt.'
                    : 'Start a conversation with the smartest AI optimized for Vietnamese.'
                  }
                </p>
              </div>
            </div>
          )}


      {/* Upgrade modal (outside Select for clarity) */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
            <DialogDescription>
              Unlock premium AI models and higher limits.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm space-y-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>Access GPT-4o, o3-mini, and Claude Sonnet</li>
              <li>Higher daily/monthly usage limits</li>
              <li>Priority performance</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setUpgradeOpen(false)}>
              Not now
            </Button>
            <Button asChild>
              <Link href="/checkout">Go to checkout</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {currentSession?.messages.map((message) => (
            <div key={message.id} className="flex space-x-4">
              {message.role === 'user' ? (
                <>
                  <div className="flex-1" />
                  <div className="max-w-[70%] space-y-2">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex justify-end">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="https://i.pravatar.cc/32?img=1" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex space-x-4 max-w-[85%]">
                  <Avatar className="w-8 h-8 mt-1">
                    <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center">
                      <MessageSquareText size={16} className="text-white" />
                    </div>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="glass-morphism rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-8 px-2"
                      >
                        <Copy size={14} className="mr-1" />
                        {language === Language.VIETNAMESE ? 'Sao chép' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Streaming Message */}
          {isStreaming && streamingText && (
            <div className="flex space-x-4 max-w-[85%]">
              <Avatar className="w-8 h-8 mt-1">
                <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center">
                  <MessageSquareText size={16} className="text-white" />
                </div>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="glass-morphism rounded-2xl rounded-tl-sm px-4 py-3">
                  <p className="whitespace-pre-wrap">{streamingText}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <Card className="glass-morphism border-t rounded-none">
        <CardContent className="p-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1 space-y-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  language === Language.VIETNAMESE
                    ? 'Nhập tin nhắn của bạn...'
                    : 'Type your message...'
                }
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isStreaming}
              />

              {userTier === SubscriptionTier.FREE && (
                <p className="text-xs text-muted-foreground">
                  {language === Language.VIETNAMESE
                    ? 'Gói miễn phí: Giới hạn 600 tin nhắn/tháng'
                    : 'Free tier: Limited to 600 messages/month'
                  }
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              {isStreaming && onStopStreaming && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={onStopStreaming}
                >
                  <StopCircle size={20} />
                </Button>
              )}

              <Button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="gradient-purple text-white"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>
                {language === Language.VIETNAMESE
                  ? 'Enter để gửi • Shift+Enter xuống dòng'
                  : 'Enter to send • Shift+Enter for new line'
                }
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {userTier === SubscriptionTier.PRO ? 'Pro' : 'Free'}
              </Badge>
              {currentSession && (
                <span>
                  {currentSession.messages.length} {language === Language.VIETNAMESE ? 'tin nhắn' : 'messages'}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}