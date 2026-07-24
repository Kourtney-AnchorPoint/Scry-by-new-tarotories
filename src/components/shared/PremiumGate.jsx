import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PremiumGate({ feature = "this feature" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto"
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet to-teal flex items-center justify-center mx-auto mb-5">
        <Lock className="w-7 h-7 text-white" />
      </div>
      <h3 className="font-heading text-xl font-semibold mb-2">
        Unlock {feature}
      </h3>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        Upgrade to Premium for advanced spreads, full birth charts, 
        personalized AI readings, and monthly deck drops.
      </p>
      <Link to="/premium">
        <Button className="bg-gradient-to-r from-violet to-teal text-white hover:opacity-90 gap-2 px-6">
          <Crown className="w-4 h-4" />
          Upgrade to Premium
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </motion.div>
  );
}