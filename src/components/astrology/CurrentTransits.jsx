import React from 'react';
import { Radar, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import TransitPhaseCard from '@/components/astrology/TransitPhaseCard';
import HouseTransitList from '@/components/astrology/HouseTransitList';
import { useTransits } from '@/hooks/useTransits';

export default function CurrentTransits({ profile }) {
  const { data, loading, error, retry } = useTransits(profile);

  if (!profile?.birth_date) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Radar className="w-4 h-4 text-gold" />
        <h2 className="font-heading text-sm font-semibold text-gold uppercase tracking-wider">
          Happening Now — What You're Moving Through
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Calculated from today's actual sky against your birth chart. Updated daily.
      </p>

      {loading && <LoadingSpinner message="Reading today's sky against your chart..." />}

      {error && !loading && (
        <div className="glass-card rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-gold mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button size="sm" variant="outline" className="gap-2 border-gold/30 text-gold" onClick={retry}>
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </Button>
        </div>
      )}

      {data && !loading && (
        <>
          <HouseTransitList houseTransits={data.house_transits} />
          {data.phases.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              The sky is quiet for you today — no major transits within orb. A rare breather.
            </p>
          ) : (
            <div className="space-y-3">
              {data.phases.map((phase, i) => (
                <TransitPhaseCard key={`${phase.transiting}-${phase.natal_point}-${phase.aspect}`} phase={phase} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}