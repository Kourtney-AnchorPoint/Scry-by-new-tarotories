import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PenLine, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOODS = [
  { key: 'grateful', emoji: '🙏', label: 'Grateful' },
  { key: 'hopeful', emoji: '✨', label: 'Hopeful' },
  { key: 'peaceful', emoji: '🌿', label: 'Peaceful' },
  { key: 'energized', emoji: '⚡', label: 'Energized' },
  { key: 'reflective', emoji: '🌙', label: 'Reflective' },
  { key: 'confused', emoji: '🌀', label: 'Confused' },
  { key: 'heavy', emoji: '🌧️', label: 'Heavy' },
  { key: 'unsettled', emoji: '🔥', label: 'Unsettled' },
];

export default function ReflectionEditor({ onSave, saving }) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onSave({ content: content.trim(), mood, title: title.trim() });
    setContent('');
    setMood('');
    setTitle('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 sm:p-6 mb-8 border border-violet/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <PenLine className="w-4 h-4 text-violet" />
        <h2 className="font-heading text-sm font-semibold text-foreground">Today's Reflection</h2>
      </div>

      {/* Optional title */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Give this entry a title... (optional)"
        className="w-full bg-secondary/30 border border-border/40 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-violet/50 transition-colors mb-3"
      />

      {/* Text area */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What came up for you today? What are you carrying? What do you want to release?..."
        rows={5}
        className="w-full bg-secondary/30 border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-violet/50 transition-colors resize-none leading-relaxed"
      />

      {/* Mood selector */}
      <div className="mt-3 mb-4">
        <p className="text-xs text-muted-foreground mb-2">How are you feeling?</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <button
              key={m.key}
              onClick={() => setMood(mood === m.key ? '' : m.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                mood === m.key
                  ? 'bg-violet/20 border-violet/50 text-foreground'
                  : 'bg-secondary/30 border-border/30 text-muted-foreground hover:border-violet/30'
              }`}
            >
              <span>{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!content.trim() || saving}
        className="w-full bg-gradient-to-r from-violet to-primary text-white hover:opacity-90 gap-2 disabled:opacity-40"
      >
        <Send className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Reflection'}
      </Button>
    </motion.div>
  );
}