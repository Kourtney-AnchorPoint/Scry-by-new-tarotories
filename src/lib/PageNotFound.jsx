import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StarField from '@/components/layout/StarField';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <StarField />
      <div className="text-center relative z-10 px-4">
        <Sparkles className="w-12 h-12 text-violet mx-auto mb-6 animate-float" />
        <h1 className="font-heading text-6xl font-bold shimmer-text mb-4">404</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          This path has drifted beyond the cosmic veil. Let the stars guide you home.
        </p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-violet to-teal text-white hover:opacity-90 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}