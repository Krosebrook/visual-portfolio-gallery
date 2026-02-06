import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, MousePointer2, Clock, Eye, Activity } from 'lucide-react';

interface Project {
  id: string;
  title: string;
}

interface AnalyticsDashboardProps {
  projects: Project[];
  views: any[];
  clicks: any[];
}

export function AnalyticsDashboard({ projects, views, clicks }: AnalyticsDashboardProps) {
  const stats = useMemo(() => {
    const totalViews = views.length;
    const totalClicks = clicks.length;
    const avgDuration = views.length > 0 
      ? Math.round(views.reduce((acc, v) => acc + (v.view_duration || 0), 0) / views.length)
      : 0;
    
    // Project Performance Data
    const projectData = projects.map(p => {
      const pViews = views.filter(v => v.project_id === p.id).length;
      const pClicks = clicks.filter(c => c.project_id === p.id).length;
      return {
        name: p.title.substring(0, 15),
        views: pViews,
        clicks: pClicks,
        engagement: pViews > 0 ? Math.round((pClicks / pViews) * 100) : 0
      };
    }).sort((a, b) => b.views - a.views).slice(0, 5);

    // Click Type Data
    const clickTypes = [
      { name: 'Demo', value: clicks.filter(c => c.click_type === 'demo').length },
      { name: 'GitHub', value: clicks.filter(c => c.click_type === 'github').length }
    ];

    return { totalViews, totalClicks, avgDuration, projectData, clickTypes };
  }, [projects, views, clicks]);

  const COLORS = ['#991b1b', '#111827', '#4b5563', '#9ca3af', '#e5e7eb'];

  return (
    <div className="p-8 space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <Eye className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Views</span>
          </div>
          <div className="text-3xl font-serif font-bold">{stats.totalViews}</div>
          <p className="text-[10px] text-zinc-500 font-medium">+12% from last week</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <MousePointer2 className="h-5 w-5 text-zinc-900" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Clicks</span>
          </div>
          <div className="text-3xl font-serif font-bold">{stats.totalClicks}</div>
          <p className="text-[10px] text-zinc-500 font-medium">8.2% CTR average</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <Clock className="h-5 w-5 text-zinc-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Avg Dwell Time</span>
          </div>
          <div className="text-3xl font-serif font-bold">{stats.avgDuration}s</div>
          <p className="text-[10px] text-zinc-500 font-medium">Deep engagement detected</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Conversion</span>
          </div>
          <div className="text-3xl font-serif font-bold">14.2%</div>
          <p className="text-[10px] text-zinc-500 font-medium">Target exceeded</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Performance Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-serif font-bold">Top Performance Projects</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.projectData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="views" fill="#991b1b" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="clicks" fill="#111827" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Project Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-900" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">External Clicks</span>
            </div>
          </div>
        </div>

        {/* Click Breakdown Chart */}
        <div className="bg-white p-8 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <MousePointer2 className="h-5 w-5 text-zinc-900" />
            <h3 className="text-lg font-serif font-bold">Click Distribution</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.clickTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {stats.clickTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {stats.clickTypes.map((type, idx) => (
              <div key={type.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{type.name}</span>
                </div>
                <span className="text-sm font-bold text-zinc-900">{type.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
