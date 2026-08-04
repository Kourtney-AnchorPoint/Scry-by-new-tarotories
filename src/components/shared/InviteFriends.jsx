import React, { useState } from 'react';
import { UserPlus, Share2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/shared/GlassCard';

const SHARE_TEXT = `✨ I've been using SCRY — channeled messages, tarot, and intuitive guidance that are scarily accurate. Come explore with me:`;

const APP_URL = 'https://cosmiccommand.base44.app';

export default function InviteFriends() {
  const [copied, setCopied] = useState(false);

  const fullShareText = `${SHARE_TEXT} ${APP_URL}`;

  const handleInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cosmic Encounters',
          text: SHARE_TEXT,
          url: APP_URL,
        });
      } catch {
        // user cancelled — no action needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullShareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // fallback
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <GlassCard className="mb-4" glow="violet">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-violet/20 flex items-center justify-center">
          <UserPlus className="w-4 h-4 text-violet" />
        </div>
        <div>
          <h3 className="font-heading text-sm font-semibold text-foreground">Invite Friends</h3>
          <p className="text-xs text-muted-foreground">Share the magic — spread the cosmic word.</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handleInvite}
          className="flex-1 gap-2 bg-gradient-to-r from-violet to-teal text-white hover:opacity-90 select-none min-h-[44px]"
        >
          <Share2 className="w-4 h-4" />
          Share Cosmic Encounters
        </Button>
        <Button
          onClick={handleCopy}
          variant="outline"
          className="gap-2 border-border/50 select-none min-h-[44px]"
        >
          {copied ? <Check className="w-4 h-4 text-teal" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </GlassCard>
  );
}
