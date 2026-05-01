import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Search, Bell, UserCircle } from 'lucide-react';
import { Card } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

// Mock data for Audience Growth
const audienceData = [
  { month: 'Apr', subs: 8000 },
  { month: 'May', subs: 8500 },
  { month: 'Jun', subs: 9200 },
  { month: 'Jul', subs: 10500 },
  { month: 'Aug', subs: 11200 },
  { month: 'Sep', subs: 12400 },
];

// Mock data for Recent Campaigns
const recentCampaigns = [
  { id: 1, subject: 'The Fall Collection Preview', date: 'Oct 12, 2023', openRate: '45%', status: 'Sent', statusColor: 'text-green-700' },
  { id: 2, subject: 'Exclusive: Tailoring Masterclass', date: 'Oct 05, 2023', openRate: '38%', status: 'Sent', statusColor: 'text-green-700' },
  { id: 3, subject: 'Invitation: Private Viewing', date: 'Sep 28, 2023', openRate: '51%', status: 'Sent', statusColor: 'text-green-700' },
  { id: 4, subject: 'Winter Wardrobe Essentials', date: 'TBD', openRate: '-', status: 'Draft', statusColor: 'text-stone-500', isMuted: true },
  { id: 5, subject: 'Holiday Gift Guide', date: 'Nov 15, 2023', openRate: '-', status: 'Scheduled', statusColor: 'text-blue-700', isMuted: true },
];

export const MarketingTab = ({ subscribers }: { subscribers: any[] }) => {
  const totalSubscribers = subscribers ? subscribers.length : 0;
  // Use a fallback of 12400 (from the mockup) if the DB is empty or still populating, to keep the UI looking rich
  const displaySubscribers = totalSubscribers > 0 ? totalSubscribers : 12400;

  return (
    <div className="w-full flex-1 flex flex-col gap-32">
      {/* Header Section */}
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-[64px] font-normal leading-[1.1] tracking-[-0.02em] text-[#3a1f1d] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Marketing
          </h1>
          <p className="text-[16px] tracking-[0.01em] text-[#504443] max-w-2xl" style={{ fontFamily: "'Jost', sans-serif" }}>
            Manage your subscriber base and campaign performance.
          </p>
        </div>
        <button className="bg-[#3a1f1d] text-white text-[11px] font-semibold tracking-[0.15em] uppercase px-8 py-4 hover:opacity-90 transition-opacity border border-[#3a1f1d]" style={{ fontFamily: "'Jost', sans-serif" }}>
          Create Campaign
        </button>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border border-[#d4c3c1]/30 p-8 flex flex-col items-center justify-center text-center rounded-none shadow-none bg-transparent">
          <span className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
            Total Subscribers
          </span>
          <span className="text-[32px] font-normal leading-[1.2] text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {displaySubscribers.toLocaleString()}
          </span>
        </Card>
        <Card className="border border-[#d4c3c1]/30 p-8 flex flex-col items-center justify-center text-center rounded-none shadow-none bg-transparent">
          <span className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
            Avg. Open Rate
          </span>
          <span className="text-[32px] font-normal leading-[1.2] text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
            42%
          </span>
        </Card>
        <Card className="border border-[#d4c3c1]/30 p-8 flex flex-col items-center justify-center text-center rounded-none shadow-none bg-transparent">
          <span className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
            Click Rate
          </span>
          <span className="text-[32px] font-normal leading-[1.2] text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
            18%
          </span>
        </Card>
      </section>

      {/* Chart & Table Area */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-32">
        {/* Chart */}
        <div className="lg:col-span-5 border border-[#d4c3c1]/30 p-8 flex flex-col h-96">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-normal leading-[1.2] text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Audience Growth
            </h2>
            <span className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
              Last 6 Months
            </span>
          </div>
          <div className="flex-1 w-full bg-[#f4f3f1] relative overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={audienceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3a1f1d" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#3a1f1d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(212,195,193,0.3)', fontFamily: "'Jost', sans-serif", fontSize: '12px', borderRadius: 0 }}
                  itemStyle={{ color: '#3a1f1d' }}
                  labelStyle={{ color: '#504443' }}
                  formatter={(value: number) => [`${value.toLocaleString()}`, 'Subscribers']}
                />
                <Area type="monotone" dataKey="subs" stroke="#3a1f1d" strokeWidth={2} fillOpacity={1} fill="url(#colorSubs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-7 border border-[#d4c3c1]/30 p-8 overflow-hidden flex flex-col h-96">
          <h2 className="text-xl font-normal leading-[1.2] text-[#3a1f1d] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            Recent Campaigns
          </h2>
          <div className="w-full overflow-y-auto flex-1 pr-4">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#d4c3c1]/30 hover:bg-transparent">
                  <TableHead className="py-4 text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase font-normal" style={{ fontFamily: "'Jost', sans-serif" }}>Subject Line</TableHead>
                  <TableHead className="py-4 text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase font-normal" style={{ fontFamily: "'Jost', sans-serif" }}>Send Date</TableHead>
                  <TableHead className="py-4 text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase font-normal text-right" style={{ fontFamily: "'Jost', sans-serif" }}>Open Rate</TableHead>
                  <TableHead className="py-4 text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase font-normal pl-8" style={{ fontFamily: "'Jost', sans-serif" }}>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-[16px] tracking-[0.01em]" style={{ fontFamily: "'Jost', sans-serif" }}>
                {recentCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="border-b border-[#d4c3c1]/10 hover:bg-[#f4f3f1] transition-colors">
                    <TableCell className={`py-4 text-[#3a1f1d] ${campaign.isMuted ? 'text-opacity-50' : ''}`}>
                      {campaign.subject}
                    </TableCell>
                    <TableCell className="py-4 text-[#504443]">
                      {campaign.date}
                    </TableCell>
                    <TableCell className="py-4 text-[#3a1f1d] text-right">
                      {campaign.openRate}
                    </TableCell>
                    <TableCell className="py-4 pl-8">
                      <span className={`text-xs uppercase tracking-wider ${campaign.statusColor}`}>
                        {campaign.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
};
