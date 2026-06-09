import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Award, MapPin, BarChart3, ArrowRight, ShieldCheck, Users, HelpCircle, Sparkles } from 'lucide-react';
const heroBackground = '/src/assets/images/kathmandu_valley_eco_1780475840991.png';

export default function LandingPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-emerald-950 text-white py-24 md:py-32">
        {/* Background Image with elegant overlay to prioritize text readability */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src={heroBackground}
            alt="Kathmandu Valley Eco Landscape"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/80 to-transparent z-0"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-6 uppercase tracking-wider animate-bounce">
              <Sparkles className="h-3 w-3" /> Smart City Initiative for Kathmandu
            </span>
            <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-none">
              EcoTrack <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Nepal</span>
            </h1>
            <p className="font-sans text-xl sm:text-2xl font-light text-emerald-100 mb-4 tracking-wide max-w-2xl leading-relaxed">
              "Track Waste, Earn Rewards, Save Nepal"
            </p>
            <p className="text-base sm:text-lg text-emerald-200/90 mb-8 max-w-xl leading-relaxed">
              Join the movement to make Kathmandu cleaner and greener. Report garbage accumulation, request collections, earn digital wallet rewards instantly, and help municipality admins monitor city-wide waste statistics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-xl text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-5050/20 hover:scale-102 transition-all duration-200"
              >
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-emerald-500/50 text-base font-semibold rounded-xl text-white hover:bg-emerald-900/30 transition-all duration-200"
              >
                Sign In to Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-8 z-20 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 grid grid-cols-2 md:grid-cols-4 p-6 md:p-8 gap-y-8 gap-x-4 border border-gray-150">
          <div className="text-center md:border-r border-gray-100">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">5,000+</p>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium font-sans">Registered Citizens</p>
          </div>
          <div className="text-center md:border-r border-gray-100">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">10,000+</p>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium font-sans">KG Waste Contributed</p>
          </div>
          <div className="text-center md:border-r border-gray-100">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">Rs. 50,000+</p>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium font-sans">Rewards Distributed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">100+</p>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium font-sans">Active Drivers & Trucks</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            A Smart Cycle for Sustainable Waste Logisitics
          </h2>
          <p className="mt-4 text-lg text-gray-500 font-light">
            We bridge the gap between Kathmandu citizens, garbage collectors, and municipal offices to automate garbage collection reporting and recycling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl w-fit mb-5">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Report Garbage Easily</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Snap coordinates and report litter hotspots, specifying garbage type, estimated weights, and photo notes to let driver crews know.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl w-fit mb-5">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Earn Instant Rewards</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Earn credits straight to your digital wallet the moment a pickup garbage driver validates and weighs your reported materials.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl w-fit mb-5">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Track Collection Status</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Transparent, real-time reporting indicators show you exactly when your submitted garbage is Pending, En route, or Collected.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl w-fit mb-5">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time Analytics</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Provides municipal officers with charts, high-impact leaders, monthly trends, and downloadable CSV records of collections.
            </p>
          </div>
        </div>
      </div>

      {/* Rewards Schedule Banner */}
      <div className="bg-emerald-50 py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Our Segregated Waste Reward Schedule
              </h2>
              <p className="mt-3 text-slate-500 text-sm sm:text-base leading-relaxed">
                By segregating garbage correctly, you receive high-value rates per KG transferred directly into your virtual Nepalese Rupees (Rs.) wallet. Turn trash into cash and help save Kathmandu's biodiversity.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full font-mono transition-colors">
                  Plastic: Rs. 5/KG
                </span>
                <span className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full font-mono transition-colors">
                  Paper: Rs. 4/KG
                </span>
                <span className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full font-mono transition-colors">
                  Metal: Rs. 8/KG
                </span>
                <span className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full font-mono transition-colors">
                  Organic: Rs. 2/KG
                </span>
                <span className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full font-mono transition-colors">
                  E-waste: Rs. 10/KG ✨
                </span>
              </div>
            </div>
            <div className="bg-emerald-600 text-white rounded-2xl p-6 sm:p-8 w-full max-w-md border border-emerald-500 shadow-lg shadow-emerald-600/10">
              <span className="text-emerald-200 text-xs uppercase font-extrabold tracking-wider">Example Calculation</span>
              <p className="mt-3 text-2xl font-bold">12 KG of Scrap Metal</p>
              <p className="mt-1 text-emerald-100 text-sm leading-relaxed">
                Fulfilling a collection request of iron scrap fetches you:
              </p>
              <div className="mt-4 border-t border-emerald-500 pt-4 flex justify-between items-center">
                <span className="font-mono text-sm">12 KG × Rs. 8</span>
                <span className="text-2xl font-black font-mono">Rs. 96 Cash!</span>
              </div>
              <div className="mt-6">
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center bg-white hover:bg-emerald-50 text-emerald-800 text-sm font-bold py-2.5 px-4 rounded-xl shadow transition-colors"
                >
                  Create Your Wallet Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
