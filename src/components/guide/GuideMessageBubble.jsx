import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Loader2, AlertCircle, Check } from 'lucide-react';

function ToolCallRow({ toolCall }) {
  const status = toolCall.status;
  const isActive = ['pending', 'running', 'in_progress'].includes(status);
  const isFailed = status === 'failed' || status === 'error';
  const proj = toolCall.display_projection;
  const label = proj
    ? (isActive ? proj.active_label : isFailed ? proj.error_label : proj.label) || 'Consulting the records'
    : `Looking into ${toolCall.name?.replace(/_/g, ' ')}`;
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
      {isActive ? <Loader2 className="w-3 h-3 animate-spin text-violet" />
        : isFailed ? <AlertCircle className="w-3 h-3 text-destructive" />
        : <Check className="w-3 h-3 text-teal" />}
      <span className="italic">{label}</span>
    </div>
  );
}

export default function GuideMessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-violet/20 border border-violet/25 text-foreground rounded-br-md'
          : 'bg-secondary/70 border border-border/40 text-foreground rounded-bl-md'
      }`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-violet" />
            <span className="text-xs font-heading text-violet">Luna</span>
          </div>
        )}
        {message.content && (
          isUser
            ? <p className="whitespace-pre-wrap">{message.content}</p>
            : <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&_p]:my-1">{message.content}</ReactMarkdown>
        )}
        {message.tool_calls?.map((tc, i) => <ToolCallRow key={i} toolCall={tc} />)}
      </div>
    </div>
  );
}