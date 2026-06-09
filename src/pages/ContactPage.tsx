import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, HelpCircle, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ward, setWard] = useState('4');
  const [subject, setSubject] = useState('segregation');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please input your name, email address, and message description.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      toast.success('Your message has been safely logged in the Kathmandu municipality help system queue! Reference ID: #' + Math.floor(Math.random() * 100000));
      setName('');
      setEmail('');
      setMessage('');
      setSubmitting(false);
    }, 1200);
  };

  const contactOptions = [
    { title: 'Municipality Waste Helpline', detail: '+977-1-4432100', subtitle: 'Hours: 7:00 AM - 6:00 PM (Everyday)', icon: Phone, color: 'text-emerald-500' },
    { title: 'Primary Escalation Office', detail: 'info@ecotrack.gov.np', subtitle: 'Checked within 1-2 administrative days', icon: Mail, color: 'text-blue-500' },
    { title: 'Kathmandu HQ Secretariat', detail: 'Ward 4, New Baneshwor, Nepal', subtitle: 'Waste Solid Management Division office', icon: MapPin, color: 'text-red-500' },
  ];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full text-emerald-800 dark:text-emerald-300 font-sans text-xs font-bold uppercase tracking-wider mb-3.5 border border-emerald-100 dark:border-emerald-900"
        >
          <HelpCircle className="h-4 w-4 text-emerald-500" />
          Get in touch
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-sans font-extrabold text-gray-900 dark:text-white tracking-tight mb-4"
        >
          Kathmandu Citizen Help Desk
        </motion.h1>
        
        <p className="text-sm text-gray-500 dark:text-slate-400 font-sans">
          Have questions about segregation categories, digital wallet rewards, or need to report a massive illegal pile? Send us a route priority update.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
        {/* Contact Info Deck */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-xl font-sans font-bold text-gray-900 dark:text-white tracking-tight mb-4 hidden lg:block">
            Escalation Contacts
          </h2>

          <div className="space-y-4">
            {contactOptions.map((opt, idx) => {
              const Icon = opt.icon;
              return (
                <div
                  key={idx}
                  className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-850 shadow-xs flex gap-4 hover:border-gray-200 dark:hover:border-slate-800 transition-colors"
                >
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${opt.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{opt.title}</h3>
                    <p className="text-sm font-sans font-extrabold text-gray-900 dark:text-white mt-1">{opt.detail}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{opt.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warning notice */}
          <div className="p-5 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-xs text-amber-700 dark:text-amber-400 space-y-1.5 font-sans">
            <span className="font-bold flex items-center gap-1 uppercase tracking-wider text-[10px]">
              <AlertTriangle className="h-4 w-4" /> Urgent Pile Warning
            </span>
            <p className="leading-relaxed text-[11px]">
              Do not use this email queue for clinical biohazards or burning landfills. Please contact Kathmandu Central Fire & Safety dispatch dial directly at **101**.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-850 p-6 sm:p-8 shadow-xs">
          <h3 className="text-lg font-sans font-bold text-gray-900 dark:text-white tracking-tight mb-6">
            Citizen Support Request Form
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sita Thapa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white text-xs p-3 rounded-xl outline-none transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white text-xs p-3 rounded-xl outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Kathmandu Ward Number</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500 text-xs p-3 rounded-xl outline-none transition-all dark:text-white"
                >
                  {Array.from({ length: 32 }, (_, i) => String(i + 1)).map((num) => (
                    <option key={num} value={num}>Ward {num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Inquiry Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500 text-xs p-3 rounded-xl outline-none transition-all dark:text-white"
                >
                  <option value="segregation">Waste Segregation Rules</option>
                  <option value="wallet">Wallet Balance Cash-out Help</option>
                  <option value="complaint">Driver / Collection Late Complaint</option>
                  <option value="partnership">School / Corporate Eco-partnership</option>
                  <option value="other">General Waste Inquiry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Message / Suggestion</label>
              <textarea
                required
                rows={4}
                placeholder="Describe your inquiry in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white text-xs p-3 rounded-xl outline-none transition-all dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-650 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs p-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Delivering Inquiry to Ward...' : 'Submit Support Ticket'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
