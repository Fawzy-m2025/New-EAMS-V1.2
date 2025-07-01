
import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User, Bot, ChevronDown, X } from 'lucide-react';
import { Message, ChatSession } from '@/types/chat';
import { generateResponse, formatMessageContent } from '@/utils/chatUtils';
import { Textarea } from "@/components/ui/textarea";

interface ChatAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ open, onOpenChange }) => {
  const [input, setInput] = useState('');
  const [session, setSession] = useState<ChatSession>({
    messages: [],
    context: { topics: [] }
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContentRef = useRef<HTMLDivElement | null>(null);

  // Scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [session.messages, open]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    
    // Add user message to the session
    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
    
    // Clear input
    setInput('');
    
    // Show typing indicator
    setIsTyping(true);
    
    // Generate AI response after delay to simulate thinking
    setTimeout(() => {
      // Generate AI response based on user message and conversation context
      const aiMessage = generateResponse(
        userMessage.content, 
        session.messages
      );
      
      // Add AI message to session
      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        context: {
          topics: [...(prev.context?.topics || [])]
        }
      }));
      
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setSession({
      messages: [],
      context: { topics: [] }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <SheetTitle className="text-xl">Financial Assistant</SheetTitle>
              <SheetDescription className="text-sm">
                Get insights and ask questions about your financial data
              </SheetDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full" 
              onClick={clearChat}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div 
          ref={chatContentRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {session.messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="mx-auto h-8 w-8 mb-2" />
              <p>Ask me anything about your financial data.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 max-w-sm mx-auto">
                <Button 
                  variant="outline" 
                  className="text-xs justify-start h-auto py-2" 
                  onClick={() => setInput("What's our current revenue?")}
                >
                  What's our current revenue?
                </Button>
                <Button 
                  variant="outline" 
                  className="text-xs justify-start h-auto py-2" 
                  onClick={() => setInput("Show expense breakdown")}
                >
                  Show expense breakdown
                </Button>
                <Button 
                  variant="outline" 
                  className="text-xs justify-start h-auto py-2" 
                  onClick={() => setInput("What are our current trends?")}
                >
                  What are our current trends?
                </Button>
                <Button 
                  variant="outline" 
                  className="text-xs justify-start h-auto py-2"
                  onClick={() => setInput("Give me a financial summary")}
                >
                  Give me a financial summary
                </Button>
              </div>
            </div>
          )}

          {session.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="text-xs opacity-70">
                    {msg.role === 'assistant' ? 'Assistant' : 'You'}
                  </span>
                </div>
                <div 
                  className="text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMessageContent(msg.content) 
                  }}
                />
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted max-w-[80%] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4" />
                  <span className="text-xs opacity-70">Assistant</span>
                </div>
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about financial data..."
              className="min-h-[60px] max-h-[120px] resize-none"
              rows={2}
            />
            <Button
              className="shrink-0 self-end"
              size="icon"
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
