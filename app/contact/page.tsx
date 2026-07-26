'use client';

import React, { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { ContactService } from '@/services/contact-service';
import { sanitizeDigits } from '@/lib/input-utils';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'United Kingdom',
    stockInterest: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await ContactService.submit(formData);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try WhatsApp instead.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-muted border border-border rounded-lg p-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Get In Touch</p>
        <h1 className="text-2xl sm:text-4xl font-black text-card-foreground tracking-tight">
          WE&apos;RE HERE TO HELP
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Whether you have a question about our stock, shipping logistics to Ghana/Nigeria/Gambia/Europe,
          or partnership opportunities, our team is ready to answer all your questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-primary text-primary-foreground p-5 sm:p-8 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold border-b border-white/10 pb-3">Bradford Headquarters</h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <FiMapPin className="text-brand-red text-lg shrink-0 mt-0.5" />
                <div>
                  <span className="text-white/50 block font-medium text-xs">Warehouse Address</span>
                  <span className="font-medium leading-relaxed">
                    Unit 7, 5 Alive, York Road, Bradford BD8 0HR, United Kingdom
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiPhone className="text-brand-red text-lg shrink-0" />
                <div>
                  <span className="text-white/50 block font-medium text-xs">Phone / Call</span>
                  <a href="tel:+447344056285" className="font-medium hover:opacity-80 transition">
                    +44 7344 056285
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiMail className="text-brand-red text-lg shrink-0" />
                <div>
                  <span className="text-white/50 block font-medium text-xs">Email</span>
                  <a
                    href="mailto:info@resellerbus.co.uk"
                    className="font-medium hover:opacity-80 transition"
                  >
                    info@resellerbus.co.uk
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiClock className="text-brand-red text-lg shrink-0" />
                <div>
                  <span className="text-white/50 block font-medium text-xs">Working Hours</span>
                  <span className="font-medium">Mon - Fri: 9am - 6pm (GMT)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <span className="text-xs text-white/60 font-medium block">Direct WhatsApp Support</span>
              <a
                href="https://wa.me/447353243741?text=Hello%2C%20I%27m%20interested%20in%20your%20wholesale%20clothing%20supply."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-brand-whatsapp hover:brightness-110 text-white font-semibold text-sm py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="text-lg" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0">
          <div className="bg-card border border-border p-5 sm:p-8 rounded-2xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-card-foreground">Send Us A Message</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fill out the form and our sourcing experts will get back to you within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="bg-muted border border-border text-foreground p-6 rounded-2xl text-center space-y-2">
                <FiCheckCircle className="text-4xl text-brand-whatsapp mx-auto" />
                <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
                <p className="text-sm text-muted-foreground">
                  Thank you for reaching out. Our wholesale sourcing team will reply shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground font-medium mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="reseller@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground font-medium mb-1">
                      Mobile Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      placeholder="447344056285"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: sanitizeDigits(e.target.value) })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-medium mb-1">
                      Country / Destination
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className={inputClass}
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Gambia">Gambia</option>
                      <option value="Europe">Europe</option>
                      <option value="Other">Other International</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-foreground font-medium mb-1">Stock Interest</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 bales of Women Mix 50kg"
                    value={formData.stockInterest}
                    onChange={(e) => setFormData({ ...formData, stockInterest: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-foreground font-medium mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Let us know any specific questions or delivery requests..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary">
                  <FiSend />
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
