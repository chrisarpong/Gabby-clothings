import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Mail, MousePointer } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const audienceData = [
  { month: 'Apr', subs: 8000 },
  { month: 'May', subs: 8500 },
  { month: 'Jun', subs: 9200 },
  { month: 'Jul', subs: 10500 },
  { month: 'Aug', subs: 11200 },
  { month: 'Sep', subs: 12400 },
];

const recentCampaigns = [
  { id: 1, subject: 'The Fall Collection Preview', date: 'Oct 12, 2023', openRate: '45%', status: 'Sent', statusColor: 'text-emerald-600' },
  { id: 2, subject: 'Exclusive: Tailoring Masterclass', date: 'Oct 05, 2023', openRate: '38%', status: 'Sent', statusColor: 'text-emerald-600' },
  { id: 3, subject: 'Invitation: Private Viewing', date: 'Sep 28, 2023', openRate: '51%', status: 'Sent', statusColor: 'text-emerald-600' },
  { id: 4, subject: 'Winter Wardrobe Essentials', date: 'TBD', openRate: '-', status: 'Draft', statusColor: 'text-[#3a1f1d]/30' },
  { id: 5, subject: 'Holiday Gift Guide', date: 'Nov 15, 2023', openRate: '-', status: 'Scheduled', statusColor: 'text-blue-600' },
];

const statusBadgeColors: Record<string, string> = {
  Sent: 'bg-emerald-50 text-emerald-700',
  Draft: 'bg-[#3a1f1d]/5 text-[#3a1f1d]/50',
  Scheduled: 'bg-blue-50 text-blue-700',
};

export const MarketingTab = ({ subscribers }: { subscribers: any[] }) => {
  const totalSubscribers = subscribers ? subscribers.length : 0;
  const displaySubscribers = totalSubscribers > 0 ? totalSubscribers : 12400;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Marketing
          </h2>
          <p className="text-sm text-[#3a1f1d]/60 mt-1">Manage campaigns and subscriber analytics</p>
        </div>
        <button className="bg-[#3a1f1d] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#2C1816] transition-colors">
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-6 border border-[#3a1f1d]/8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Subscribers</span>
            <div className="w-8 h-8 rounded-lg bg-[#3a1f1d]/5 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#3a1f1d]" />
            </div>
          </div>
          <span className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {displaySubscribers.toLocaleString()}
          </span>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#3a1f1d]/8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Avg Open Rate</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <span className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            42%
          </span>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#3a1f1d]/8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Click Rate</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <MousePointer className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <span className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            18%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-[#2C1816]">Audience Growth</h3>
            <span className="text-xs text-[#3a1f1d]/50">Last 6 months</span>
          </div>
          <div className="h-56 bg-[#F5F2EE] rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={audienceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3a1f1d" stopOpacity={0.15}/>
                    <stop offset="100%" stopColor="#3a1f1d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e8e4e2', borderRadius: '8px', fontFamily: "'Jost', sans-serif", fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#3a1f1d' }}
                  labelStyle={{ color: '#8B7D7B' }}
                  formatter={(value: any) => [`${value.toLocaleString()}`, 'Subscribers']}
                />
                <Area type="monotone" dataKey="subs" stroke="#3a1f1d" strokeWidth={2} fillOpacity={1} fill="url(#colorSubs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm">
          <div className="p-6 pb-4">
            <h3 className="text-sm font-semibold text-[#2C1816]">Recent Campaigns</h3>
          </div>
          <div className="max-h-56 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#3a1f1d]/8 hover:bg-transparent">
                  <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Subject</TableHead>
                  <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Date</TableHead>
                  <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide text-right">Open Rate</TableHead>
                  <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="border-b border-[#3a1f1d]/5 hover:bg-[#FDFBF9] transition-colors">
                    <TableCell className="py-3 px-6 font-medium text-[#2C1816]">
                      {campaign.subject}
                    </TableCell>
                    <TableCell className="py-3 px-6 text-sm text-[#3a1f1d]/60">
                      {campaign.date}
                    </TableCell>
                    <TableCell className="py-3 px-6 text-right text-sm font-medium text-[#2C1816]">
                      {campaign.openRate}
                    </TableCell>
                    <TableCell className="py-3 px-6 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeColors[campaign.status] || 'bg-gray-50 text-gray-600'}`}>
                        {campaign.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};
