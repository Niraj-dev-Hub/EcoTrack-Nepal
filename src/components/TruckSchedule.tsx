import React, { useState } from 'react';
import { Calendar, Search, MapPin, Clock, Truck, ShieldAlert, CheckCircle } from 'lucide-react';

export interface ScheduleItem {
  id: string;
  ward: string;
  places: string[];
  days: string[];
  frequency: string;
  timeSlot: string;
  truckNo: string;
  driverName: string;
  driverPhone: string;
}

export const KATHMANDU_TRUCK_SCHEDULES: ScheduleItem[] = [
  {
    id: 's1',
    ward: 'Ward 10 & 31',
    places: ['New Baneshwor', 'Aloknagar', 'Subidhanagar', 'Shankhamul'],
    days: ['Sunday', 'Wednesday'],
    frequency: 'Twice a week',
    timeSlot: '07:00 AM - 09:30 AM',
    truckNo: 'BA-3-PA 8021',
    driverName: 'Ramesh Bahadur Thapa',
    driverPhone: '+977-9841883299'
  },
  {
    id: 's2',
    ward: 'Ward 11',
    places: ['Thapathali', 'Tripureshwor', 'Prasuti Griha Lane'],
    days: ['Monday', 'Thursday'],
    frequency: 'Twice a week',
    timeSlot: '08:15 AM - 10:45 AM',
    truckNo: 'BA-2-KA 4410',
    driverName: 'Hari Prasad Gaihre',
    driverPhone: '+977-9851023812'
  },
  {
    id: 's3',
    ward: 'Ward 14',
    places: ['Kalimati Fruit Market', 'Kuleshwor', 'Solteemode', 'Balkhu'],
    days: ['Tuesday', 'Friday'],
    frequency: 'Twice a week',
    timeSlot: '07:30 AM - 10:00 AM',
    truckNo: 'BA-1-KA 9920',
    driverName: 'Chandra Bahadur Tamang',
    driverPhone: '+977-9813045239'
  },
  {
    id: 's4',
    ward: 'Ward 28',
    places: ['Putalisadak', 'Kamaladi', 'Bagbazar', 'Dillibazar'],
    days: ['Monday', 'Wednesday'],
    frequency: 'Twice a week',
    timeSlot: '09:00 AM - 11:30 AM',
    truckNo: 'BA-3-PA 1150',
    driverName: 'Rajesh Khadka',
    driverPhone: '+977-9845112093'
  },
  {
    id: 's5',
    ward: 'Ward 16',
    places: ['Balaju Bypass', 'Shorakhutte', 'Machhapokhari', 'Nayabazar'],
    days: ['Tuesday', 'Saturday'],
    frequency: 'Twice a week',
    timeSlot: '06:45 AM - 09:15 AM',
    truckNo: 'BA-4-KA 7201',
    driverName: 'Prem Lama',
    driverPhone: '+977-9803451120'
  },
  {
    id: 's6',
    ward: 'Ward 3',
    places: ['Maharajgunj Circle', 'Bansbari', 'Panipokhari', 'Chappal Karkhana'],
    days: ['Tuesday', 'Saturday'],
    frequency: 'Twice a week',
    timeSlot: '08:00 AM - 10:30 AM',
    truckNo: 'BA-2-PA 6055',
    driverName: 'Dhurba Raj Shrestha',
    driverPhone: '+977-9842109841'
  },
  {
    id: 's7',
    ward: 'Ward 32',
    places: ['Koteshwor Chowk', 'Jadibuti', 'Narephant', 'Lokanthali border'],
    days: ['Thursday', 'Sunday'],
    frequency: 'Twice a week',
    timeSlot: '07:15 AM - 09:45 AM',
    truckNo: 'BA-3-KA 2110',
    driverName: 'Bijay Shrestha',
    driverPhone: '+977-9851123450'
  },
  {
    id: 's8',
    ward: 'Ward 4',
    places: ['Baluwatar', 'Chundevi', 'Gairidhara'],
    days: ['Wednesday', 'Saturday'],
    frequency: 'Twice a week',
    timeSlot: '07:45 AM - 10:15 AM',
    truckNo: 'BA-1-KA 3004',
    driverName: 'Sanju Tuladhar',
    driverPhone: '+977-9811440212'
  }
];

export default function TruckSchedule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('All Wards');

  const wardsList = ['All Wards', ...Array.from(new Set(KATHMANDU_TRUCK_SCHEDULES.map(s => s.ward)))];

  const filteredSchedules = KATHMANDU_TRUCK_SCHEDULES.filter((item) => {
    const matchesSearch = 
      item.places.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.driverName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWard = selectedWard === 'All Wards' || item.ward === selectedWard;

    return matchesSearch && matchesWard;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/10">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-base">
            <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Kathmandu Municipal Routing Schedule
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Decentralized household waste pickup schedules operated twice weekly across Kathmandu municipality.
          </p>
        </div>
        <div className="bg-emerald-650 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
          LIVE WARD NETWORK
        </div>
      </div>

      {/* Filter / Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by neighborhood, ward circle, or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs p-3 pl-9 rounded-xl outline-none focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-white transition-all shadow-2xs"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs p-3 rounded-xl outline-none focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-white transition-all shadow-2xs"
          >
            {wardsList.map((ward) => (
              <option key={ward} value={ward}>{ward}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Results Grid */}
      {filteredSchedules.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
          <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-2 animate-bounce" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching neighborhood routing schedule found</p>
          <p className="text-xs text-slate-400 mt-1">Try entering another area like Baneshwor, Thapathali, or Balaju.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchedules.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs hover:border-emerald-500/20 dark:hover:border-emerald-500/30 transition-all duration-350 relative group"
            >
              {/* Top Banner Tag */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
                    {item.ward}
                  </span>
                  <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 inline" /> {item.frequency}
                  </div>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Scheduled Hours</span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 bg-slate-50 dark:bg-slate-800/65 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-800">
                    {item.timeSlot}
                  </span>
                </div>
              </div>

              {/* Places Tag list */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Areas Covered:</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.places.map((place, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/5 dark:bg-emerald-400/5 text-slate-800 dark:text-slate-200 border border-emerald-500/10 text-xs font-semibold"
                    >
                      <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      {place}
                    </span>
                  ))}
                </div>
              </div>

              {/* Service days */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Service Days</span>
                  <div className="flex gap-1.5">
                    {item.days.map((day, dIdx) => (
                      <span
                        key={dIdx}
                        className="bg-emerald-650 text-white text-[10px] font-bold py-0.5 px-2 rounded-md uppercase tracking-wider"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Assigned Driver & Truck</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.driverName}</p>
                  <p className="text-[10px] text-slate-405 dark:text-slate-550 font-mono mt-0.5">
                    {item.truckNo} • {item.driverPhone}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
