import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Moon } from 'lucide-react';
import GuideMessageBubble from './GuideMessageBubble';

const AGENT_NAME = 'luna_guide';

export default function GuideChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function init() {
      try {
        const conversations = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        let conv = conversations?.[0];
        if (!conv) {
          conv = await base44.agents.createConversation({
            agent_name: AGENT_NAME,
            metadata: { name: 'Guidance with Luna', description: 'Your cosmic guide' },
          });
        } else {
          conv = await base44.agents.getConversation(conv.id);
        }
        setConversation(conv);
        setMessages(conv.messages || []);
      } catch {
        // chat will show the empty state; user can retry by reopening
      }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !conversation) return;
    setInput('');
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
    } catch {
      setInput(text);
    }
    setSending(false);
  };

  const lastMsg = messages[messages.length - 1];
  const lunaThinking = sending || (lastMsg?.role === 'user');

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-violet" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center pt-10 px-4">
            <Moon className="w-8 h-8 text-violet mx-auto mb-3" />
            <p className="font-heading text-sm text-foreground mb-1">I'm Luna, your cosmic guide.</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ask me what to do next, what a card meant, or where to start. I can see your readings and journal — so ask me anything about your journey.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => <GuideMessageBubble key={i} message={msg} />)
        )}
        {!loading && lunaThinking && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
            <Loader2 className="w-3 h-3 animate-spin text-violet" />
            Luna is tuning in...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border/40">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Luna anything..."
            disabled={loading}
            className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-violet/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || loading}
            className="w-11 h-11 rounded-xl bg-violet/20 border border-violet/30 text-violet flex items-center justify-center hover:bg-violet/30 disabled:opacity-40 transition-colors"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}