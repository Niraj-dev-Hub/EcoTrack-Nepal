import React from 'react';
import { Leaf, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400">
      <div className="max-w-screen-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="flex items-center gap-2 text-white font-sans font-bold text-lg leading-6 cursor-default">
              <span className="bg-emerald-500 p-1.5 rounded-lg text-white">
                <Leaf className="h-4 w-4" />
              </span>
              EcoTrack Nepal
            </span>
            <p className="mt-4 text-sm text-gray-400 max-w-md">
              A collaborative citizen-municipality waste segregation and collection logistics platform for Kathmandu, Nepal. Report accumulated garbage, coordinate collection, and earn dynamic digital wallet rewards for a green future.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Waste Types</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between">Plastic <span className="text-emerald-500 font-semibold font-mono">Rs. 5/kg</span></li>
              <li className="flex justify-between">Paper <span className="text-emerald-500 font-semibold font-mono">Rs. 4/kg</span></li>
              <li className="flex justify-between">Metal <span className="text-emerald-500 font-semibold font-mono">Rs. 8/kg</span></li>
              <li className="flex justify-between">Organic <span className="text-emerald-500 font-semibold font-mono">Rs. 2/kg</span></li>
              <li className="flex justify-between">E-waste <span className="text-amber-500 font-semibold font-mono">Rs. 10/kg</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Nepal Help</h3>
            <p className="mt-3 text-sm text-gray-400">
              Ward 4, Kathmandu Municipality Office<br />
              New Baneshwor, Nepal<br />
              <span className="text-white">Phone:</span> +977-1-4432100<br />
              <span className="text-white">Email:</span> info@ecotrack.gov.np
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-gray-500">
            &copy; 2026 EcoTrack Nepal. All rights reserved. Registered under Kathmandu Municipality Waste Logistics.
          </div>
          <div className="flex items-center text-xs text-gray-500">
            Made with <Heart className="h-3 w-3 text-red-500 mx-1 fill-red-500" /> for a cleaner, greener Kathmandu valley.
          </div>
        </div>
      </div>
    </footer>
  );
}
