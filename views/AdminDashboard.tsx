
import React, { useRef, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, UserRole } from '../types';

const chartData = [
  { name: 'Mon', usage: 400 },
  { name: 'Tue', usage: 700 },
  { name: 'Wed', usage: 550 },
  { name: 'Thu', usage: 800 },
  { name: 'Fri', usage: 950 },
  { name: 'Sat', usage: 300 },
  { name: 'Sun', usage: 200 },
];

interface AdminDashboardProps {
  staffList: User[];
  onStaffUpdate: (newStaff: User[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ staffList, onStaffUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualUser, setManualUser] = useState({ firstName: '', lastName: '' });

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Handle both \n and \r\n line endings
      const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
      const newStaff: User[] = [];
      let errors = 0;

      // Robust CSV row splitter that handles quoted fields
      const splitCsvRow = (row: string) => {
        const result = [];
        let curField = "";
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            result.push(curField.trim());
            curField = "";
          } else curField += char;
        }
        result.push(curField.trim());
        return result;
      };

      rows.forEach((row, index) => {
        // Skip header if it looks like one
        if (index === 0 && (row.toLowerCase().includes('email') || row.toLowerCase().includes('name'))) return;

        const columns = splitCsvRow(row);
        
        if (columns.length >= 3) {
          const lastNameRaw = columns[0].replace(/^["']|["']$/g, '').trim();
          const firstNameRaw = columns[1].replace(/^["']|["']$/g, '').trim();
          const emailRaw = columns[2].replace(/^["']|["']$/g, '').trim();
          
          if (lastNameRaw && firstNameRaw && emailRaw.includes('@naseni.gov.ng')) {
            newStaff.push({
              firstName: firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1).toLowerCase(),
              lastName: lastNameRaw.charAt(0).toUpperCase() + lastNameRaw.slice(1).toLowerCase(),
              email: emailRaw.toLowerCase(),
              role: UserRole.MEMBER
            });
          } else {
            errors++;
          }
        } else {
          errors++;
        }
      });

      if (newStaff.length > 0) {
        const combined = [...staffList, ...newStaff];
        // Deduplicate
        const uniqueList = combined.filter((v, i, a) => a.findIndex(t => t.email.toLowerCase() === v.email.toLowerCase()) === i);
        onStaffUpdate(uniqueList);
        alert(`Successfully imported ${newStaff.length} members. ${errors > 0 ? `Failed to parse ${errors} rows.` : ''}`);
      } else {
        alert(`No valid NASENI records found in CSV. Check email format and columns.`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName } = manualUser;
    if (!firstName.trim() || !lastName.trim()) return;

    const lastNameClean = lastName.trim().toLowerCase();
    const firstNameClean = firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1).toLowerCase();
    const officialEmail = `${lastNameClean}.${firstNameClean}@naseni.gov.ng`.toLowerCase();

    if (staffList.some(s => s.email.toLowerCase() === officialEmail)) {
      alert("This member is already registered.");
      return;
    }

    const newUser: User = {
      firstName: firstNameClean,
      lastName: lastNameClean.charAt(0).toUpperCase() + lastNameClean.slice(1),
      email: officialEmail,
      role: UserRole.MEMBER
    };

    onStaffUpdate([...staffList, newUser]);
    setManualUser({ firstName: '', lastName: '' });
    setShowManualForm(false);
  };

  const handleDownloadTemplate = () => {
    const csvContent = "LastName,FirstName,Email\nmusa,Danladi,danladi.musa@naseni.gov.ng\nisah,Mary,mary.isah@naseni.gov.ng";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "naseni_staff_template.csv");
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Console</h2>
          <p className="text-zinc-500 text-sm mt-1">Infrastructure Management & Directory Control</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Registered Staff', value: staffList.length.toString(), trend: 'LIVE', color: 'blue' },
          { label: 'Cloud Projects', value: '482', trend: '+12%', color: 'purple' },
          { label: 'System Uptime', value: '99.9%', trend: 'STABLE', color: 'green' },
          { label: 'Storage Usage', value: '1.4GB', trend: 'LOW', color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className="studio-glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3">{stat.label}</p>
            <div className="flex items-end justify-between relative z-10">
              <h3 className="text-3xl font-bold">{stat.value}</h3>
              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/10`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 studio-glass p-8 rounded-[2rem] border border-white/5 flex flex-col min-h-[400px]">
          <h3 className="text-xl font-bold mb-8">Platform Analytics</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: 'none', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="usage" stroke="#3b82f6" fill="#3b82f620" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="studio-glass p-8 rounded-[2rem] border border-white/5 flex flex-col gap-6">
          <h3 className="text-xl font-bold">Directory Admin</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Import committee members from CSV files or add them manually.</p>
          
          {!showManualForm ? (
            <div className="space-y-3">
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleCsvUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-full py-4 bg-white text-black font-bold rounded-2xl text-xs hover:bg-zinc-200 transition-all"
              >
                Upload CSV
              </button>
              <button 
                onClick={() => setShowManualForm(true)}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold hover:bg-white/10"
              >
                Manual Add
              </button>
              <button onClick={handleDownloadTemplate} className="w-full py-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest hover:text-white">
                Download Template
              </button>
            </div>
          ) : (
            <form onSubmit={handleManualAdd} className="space-y-4">
              <input 
                type="text" 
                placeholder="First Name"
                required
                value={manualUser.firstName}
                onChange={(e) => setManualUser({...manualUser, firstName: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
              />
              <input 
                type="text" 
                placeholder="Last Name"
                required
                value={manualUser.lastName}
                onChange={(e) => setManualUser({...manualUser, lastName: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowManualForm(false)} className="flex-1 py-2 bg-white/5 rounded-xl text-[10px] font-bold border border-white/10">CANCEL</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 rounded-xl text-[10px] font-bold">CONFIRM</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
