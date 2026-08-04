import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { client } from '@/lib/amplifyClient';

const TIER_COLORS = {
  Soulmate: 'text-pink',
  Extraordinary: 'text-gold',
  Powerful: 'text-violet',
  Meaningful: 'text-teal',
  Complex: 'text-orange-400',
  Delicate: 'text-muted-foreground',
  Chilly: 'text-blue-400',
};

function BigThreeChips({ name, signs }) {
  if (!signs?.sun && !signs?.moon && !signs?.rising) return null;
  return (
    <div className="text-center">
      <p className="text-xs font-semibold text-foreground mb-1.5">{name}</p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {signs.sun && <span className="px-2 py-0.5 rounded-full text-[10px] bg-gold/10 border border-gold/20 text-gold capitalize">☀ {signs.sun}</span>}
        {signs.moon && <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal/10 border border-teal/20 text-teal capitalize">☽ {signs.moon}</span>}
        {signs.rising && <span className="px-2 py-0.5 rounded-full text-[10px] bg-violet/10 border border-violet/20 text-violet capitalize">↑ {signs.rising}</span>}
      </div>
    </div>
  );
}

export default function SharedReading() {
  const { id } = useParams();
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Public API-key read — the recipient of a share link has no account,
        // so this can't rely on a Cognito session existing.
        const { data: record, errors } = await client.models.SharedReading.get(
          { id },
          { authMode: 'apiKey' }
        );
        if (errors?.length || !record) throw new Error('not found');
        setReading(record);
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <LoadingSpinner message="Opening the bond reading..." />
      </div>
    );
  }

  if (notFound || !reading?.report) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-4">This shared reading doesn't exist or has been removed.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const { report } = reading;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="text-center mb-6">
          <Sparkles className="w-6 h-6 text-violet mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">A Cosmic Bond Reading</p>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {reading.inviter_name} & {reading.connection_name}
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            {reading.inviter_name} shared this reading of the energy between you two.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/50">
          <div className="grid grid-cols-2 gap-4">
            <BigThreeChips name={reading.inviter_name} signs={reading.user_big_three} />
            <BigThreeChips name={reading.connection_name} signs={reading.connection_big_three} />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 text-center border border-pink/30 glow-pink">
          <Heart className="w-5 h-5 text-pink mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bond Tier</p>
          <p className={`font-heading text-2xl font-bold ${TIER_COLORS[report.bond_tier] || 'text-foreground'}`}>
            {report.bond_tier}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-teal/20">
          <h4 className="font-heading text-xs font-semibold text-teal uppercase tracking-wider mb-2">The Chemistry</h4>
          <p className="text-sm text-foreground leading-relaxed">{report.chemistry}</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-pink/20">
          <h4 className="font-heading text-xs font-semibold text-pink uppercase tracking-wider mb-2">The Frictions</h4>
          <p className="text-sm text-foreground leading-relaxed">{report.frictions}</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-violet/30 glow-violet">
          <h4 className="font-heading text-xs font-semibold text-violet uppercase tracking-wider mb-2">The Long-Term Potential</h4>
          <p className="text-sm text-foreground leading-relaxed italic">{report.long_term_potential}</p>
        </div>

        <div className="glass-card rounded-2xl p-6 text-center border border-gold/20">
          <p className="text-sm text-foreground mb-3">Curious what's written in your own chart?</p>
          <Button asChild size="sm" className="gap-2">
            <Link to="/astrology">
              <Sparkles className="w-3.5 h-3.5" /> Build Your Birth Chart
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}