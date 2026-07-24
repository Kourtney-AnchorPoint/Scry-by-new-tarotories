import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RELATIONSHIP_TYPES = [
  { value: 'romantic partner', label: '💕 Romantic Partner' },
  { value: 'ex partner', label: '💔 Ex Partner' },
  { value: 'situationship', label: '😅 Situationship' },
  { value: 'crush or new connection', label: '✨ Crush / New Connection' },
  { value: 'spouse or long-term partner', label: '💍 Spouse / Long-Term' },
  { value: 'family member', label: '👨‍👩‍👧 Family Member' },
  { value: 'friend', label: '🤝 Close Friend' },
];

export default function LoveContextForm({ onSubmit, onBack }) {
  const [personName, setPersonName] = useState('');
  const [relationshipType, setRelationshipType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ personName: personName.trim(), relationshipType });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto space-y-6"
    >
      <div className="text-center">
        <Heart className="w-8 h-8 text-teal mx-auto mb-3" />
        <h3 className="font-heading text-xl font-semibold mb-1">Who is this about?</h3>
        <p className="text-sm text-muted-foreground">
          Help the cards understand the connection so the reading is specific to your situation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Their name or nickname (optional)</label>
          <input
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="e.g. Marcus, or just 'Him'"
            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-teal/50 transition-colors text-sm"
          />
        </div>

        {/* Relationship type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">What is your relationship?</label>
          <div className="grid grid-cols-1 gap-2">
            {RELATIONSHIP_TYPES.map((rt) => (
              <button
                key={rt.value}
                type="button"
                onClick={() => setRelationshipType(rt.value)}
                className={`px-4 py-3 rounded-xl text-left text-sm transition-all border ${
                  relationshipType === rt.value
                    ? 'bg-teal/20 border-teal/50 text-foreground'
                    : 'bg-secondary/30 border-border/30 text-muted-foreground hover:border-teal/30'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" onClick={onBack} variant="outline" className="gap-2 border-border/50 flex-1">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={!relationshipType}
            className="gap-2 bg-gradient-to-r from-violet to-teal text-white hover:opacity-90 flex-1"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}