import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = "Consulting the cosmos..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-8 h-8 text-violet" />
      </motion.div>
      <p className="text-muted-foreground text-sm animate-pulse">{message}</p>
    </div>
  );
}