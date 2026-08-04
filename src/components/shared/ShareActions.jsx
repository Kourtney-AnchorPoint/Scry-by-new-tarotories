import React, { useState } from 'react';
import { Check, Copy, Facebook, Mail, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function getShareUrl(url) {
  if (url) return url;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'https://main.d9v72l1if77fe.amplifyapp.com';
}

async function copyText(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export default function ShareActions({ title = 'SCRY Reading', text = '', url, onShared }) {
  const [copied, setCopied] = useState('');
  const shareUrl = getShareUrl(url);
  const fullText = `${text}\n\nGet your own reading at ${shareUrl}`.trim();

  const markShared = (kind) => {
    setCopied(kind);
    onShared?.(kind);
    setTimeout(() => setCopied(''), 1800);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, text: fullText, url: shareUrl });
      markShared('native');
      return;
    }
    await copyText(fullText);
    markShared('copy');
  };

  const copyForSocial = async () => {
    await copyText(fullText);
    markShared('social');
  };

  const openShareWindow = (targetUrl) => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer,width=680,height=720');
    onShared?.('external');
  };

  return (
    <div className="rounded-2xl border border-border/30 bg-secondary/20 p-3 space-y-3">
      <p className="text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Share your reading
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Button type="button" onClick={nativeShare} variant="outline" size="sm" className="gap-2 border-border/50 text-xs">
          <Share2 className="w-3.5 h-3.5" />
          Share to Apps
        </Button>
        <Button type="button" onClick={copyForSocial} variant="outline" size="sm" className="gap-2 border-border/50 text-xs">
          {copied === 'social' || copied === 'copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied === 'social' || copied === 'copy' ? 'Copied' : 'TikTok / IG'}
        </Button>
        <Button
          type="button"
          onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}
          variant="outline"
          size="sm"
          className="gap-2 border-border/50 text-xs"
        >
          <Facebook className="w-3.5 h-3.5" />
          Facebook
        </Button>
        <Button
          type="button"
          onClick={() => openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`)}
          variant="outline"
          size="sm"
          className="gap-2 border-border/50 text-xs"
        >
          X
        </Button>
        <Button
          type="button"
          onClick={() => openShareWindow(`https://www.threads.net/intent/post?text=${encodeURIComponent(fullText)}`)}
          variant="outline"
          size="sm"
          className="gap-2 border-border/50 text-xs"
        >
          Threads
        </Button>
        <Button
          type="button"
          onClick={() => {
            window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(fullText)}`;
            onShared?.('email');
          }}
          variant="outline"
          size="sm"
          className="gap-2 border-border/50 text-xs"
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </Button>
      </div>
      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        TikTok and Instagram use copy/native share from a website, so this prepares the caption for you.
      </p>
    </div>
  );
}
