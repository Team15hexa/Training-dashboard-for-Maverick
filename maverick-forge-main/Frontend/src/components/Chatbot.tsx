import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  Sparkles, 
  Lightbulb, 
  BookOpen, 
  Target, 
  Heart,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";
import geminiService from "@/services/geminiService";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  reactions?: {
    thumbsUp: number;
    thumbsDown: number;
    heart: number;
  };
  isTyping?: boolean;
}

interface QuickAction {
  id: string;
  text: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ChatbotProps {
  className?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! 🌟 I'm your personal AI mentor, here to inspire and guide you on your amazing software engineering journey!",
      sender: 'bot',
      timestamp: new Date(),
      reactions: { thumbsUp: 0, thumbsDown: 0, heart: 0 }
    },
    {
      id: 2,
      text: "I'm here to motivate you, help you develop skills, and celebrate your progress! Ask me about coding challenges, skill development, motivation, or anything that will help you grow as a developer! 🚀",
      sender: 'bot',
      timestamp: new Date(),
      reactions: { thumbsUp: 0, thumbsDown: 0, heart: 0 }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'motivation',
      text: 'Need Motivation',
      icon: Sparkles,
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'skills',
      text: 'Skill Development',
      icon: Target,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'coding',
      text: 'Coding Help',
      icon: BookOpen,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'tips',
      text: 'Career Tips',
      icon: Lightbulb,
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = async (callback: () => void) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    setIsTyping(false);
    callback();
  };

  const handleQuickAction = async (action: QuickAction) => {
    const actionMessages = {
      motivation: "I need some motivation to keep going with my learning journey. Can you help me stay motivated?",
      skills: "I want to develop my technical skills. What should I focus on next?",
      coding: "I'm stuck with a coding problem. Can you help me understand this better?",
      tips: "I want some career advice for software engineering. What tips do you have?"
    };

    const userMessage: Message = {
      id: Date.now(),
      text: actionMessages[action.id as keyof typeof actionMessages],
      sender: 'user',
      timestamp: new Date(),
      reactions: { thumbsUp: 0, thumbsDown: 0, heart: 0 }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    await simulateTyping(async () => {
      try {
        const botResponseText = await geminiService.generateResponse(userMessage.text);
        
        const botResponse: Message = {
          id: Date.now() + 1,
          text: botResponseText,
          sender: 'bot',
          timestamp: new Date(),
          reactions: { thumbsUp: 0, thumbsDown: 0, heart: 0 }
        };
        
        setMessages(prev => [...prev, botResponse]);
      } catch (error) {
        console.error('Error getting bot response:', error);
        
        const fallbackResponse: Message = {
          id: Date.now() + 1,
          text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          sender: 'bot',
          timestamp: new Date(),
          reactions: { thumbsUp: 0, thumbsDown: 0, heart: 0 }
        };
        
        setMessages(prev => [...prev, fallbackResponse]);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
      reactions: { thumbsUp: 0, thumbsDown: 0, heart: 0 }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowQuickActions(false);

    await simulateTyping(async () => {
      try {
        const botResponseText = await geminiService.generateResponse(userMessage.text);
        
        const botResponse: Message = {
          id: Date.now() + 1,
          text: botResponseText,
          sender: 'bot',
          timestamp: new Date(),
          reactions: { thumbsUp: 0, thumbsDown: 0, heart: 0 }
        };
        
        setMessages(prev => [...prev, botResponse]);
      } catch (error) {
        console.error('Error getting bot response:', error);
        
        const fallbackResponse: Message = {
          id: Date.now() + 1,
          text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          sender: 'bot',
          timestamp: new Date(),
          reactions: { thumbsUp: 0, thumbsDown: 0, heart: 0 }
        };
        
        setMessages(prev => [...prev, fallbackResponse]);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const handleReaction = (messageId: number, reaction: 'thumbsUp' | 'thumbsDown' | 'heart') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: { ...msg.reactions!, [reaction]: (msg.reactions?.[reaction] || 0) + 1 } }
        : msg
    ));
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {/* Floating Chat Button */}
      {!isOpen && !isMinimized && (
        <Button
          onClick={toggleChat}
          size="lg"
          className="rounded-full w-16 h-16 shadow-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white border-4 border-white animate-pulse"
          style={{ zIndex: 9999 }}
        >
          <MessageCircle className="w-8 h-8" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-96 h-[500px] shadow-2xl border-0 bg-white">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <CardTitle className="text-lg">AI Mentor</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={minimizeChat}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChat}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit text-xs">
              {geminiService.isApiAvailable() ? 'AI Online' : 'Offline Mode'}
            </Badge>
          </CardHeader>

          <CardContent className="p-0 h-[400px] flex flex-col">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 group",
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className="relative">
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <div className="whitespace-pre-wrap">{message.text}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      {/* Message Actions */}
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1 bg-white rounded-full shadow-lg p-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyMessage(message.text)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          {message.sender === 'bot' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => handleReaction(message.id, 'thumbsUp')}
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => handleReaction(message.id, 'heart')}
                              >
                                <Heart className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {showQuickActions && messages.length <= 2 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground text-center">Quick Actions:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <Button
                            key={action.id}
                            onClick={() => handleQuickAction(action)}
                            className={cn("text-xs h-8", action.color)}
                            disabled={isLoading}
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            {action.text}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1"
                  disabled={isLoading || isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading || isTyping}
                  size="sm"
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Minimized Chat */}
      {isMinimized && (
        <Card className="w-80 shadow-xl border-0 bg-white">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <CardTitle className="text-lg">AI Mentor</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChat}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default Chatbot; 