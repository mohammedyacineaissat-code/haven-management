import React from 'react';
import { useNexiaStore } from '../../../store/useNexiaStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { 
  Building2, 
  ShieldCheck, 
  Droplets, 
  Shirt, 
  TrendingUp, 
  Users, 
  AlertCircle,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Activity
} from 'lucide-react';

const KpiCard = ({ title, value, change, icon: Icon, colorClass }: any) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
        <ArrowUpRight className="w-3 h-3 mr-1" />
        {change}
      </span>
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">{title}</h3>
    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
  </div>
);

export const NexiaDashboard = () => {
  const { buildings, activeIncidents, finances, employees, paymentLedger } = useNexiaStore();
  const { t } = useLanguageStore();

  const totalRevenue = Object.values(finances).reduce((sum, f) => {
    return sum + (f.monthlyCharge * (f.paidApts?.length || 0));
  }, 0);

  const activeContracts = buildings.length;
  const activeAgents = employees.length;

  const today = new Date();
  const currentPeriod = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const recentActivity = [
    { id: 1, title: t.nexia_dashboard.mock_activity_1_title, desc: t.nexia_dashboard.mock_activity_1_desc, time: t.nexia_dashboard.mock_activity_1_time, icon: Droplets, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10' },
    { id: 2, title: t.nexia_dashboard.mock_activity_2_title, desc: t.nexia_dashboard.mock_activity_2_desc, time: t.nexia_dashboard.mock_activity_2_time, icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { id: 3, title: t.nexia_dashboard.mock_activity_3_title, desc: t.nexia_dashboard.mock_activity_3_desc, time: t.nexia_dashboard.mock_activity_3_time, icon: Shirt, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  ];

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
          change="+14%" 
          icon={TrendingUp} 
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
        />
        <KpiCard 
          title={t.nexia_dashboard.kpi_contracts} 
          value={activeContracts.toString()} 
          change="+3" 
          icon={Building2} 
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
        />
        <KpiCard 
          title={t.nexia_dashboard.kpi_agents} 
          value={activeAgents.toString()} 
          change="+2" 
          icon={Users} 
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
        />
        <KpiCard 
          title={t.nexia_dashboard.kpi_incidents} 
          value={activeIncidents.length.toString()} 
          change="-1" 
          icon={AlertCircle} 
          colorClass="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.nexia_dashboard.chart_revenue_by_pole}</h2>
            <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold px-4 py-2 outline-none cursor-pointer">
              <option>{t.nexia_dashboard.filter_this_year}</option>
              <option>{t.nexia_dashboard.filter_year_1}</option>
              <option>{t.nexia_dashboard.filter_year_3}</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end gap-2 sm:gap-6 justify-between mt-4">
            {/* Simple CSS Bar Chart Simulation */}
            {[
              { label: t.nexia_dashboard.month_jan, sec: 40, imm: 30, net: 20, bla: 10 },
              { label: t.nexia_dashboard.month_feb, sec: 45, imm: 30, net: 25, bla: 12 },
              { label: t.nexia_dashboard.month_mar, sec: 50, imm: 30, net: 22, bla: 15 },
              { label: t.nexia_dashboard.month_apr, sec: 55, imm: 35, net: 28, bla: 20 },
              { label: t.nexia_dashboard.month_may, sec: 60, imm: 35, net: 35, bla: 25 },
              { label: t.nexia_dashboard.month_jun, sec: 80, imm: 40, net: 40, bla: 30 },
            ].map((col, idx) => (
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

        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.nexia_dashboard.recent_activity_title}</h2>
          </div>
          
          <div className="flex-1 space-y-6">
            {recentActivity.map((activity) => (
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
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
                          <AlertCircle className="w-3.5 h-3.5" />
                          {bIncidents.length}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {building.status === 'alert' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Activity className="w-4 h-4" /> {t.nexia_dashboard.status_alert}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle className="w-4 h-4" /> {t.nexia_dashboard.status_normal}
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
