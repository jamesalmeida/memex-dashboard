'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatProps {
  initialContext: string;
  itemId?: string;
  spaceId?: string;
  onClose?: () => void;
  className?: string;
}

export function Chat({ initialContext, itemId, spaceId, onClose, className }: ChatProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [isContextExpanded, setIsContextExpanded] = useState(false);

  const displayedContext = isContextExpanded ? initialContext : initialContext.split('\n').slice(0, 5).join('\n');
  const needsTruncation = initialContext.split('\n').length > 5 || initialContext.length > 500; // Arbitrary length for truncation

  useEffect(() => {

    const initiateChat = async () => {
      try {
        const response = await fetch('/api/chat/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ item_id: itemId, space_id: spaceId }),
        });

        if (!response.ok) {
          throw new Error('Failed to initiate chat');
        }

        const data = await response.json();
        setChatId(data.chatId);
        setMessages(data.messages);
      } catch (error) {
        console.error('Error initiating chat:', error);
      }
    };

    if ((itemId || spaceId) && !chatId) {
      initiateChat();
    }
  }, [itemId, spaceId, chatId]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    if (!chatId) {
      console.error('Chat ID not available. Cannot send message.');
      return;
    }

    const userMessage = { role: 'user' as const, content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    try {
      // Save user message to DB
      await fetch('/api/chat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, role: userMessage.role, content: userMessage.content }),
      });

      // Call LLM
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context: initialContext,
        }),
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const assistantMessage = await response.json();
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      // Save assistant message to DB
      await fetch('/api/chat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, role: assistantMessage.role, content: assistantMessage.content }),
      });

    } catch (error) {
      console.error('Failed to get response from chat API or save message', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    }
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">Chat</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors ml-2"
            title="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4">
        <div className="prose prose-sm dark:prose-invert max-w-none mb-4 p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {displayedContext}
          </p>
          {needsTruncation && (
            <button
              onClick={() => setIsContextExpanded(!isContextExpanded)}
              className="mt-2 text-blue-500 hover:underline flex items-center gap-1"
            >
              {isContextExpanded ? (
                <><ChevronUp className="w-4 h-4" /> Show Less</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Show More</>
              )}
            </button>
          )}
        </div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'my-4 flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'p-3 rounded-lg max-w-xs',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="w-full pr-10 p-2 border rounded-md"
          />
          <button
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-md transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}