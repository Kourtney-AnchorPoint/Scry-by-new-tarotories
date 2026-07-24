import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Trash2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleDataRequest = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: 'support@tarotories.com',
      subject: 'Data Deletion Request',
      body: `A user has requested deletion of their data.\n\nEmail: ${email}\n\nPlease process this request within 30 days as required by applicable privacy laws.`,
    });
    setSending(false);
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary mb-4 text-violet">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Last updated: April 2026</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-foreground/90"
      >
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-primary">1. Introduction</h2>
          <p>Welcome to Tarotories ("we," "us," or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our app.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-primary">2. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Account information (name, email address)</li>
            <li>Profile data (birth date, birth location — used solely for astrological calculations)</li>
            <li>Reading history and journal entries you choose to save</li>
            <li>Payment information (processed securely by Stripe — we never store card details)</li>
          </ul>
          <p>We also collect basic usage data automatically (device type, pages visited) to improve the app experience.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-primary">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>To provide and personalize the app experience</li>
            <li>To generate astrological and numerological readings</li>
            <li>To process subscription payments</li>
            <li>To send important account-related communications</li>
            <li>To improve our services</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-primary">4. Sharing Your Information</h2>
          <p>We do not sell your personal data. We may share information with:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li><strong>Stripe</strong> — for payment processing</li>
            <li><strong>OpenAI / AI providers</strong> — to generate reading interpretations (prompts are not linked to your identity)</li>
            <li>Legal authorities, if required by law</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-primary">5. Data Retention</h2>
          <p>We retain your data for as long as your account is active. You may request deletion of your account and associated data at any time through the Account settings page.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-primary">6. Security</h2>
          <p>We use industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-primary">7. Children's Privacy</h2>
          <p>Tarotories is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-primary">8. Your Rights</h2>
          <p>Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete your data. Contact us to exercise these rights.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-primary">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-primary">10. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us through the app's support channels.</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-destructive flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Request Data Deletion
          </h2>
          <p className="text-muted-foreground">You have the right to request permanent deletion of all your personal data, including your account, readings, and profile information. Enter your account email below and we will process your request within 30 days.</p>

          {submitted ? (
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-teal/10 border border-teal/30 text-teal text-sm">
              <Check className="w-4 h-4 shrink-0" />
              Request received. We'll process your data deletion within 30 days.
            </div>
          ) : (
            <form onSubmit={handleDataRequest} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your account email address"
                className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-destructive/50 transition-colors"
              />
              <Button
                type="submit"
                disabled={sending}
                className="bg-destructive/80 hover:bg-destructive text-white gap-2 whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                {sending ? 'Sending...' : 'Delete My Data'}
              </Button>
            </form>
          )}
        </section>
      </motion.div>
    </div>
  );
}