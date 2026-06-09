import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Recycle, Heart, Shield, Users, Trophy } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Total Cleared Pile Weight', value: '14,820 KG', icon: Recycle, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900' },
    { label: 'Active Green Citizens', value: '1,240+', icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900' },
    { label: 'Rewards Transferred', value: 'Rs. 74,100', icon: Trophy, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900' },
  ];

  const team = [
    { name: 'Dr. Ramesh Thapa', role: 'Municipal Solid Waste Director', bio: 'Pioneered solid-waste routing and clean ward development projects in the Bagmati river basin.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200' },
    { name: 'Sujata Shrestha', role: 'Chief of Environment Innovation', bio: 'Passionate circular economy advocate aiming to convert community waste piles into functional compost and eco-credits.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200' },
  ];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Intro Hero Heading */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-sans text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-100 dark:border-emerald-900"
        >
          <Leaf className="h-4 w-4 text-emerald-500" />
          Our Mission
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-sans font-extrabold text-gray-900 dark:text-white tracking-tight leading-none mb-6"
        >
          Keeping Kathmandu <br />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Cleaner, Greener, and Smarter</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-gray-500 dark:text-slate-400 font-sans"
        >
          EcoTrack Nepal is Kathmandu's primary collaborative citizen-municipality solid waste logistics platform. We match green citizens, logistics drivers, and ward administrators to create a circular ecosystem.
        </motion.p>
      </div>

      {/* Stats Cards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-xs flex items-center gap-4`}
            >
              <div className={`p-3.5 rounded-xl border ${stat.color.split(' ').slice(1).join(' ')}`}>
                <Icon className={`h-6 w-6 ${stat.color.split(' ')[0]}`} />
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</dt>
                <dd className="text-2xl font-mono font-black text-gray-900 dark:text-white mt-0.5">{stat.value}</dd>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Two Column details: Who We Are & What We Do */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-sans font-bold text-gray-900 dark:text-white tracking-tight">
            An Innovative Approach to Kathmandu's Garbage Challenges
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-sans">
            Managing municipal waste across Kathmandu valley's densely populated alleyways requires decentralized cooperation. Traditional scheduled routing leaves garbage piles exposed on roadsides for long hours, inviting environmental hazards.
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-sans">
            **EcoTrack** enables real-time waste alerts. When citizens spot or consolidate segregated waste (Plastic, Paper, Metal, E-Waste, Organic), they take a photo and post a report. Municipality sweepers and logistics vehicles are instantly notified via GPS-guided route planners to perform on-demand pickups, rewarding citizens immediately with digital cash.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-semibold text-gray-900 dark:text-white">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Verified Municipality Staff</span>
            </div>
            <div className="flex items-center gap-2">
              <Recycle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Circular Waste Segregation</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Community Funded Program</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Smart Citizen Integrations</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-emerald-600/5 dark:bg-slate-900 p-8 rounded-3xl border border-emerald-500/10 dark:border-slate-800"
        >
          <h3 className="text-lg font-bold font-sans text-emerald-800 dark:text-emerald-400 mb-4">How EcoTrack Operates</h3>
          <ul className="space-y-4 text-xs text-gray-600 dark:text-slate-400 font-sans">
            <li className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-600 text-white font-mono font-bold flex items-center justify-center">1</span>
              <div>
                <strong className="text-gray-950 dark:text-white block mb-0.5">Report Stack Pile</strong>
                Locate solid waste accumulations in Kathmandu. Share images, specify approximate size, select garbage category, and log your location coordinates.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-600 text-white font-mono font-bold flex items-center justify-center">2</span>
              <div>
                <strong className="text-gray-950 dark:text-white block mb-0.5">En-Route GPS Logistics</strong>
                Sweepers and collectors lock target locations in Kathmandu. While drivers navigate, citizens receive real-time vehicle SMS warnings and warning mail when 5 minutes out.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-600 text-white font-mono font-bold flex items-center justify-center">3</span>
              <div>
                <strong className="text-gray-950 dark:text-white block mb-0.5">Instant Clearing & Compensation</strong>
                The cargo is weighed, categorized, and confirmed on site by our verified municipality handlers. Digital rewards are credited directly to your EcoTrack local wallet.
              </div>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Leadership / Team Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-sans font-extrabold text-gray-900 dark:text-white text-center mb-10 tracking-tight">
          Executive Leadership Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-20 h-20 rounded-full border border-emerald-500/20 object-cover shadow-sm bg-slate-100 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-gray-900 dark:text-white font-sans">{member.name}</h3>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-sans mt-0.5">{member.role}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 leading-relaxed mt-2 font-sans">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
