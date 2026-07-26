'use client';

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WA_URL =
  'https://wa.me/447353243741?text=Hello%2C%20I%27m%20interested%20in%20your%20wholesale%20clothing%20supply.';

export default function WhatsAppChat() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 flex items-center justify-center gap-2 bg-brand-whatsapp text-white font-semibold text-sm rounded-full shadow-lg hover:brightness-110 transition-all duration-200 active:scale-[0.97] min-h-[48px] min-w-[48px] pl-3.5 pr-3.5 sm:pr-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]"
      aria-label="Chat with us on WhatsApp"
    >
      <FaWhatsapp className="text-2xl sm:text-xl shrink-0" />
      <span className="hidden sm:inline whitespace-nowrap">Chat with us</span>
    </a>
  );
}
