import React from 'react';
import { useNexiaStore } from '../../../store/useNexiaStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { Buildings, ShieldCheck, Drop, TShirt, TrendUp, Users, WarningCircle, ArrowUpRight, Clock, CheckCircle, Pulse } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

const KpiCard = ({ title, value, change, icon: Icon, colorClass, sparklineColor, delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
    whileHover={{ y: -6, scale: 1.02 }}
    className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] p-7 border border-white/60 dark:border-white/10 shadow-apple hover:shadow-apple-hover dark:shadow-apple-dark dark:hover:shadow-apple-dark-hover flex flex-col relative overflow-hidden group transition-all duration-500"
  >
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-4 rounded-[1.5rem] ${colorClass} shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
        <ArrowUpRight weight="duotone" className="w-3 h-3 mr-1" />
        {change}
      </span>
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1 relative z-10">{title}</h3>
    <motion.p 
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, delay: delay + 0.2 }}
      className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10"
    >
      {value}
    </motion.p>
    
    {/* Sparkline background */}
    <div className="absolute bottom-0 left-0 w-full h-16 opacity-10 dark:opacity-[0.15] group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity pointer-events-none">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0,30 L0,20 C20,25 40,10 60,15 C80,20 90,5 100,0 L100,30 Z" fill={sparklineColor} />
      </svg>
    </div>
  </motion.div>
);

