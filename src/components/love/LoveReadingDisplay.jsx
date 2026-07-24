import React from 'react';
import { motion } from 'framer-motion';
import { Save, Check, Share2, RotateCcw, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoveReadingDisplay({
  reading, spreadName, personName, isChanneled,
  saved, saving, shared, onSave, onShare, onReset
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 mt-8"
    >
      <p className="text-foreground italic text-center leading-relaxed">{reading.opening}</p>

      {/* Card Readings */}
      <div className="space-y-4">
        {reading.card_readings?.map((cr, i) => (
          <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border/30">
            <h4 className="font-heading text-sm font-semibold text-primary mb-1">{cr.position}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{cr.interpretation}</p>
          </div>
        ))}
      </div>

      {/* Synthesis — channeled in first person */}
      <div className="border-t border-border/30 pt-6">
        {isChanneled ? (
          <div className="border border-teal/20 rounded-2xl p-5 bg-teal/5">
            <p className="text-xs text-teal uppercase tracking-widest mb-3 font-heading">
              {personName ? `Message from ${personName}` : 'Their Message'}
            </p>
            <p className="text-sm text-foreground leading-relaxed italic">"{reading.synthesis}"</p>
          </div>
        ) : (
          <>
            <h4 className="font-heading text-sm font-semibold text-teal mb-2">The Full Picture</h4>
            <p className="text-sm text-foreground leading-relaxed">{reading.synthesis}</p>
          </>
        )}
      </div>

      <p className="text-center text-sm text-teal-light italic">{reading.closing}</p>

      {/* Visual Omens */}
      {reading.visual_omens?.length > 0 && (
        <div className="border border-violet/20 rounded-2xl p-5 bg-violet/5">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-violet" />
            <h4 className="font-heading text-sm font-semibold text-violet-light">Watch For These Signs</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Confirmation that this reading is accurate — look for these in the next 24-48 hours:</p>
          <div className="space-y-2">
            {reading.visual_omens.map((omen, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-violet text-sm mt-0.5">◆</span>
                <p className="text-sm text-foreground">{omen}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Love Homework */}
      {(reading.love_homework || reading.heart_affirmation) && (
        <div className="border border-pink/20 rounded-2xl p-5 bg-pink/5">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-pink" />
            <h4 className="font-heading text-sm font-semibold text-pink">Love Homework 💕</h4>
          </div>
          {reading.love_homework && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Do This Today</p>
              <p className="text-sm text-foreground font-medium">{reading.love_homework}</p>
            </div>
          )}
          {reading.heart_affirmation && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Affirmation</p>
              <p className="text-sm text-pink italic">"{reading.heart_affirmation}"</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Button
          onClick={onSave}
          disabled={saved || saving}
          variant="outline"
          className={`gap-2 border-border/50 ${saved ? 'text-teal border-teal/40' : ''}`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Reading'}
        </Button>
        <Button
          onClick={onShare}
          variant="outline"
          className={`gap-2 border-border/50 ${shared ? 'text-teal border-teal/40' : ''}`}
        >
          {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {shared ? 'Copied!' : 'Share'}
        </Button>
        <Button onClick={onReset} variant="outline" className="gap-2 border-border/50">
          <RotateCcw className="w-4 h-4" />
          New Reading
        </Button>
      </div>
    </motion.div>
  );
}