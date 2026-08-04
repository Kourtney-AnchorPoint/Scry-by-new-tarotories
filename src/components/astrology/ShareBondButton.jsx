import React, { useState } from 'react';
import { Share2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SharedReading } from '@/api/entities';
import { trackEvent } from '@/lib/analytics';
import { useUserProfile } from '@/hooks/useUserProfile';
import { auth } from '@/api/auth';

export default function ShareBondButton({ connection, report, userChartData, connectionChartData }) {
  const { profile, user } = useUserProfile();
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);

  const bigThree = (chart) => ({
    sun: chart?.big_three?.sun?.sign || null,
    moon: chart?.big_three?.moon?.sign || null,
    rising: chart?.big_three?.rising?.sign || null,
  });

  const handleShare = async () => {
    if (!auth.isAuthenticated()) {
      auth.redirectToLogin(window.location.pathname);
      return;
    }
    setSharing(true);
    setShareError(false);
    try {
      const inviterName = profile?.display_name || user?.full_name || 'Someone special';
      const record = await SharedReading.create({
        title: `${inviterName} & ${connection.name}`,
        inviter_name: inviterName,
        connection_name: connection.name,
        report,
        user_big_three: bigThree(userChartData),
        connection_big_three: bigThree(connectionChartData),
      });
      const url = `${window.location.origin}/shared/${record.id}`;
      trackEvent('synastry_share', { bond_tier: report.bond_tier });
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Our Cosmic Bond: ${report.bond_tier}`,
            text: `${inviterName} shared your cosmic bond reading — come see what's between you two ✨`,
            url,
          });
        } catch {
          // user cancelled the share sheet — fall back to clipboard
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      setShareError(true);
    }
    setSharing(false);
  };

  return (
    <div className="text-center">
      <Button
        size="sm"
        onClick={handleShare}
        disabled={sharing}
        className="gap-2 bg-pink/20 text-pink border border-pink/30 hover:bg-pink/30"
      >
        {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
        {copied ? 'Link copied!' : `Share with ${connection.name}`}
      </Button>
      {copied && <p className="text-xs text-muted-foreground mt-2">Send them the link — they can sign in and see your bond.</p>}
      {shareError && <p className="text-xs text-destructive mt-2">Couldn't create the share link. Please try again.</p>}
    </div>
  );
}