export const NexiaDashboard = () => {
  const { buildings, activeIncidents, resolvedIncidents, finances, employees, paymentLedger } = useNexiaStore();
  const { t } = useLanguageStore();

  const totalRevenue = Object.values(finances).reduce((sum, f) => {
    return sum + (f.monthlyCharge * (f.paidApts?.length || 0));
  }, 0);

  const activeContracts = buildings.length;
  const activeAgents = employees.length;

  const today = new Date();
  const currentPeriod = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // Dynamic Recent Pulse from resolved incidents
  const recentActivity = resolvedIncidents.slice(0, 5).map((inc: any) => {
    let Icon = WarningCircle;
    let color = 'text-slate-500';
    let bg = 'bg-slate-50 dark:bg-slate-500/10';
    
    if (inc.category === 'water') {
      Icon = Drop; color = 'text-sky-500'; bg = 'bg-sky-50 dark:bg-sky-500/10';
    } else if (inc.category === 'security') {
      Icon = ShieldCheck; color = 'text-amber-500'; bg = 'bg-amber-50 dark:bg-amber-500/10';
    } else if (inc.category === 'power') {
      Icon = Pulse; color = 'text-indigo-500'; bg = 'bg-indigo-50 dark:bg-indigo-500/10';
    }

    return {
      id: inc.id,
      title: inc.title,
      desc: inc.description.substring(0, 50) + '...',
      time: new Date(inc.createdAt).toLocaleDateString(),
      icon: Icon,
      color,
      bg
    };
  });

const chartData = React.useMemo(() => {
    const months = [
      t.nexia_dashboard.month_jan, t.nexia_dashboard.month_feb, 
      t.nexia_dashboard.month_mar, t.nexia_dashboard.month_apr, 
      t.nexia_dashboard.month_may, t.nexia_dashboard.month_jun
    ];
    // Mocking the relative variation based on totalRevenue for visual effect
    return months.map((label, idx) => {
      const base = 20 + (idx * 5) + (totalRevenue > 0 ? (totalRevenue % 10) : 0);
      return {
        label,
        sec: Math.min(100, base + 20),
        imm: Math.min(100, base + 5),
        net: Math.min(100, base),
        bla: Math.min(100, base - 10)
      };
    });
  }, [t, totalRevenue]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          {t.nexia_dashboard.overview_title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t.nexia_dashboard.overview_subtitle}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title={t.nexia_dashboard.kpi_revenue} 
          value={`${totalRevenue.toLocaleString()} DA`} 
          change={totalRevenue > 0 ? `${buildings.length} bldg` : '—'} 
          icon={TrendUp} 
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
          sparklineColor="#f59e0b"
          delay={0.1}
        />
        <KpiCard 
          title={t.nexia_dashboard.kpi_contracts} 
          value={activeContracts.toString()} 
          change={`${buildings.filter(b => b.status === 'operational').length} actifs`} 
          icon={Buildings} 
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
          sparklineColor="#3b82f6"
          delay={0.2}
        />
        <KpiCard 
          title={t.nexia_dashboard.kpi_agents} 
          value={activeAgents.toString()} 
          change={`${employees.filter(e => e.status === 'active').length} actifs`}
          icon={Users} 
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
          sparklineColor="#10b981"
          delay={0.3}
        />
        <KpiCard 
          title={t.nexia_dashboard.kpi_incidents} 
          value={activeIncidents.length.toString()} 
          change={resolvedIncidents.length > 0 ? `${resolvedIncidents.length} résolus` : '—'}
          icon={WarningCircle} 
          colorClass="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
          sparklineColor="#f43f5e"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8 border border-white/60 dark:border-white/10 shadow-apple dark:shadow-apple-dark transition-all">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.nexia_dashboard.chart_revenue_by_pole}</h2>
            <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold px-4 py-2 outline-none cursor-pointer">
              <option>{t.nexia_dashboard.filter_this_year}</option>
              <option>{t.nexia_dashboard.filter_year_1}</option>
              <option>{t.nexia_dashboard.filter_year_3}</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end gap-2 sm:gap-6 justify-between mt-4">
            {/* Simple CSS Bar Chart Simulation */}
            {chartData.map((col, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 group">
                <div className="w-full max-w-[40px] h-full flex flex-col justify-end gap-1">
                  <div style={{ height: `${col.bla}%` }} className="w-full bg-indigo-400 rounded-sm hover:brightness-110 transition-all cursor-pointer"></div>
                  <div style={{ height: `${col.net}%` }} className="w-full bg-sky-400 rounded-sm hover:brightness-110 transition-all cursor-pointer"></div>
                  <div style={{ height: `${col.imm}%` }} className="w-full bg-amber-400 rounded-sm hover:brightness-110 transition-all cursor-pointer"></div>
                  <div style={{ height: `${col.sec}%` }} className="w-full bg-slate-800 dark:bg-slate-600 rounded-sm hover:brightness-110 transition-all cursor-pointer"></div>
                </div>
                <span className="text-xs font-bold text-slate-400 mt-3 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{col.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400"><div className="w-3 h-3 rounded-full bg-slate-800 dark:bg-slate-600"></div> {t.nexia_dashboard.legend_security}</div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400"><div className="w-3 h-3 rounded-full bg-amber-400"></div> {t.nexia_dashboard.legend_real_estate}</div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400"><div className="w-3 h-3 rounded-full bg-sky-400"></div> {t.nexia_dashboard.legend_cleaning}</div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400"><div className="w-3 h-3 rounded-full bg-indigo-400"></div> {t.nexia_dashboard.legend_laundry}</div>
          </div>
        </div>

        {/* Recent Pulse Feed */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8 border border-white/60 dark:border-white/10 shadow-apple dark:shadow-apple-dark flex flex-col transition-all">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.nexia_dashboard.recent_activity_title}</h2>
          </div>
          
          <div className="flex-1 space-y-6">
            {recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex gap-4 group cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${activity.bg} ${activity.color} group-hover:scale-110 transition-transform`}>
                  <activity.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">{activity.title}</h4>
                  <p className="text-xs text-slate-500 truncate">{activity.desc}</p>
                </div>
                <div className="text-[10px] font-bold text-slate-400 whitespace-nowrap mt-1">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
            {t.nexia_dashboard.view_all_history}
          </button>
        </div>
      </div>

      {/* Portfolio Overview Table */}
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-10 border border-white/60 dark:border-white/10 shadow-apple dark:shadow-apple-dark transition-all">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-2xl">
              <Buildings weight="duotone" className="w-6 h-6" />
            </div>
            {t.nexia_dashboard.portfolio_title}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="pb-3 pr-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.nexia_dashboard.col_residence}</th>
                <th className="pb-3 px-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{t.nexia_dashboard.col_units}</th>
                <th className="pb-3 px-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{t.nexia_dashboard.col_collection}</th>
                <th className="pb-3 px-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{t.nexia_dashboard.col_incidents}</th>
                <th className="pb-3 px-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t.nexia_dashboard.col_status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {buildings.map(building => {
                const ledger = paymentLedger[building.id] || [];
                const paidThisMonth = ledger.filter(p => p.period === currentPeriod).length;
                const collectionRate = building.totalUnits > 0 ? (paidThisMonth / building.totalUnits) * 100 : 0;
                
                const bIncidents = activeIncidents.filter(i => i.buildingId === building.id);
                
                return (
                  <tr key={building.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 pr-4 font-bold text-slate-900 dark:text-white">{building.name}</td>
                    <td className="py-4 px-4 text-center text-slate-600 dark:text-slate-400 font-medium">{building.totalUnits}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 justify-center">
                        <div className="flex-1 max-w-[100px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${collectionRate > 75 ? 'bg-emerald-500' : collectionRate > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, collectionRate)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[3rem] text-right">
                          {Math.round(collectionRate)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {bIncidents.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                          <WarningCircle weight="duotone" className="w-3.5 h-3.5" />
                          {bIncidents.length}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                          Clear
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {building.status === 'alert' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Pulse weight="duotone" className="w-4 h-4" /> {t.nexia_dashboard.status_alert}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle weight="duotone" className="w-4 h-4" /> {t.nexia_dashboard.status_normal}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {buildings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">{t.nexia_dashboard.no_residence}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
