import React from 'react';
import Link from 'next/link';
import { FiHelpCircle, FiArrowRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) | Reseller Bus',
  description: 'Answers to wholesale bale pricing, shipping rates, returns, credit card payments, piece counts, and Bradford warehouse pickup.',
};

export default function FAQPage() {
  const faqs = [
    {
      q: 'How do you Sell?',
      a: 'We sell our New With Tags clothing in 50kg bags (bales).',
    },
    {
      q: 'How much is your Bale?',
      a: 'Our Bales are 50 kg in size:\n• Kiddies Mix — £600\n• Women Mix — £500\n• Men Mix — £750\n• General Mix — £590',
    },
    {
      q: 'What is the cost of shipping within the UK?',
      a: 'Standard Shipping — £20 (2-5 business days)\nExpress Shipping — £50 (1-2 business days)',
    },
    {
      q: 'What is the cost of shipping to Europe?',
      a: 'All Europe shipping is calculated on a pro-rata basis.',
    },
    {
      q: 'What is the cost of shipping to Africa?',
      a: '• Ghana — £50 per bale\n• Nigeria — £60 per bale\n• Gambia — £80 per bale',
    },
    {
      q: 'Do you accept credit cards?',
      a: 'Yes, you can buy securely using credit cards and debit cards directly on our website.',
    },
    {
      q: 'Do you do payment on delivery?',
      a: 'No, full payment validates every order before stock dispatch.',
    },
    {
      q: 'What Brands are in your bales?',
      a: 'Our bales contain top UK high street brands. You can check out sample videos and photos on our TikTok page (@resellerbus).',
    },
    {
      q: 'Are the items used or new?',
      a: 'Our clothing items are new with tags (95% Cream Grade NWT).',
    },
    {
      q: 'How many items are in your bales?',
      a: 'Item counts on bales vary because garment weights vary. Estimated piece counts per 50kg bale:\n• Ladies Mix: 160 - 200 + items\n• Kids Mix: 320 - 380 items\n• Mens Mix: 150 - 190 items',
    },
    {
      q: 'Do you accept returns or give refunds?',
      a: 'No refunds or returns. All sales are final trade wholesale purchases.',
    },
    {
      q: 'Can I pick up?',
      a: 'Yes, you can pick up at our office upon appointment (Unit 7, 5 Alive, York Road, Bradford BD8 0HR).',
    },
    {
      q: 'Can I choose specific brands?',
      a: 'No, we pack our items based on listed categories and the ratio of contents may vary in sealed sacks.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-full text-brand-red text-xs font-bold uppercase">
          <FiHelpCircle className="text-sm" />
          <span>Helping Resellers Thrive</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-card-foreground">Frequently Asked Questions</h1>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto">
          Everything you need to know about our 50kg wholesale bales, shipping, pricing, and business trade terms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="brand-card p-4 sm:p-6 space-y-2 min-w-0">
            <h3 className="font-bold text-brand-red text-sm">{faq.q}</h3>
            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed break-words">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border p-8 rounded-3xl text-center space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-card-foreground">Have Additional Questions?</h3>
        <p className="text-xs text-muted-foreground">Our wholesale team is available via WhatsApp or phone to assist you.</p>
        <div className="flex justify-center gap-4">
          <a
            href="https://wa.me/447353243741?text=Hello%2C%20I%27m%20interested%20in%20your%20wholesale%20clothing%20supply."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-whatsapp hover:brightness-110 text-white text-xs font-bold px-6 py-3 rounded-xl transition inline-flex items-center gap-2"
          >
            <FaWhatsapp className="text-base" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
