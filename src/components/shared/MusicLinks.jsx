import React from 'react';
import { ExternalLink } from 'lucide-react';
import { buildMusicLinks } from '@/lib/musicLinks';

export default function MusicLinks({ song, className = '' }) {
  const links = buildMusicLinks(song);
  if (!links.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-pink/30 bg-pink/10 px-3 py-1.5 text-[11px] font-medium text-pink transition-colors hover:border-pink/60 hover:bg-pink/15"
        >
          {link.label}
          <ExternalLink className="h-3 w-3" />
        </a>
      ))}
    </div>
  );
}
