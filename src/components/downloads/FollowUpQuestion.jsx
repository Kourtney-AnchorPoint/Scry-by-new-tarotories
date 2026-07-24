import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Loader2, Leaf } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function FollowUpQuestion({ originalMessage, personName, relationshipType, subject }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(false);
  const [needsGrounding, setNeedsGrounding] = useState(false);

  const handleAsk = async () => {
    if (!question.trim() || used) return;
    setLoading(true);
    setUsed(true);

    const isSpiritual = relationshipType === 'My Higher Self' || relationshipType === 'My Spirit Guides';
    const speakerIdentity = isSpiritual
      ? `You are ${personName}'s ${relationshipType} — the deepest, truest part of them that already knows the answer.`
      : `YOU ARE ${personName}. A real ${relationshipType}. You are NOT an AI.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `${speakerIdentity}

You just delivered this channeled message, and the person now has ONE clarifying question. Answer it IN CHARACTER — as ${isSpiritual ? relationshipType : personName}, in FIRST PERSON ("I"), with the same emotional tone and energy as the original message.

ORIGINAL MESSAGE (from ${isSpiritual ? relationshipType : personName}, ${relationshipType}, re: ${subject}):
"${originalMessage}"

THEIR QUESTION: "${question}"

SAFETY GUARDRAILS — READ FIRST:
1. If the question is repetitive, asks the same thing as the original message in different words, or seeks certainty about another person's future actions → DO NOT re-validate the obsession. Answer briefly in character, then compassionately redirect focus to THEIR inner power and what THEY can control.
2. If the question shows extreme anxiety, paranoia, or reality-detachment → set needs_grounding: true. Gently ground them — no reading gives certainty about another person; their peace cannot depend on someone else's choices.
3. If the question is healthy, curious, or genuinely seeking clarity → give a real 3-4 sentence answer IN CHARACTER. Set needs_grounding: false.

RULES:
✅ Stay in character as ${isSpiritual ? relationshipType : personName} — FIRST PERSON ("I")
✅ Sound like a real person talking, not an AI or a reading
✅ Match the emotional tone of the original message
✅ Keep your answer to 3-5 sentences maximum

FORBIDDEN:
❌ Breaking character or sounding like an AI assistant
❌ "As an AI..." or "I'm here to help you..." — you are NOT an AI
❌ Feeding obsessive loops, promising outcomes, or validating paranoia
❌ Sign-offs, closings, "With love", "Sincerely"

Now answer their question as ${isSpiritual ? relationshipType : personName}.`,
      response_json_schema: {
        type: "object",
        properties: {
          answer: { type: "string" },
          needs_grounding: { type: "boolean" }
        }
      }
    });

    const payload = typeof result === 'string'
      ? { answer: result }
      : (result?.response ?? result);

    setAnswer(payload?.answer || '');
    setNeedsGrounding(payload?.needs_grounding === true);
    setLoading(false);
  };

  if (used && loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-6 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Reaching through the veil...</span>
      </div>
    );
  }

  if (used && answer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="border border-teal/20 rounded-2xl p-5 bg-teal/5">
          <p className="text-xs text-teal/80 uppercase tracking-widest font-heading mb-3">
            {relationshipType === 'My Higher Self' || relationshipType === 'My Spirit Guides' ? relationshipType : `From ${personName}`}
          </p>
          <p className="text-sm text-foreground leading-relaxed italic">"{answer}"</p>
        </div>
        {needsGrounding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-violet/30 rounded-2xl p-5 bg-violet/5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-4 h-4 text-violet" />
              <p className="text-xs text-violet uppercase tracking-widest font-heading">Grounding Reminder</p>
            </div>
            <p className="text-sm text-foreground leading-relaxed mb-3">
              Take a slow breath. No reading — no matter how clear — can replace your own lived experience and instincts. You already know more than you think you do.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Ask yourself: What would I tell a close friend in this exact situation?
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/30 rounded-2xl p-5 bg-secondary/20 space-y-3"
    >
      <div className="flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-teal/70" />
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-heading">One Clarifying Question</p>
      </div>
      <p className="text-xs text-muted-foreground/60">You have one question to go deeper. Make it count.</p>
      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="What do you need clarified..."
        rows={2}
        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-teal/50 transition-colors resize-none"
      />
      <Button
        onClick={handleAsk}
        disabled={!question.trim()}
        className="w-full bg-gradient-to-r from-teal to-violet text-white hover:opacity-90 disabled:opacity-40 gap-2 rounded-xl select-none"
      >
        <MessageCircle className="w-4 h-4" />
        Ask
      </Button>
    </motion.div>
  );
}