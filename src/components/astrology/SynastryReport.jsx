import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { invokeLLM } from '@/api/ai';
import ShareBondButton from '@/components/astrology/ShareBondButton';

const TIER_COLORS = {
  Soulmate: 'text-pink',
  Extraordinary: 'text-gold',
  Powerful: 'text-violet',
  Meaningful: 'text-teal',
  Complex: 'text-orange-400',
  Delicate: 'text-muted-foreground',
  Chilly: 'text-blue-400',
};

export default function SynastryReport({ userChartData, connection, connectionChartData }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadedRef = useRef('');

  const generateReport = async () => {
    if (!userChartData || !connectionChartData) return;
    setLoading(true);
    setError(null);
    try {
      const bt1 = userChartData.big_three || {};
      const pl1 = userChartData.planets || {};
      const bt2 = connectionChartData.big_three || {};
      const pl2 = connectionChartData.planets || {};

      const result = await invokeLLM({
        action: 'synastry_reading',
        params: {
          connectionName: connection.name,
          userBigThree: { sun: bt1.sun?.sign, moon: bt1.moon?.sign, rising: bt1.rising?.sign },
          userVenus: pl1.venus?.sign,
          userMars: pl1.mars?.sign,
          connectionBigThree: { sun: bt2.sun?.sign, moon: bt2.moon?.sign, rising: bt2.rising?.sign },
          connectionVenus: pl2.venus?.sign,
          connectionMars: pl2.mars?.sign,
        },
      });
      setReport(result);
    } catch {
      setError('Unable to read the relationship energy right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const key = connection?.id + '_' + !!connectionChartData;
    if (key !== loadedRef.current) {
      loadedRef.current = key;
      setReport(null);
      setError(null);
      if (connectionChartData) {
        generateReport();
      }
    }
  }, [connection?.id, connectionChartData]);

  if (!connectionChartData) return null;

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-5 text-center border border-pink/20">
        <Heart className="w-6 h-6 text-pink mx-auto mb-2" />
        <h3 className="font-heading text-base font-semibold text-foreground">
          You & {connection.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Compatibility Analysis</p>
      </div>

      {loading && (
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">Reading the energy between you...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
          <AlertCircle className="w-5 h-5 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive mb-3">{error}</p>
          <Button size="sm" variant="outline" className="border-destructive/30 text-destructive" onClick={generateReport}>
            <RotateCcw className="w-3 h-3 mr-1" /> Try Again
          </Button>
        </div>
      )}

      {report && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="glass-card rounded-2xl p-5 text-center border border-pink/30 glow-pink">
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

          <ShareBondButton
            connection={connection}
            report={report}
            userChartData={userChartData}
            connectionChartData={connectionChartData}
          />

          <div className="flex justify-center">
            <Button size="sm" variant="outline" className="gap-2 border-border/50" onClick={generateReport}>
              <RotateCcw className="w-3.5 h-3.5" />
              Regenerate
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
