'use client';

import React, { useState } from 'react';
import { FiShare2, FiCopy, FiMail, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

interface Props {
  /** Resolves the link to share. Called lazily on first open so we don't hit the API for every row up front. */
  getUrl: () => Promise<string>;
  subject: string;
  message: (url: string) => string;
  /** E.164 digits with no leading '+', e.g. "447344056285". Omitted = let the user pick a WhatsApp contact. */
  whatsappPhone?: string;
  label?: string;
}

export default function ShareLinkMenu({ getUrl, subject, message, whatsappPhone, label = 'Share' }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (url || loading) return;
    setLoading(true);
    setError('');
    try {
      setUrl(await getUrl());
    } catch (e: any) {
      setError(e.message || 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waLink = url
    ? `https://wa.me/${whatsappPhone || ''}?text=${encodeURIComponent(message(url))}`
    : '#';
  const mailLink = url
    ? `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message(url))}`
    : '#';

  return (
    <div className="relative inline-block">
      <button
        onClick={handleOpen}
        className="bg-muted hover:bg-border text-foreground px-2.5 py-1 rounded text-[11px] font-semibold transition inline-flex items-center gap-1"
      >
        <FiShare2 /> {label}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-50 w-64 bg-card border border-border rounded-xl shadow-2xl p-3 space-y-2 text-xs">
            {loading && <div className="text-muted-foreground py-2 text-center">Generating link...</div>}
            {error && <div className="text-rose-600">{error}</div>}
            {url && (
              <>
                <div className="bg-muted border border-border rounded p-2 font-mono text-[10px] break-all text-muted-foreground">
                  {url}
                </div>
                <button
                  onClick={handleCopy}
                  className="w-full bg-muted hover:bg-border text-foreground px-2.5 py-1.5 rounded font-semibold flex items-center justify-center gap-1.5"
                >
                  {copied ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={mailLink}
                  className="w-full bg-muted hover:bg-border text-foreground px-2.5 py-1.5 rounded font-semibold flex items-center justify-center gap-1.5"
                >
                  <FiMail /> Email
                </a>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-brand-whatsapp/10 hover:bg-brand-whatsapp/20 text-brand-whatsapp px-2.5 py-1.5 rounded font-semibold flex items-center justify-center gap-1.5"
                >
                  <FaWhatsapp /> WhatsApp
                </a>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
