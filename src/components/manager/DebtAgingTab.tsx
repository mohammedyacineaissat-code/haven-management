import React, { useMemo } from 'react';
import { useNexiaStore } from '../../store/useNexiaStore';
import { AlertCircle, User, Phone, Wallet, MessageCircle } from 'lucide-react';

interface DebtAgingTabProps {
  buildingId: string;
  totalUnits: number;
  monthlyCharge: number;
}

export const DebtAgingTab: React.FC<DebtAgingTabProps> = ({ buildingId, totalUnits, monthlyCharge }) => {
  const paymentLedger = useNexiaStore(state => state.paymentLedger);
  const registeredAccounts = useNexiaStore(state => state.registeredAccounts);
  
  const buildingLedger = paymentLedger[buildingId] || [];
  const buildingResidents = registeredAccounts.filter(r => r.buildingId === buildingId);

  // Compute debt per apartment
  const debtData = useMemo(() => {
    const today = new Date();
    const last6Months: string[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      last6Months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const data = [];
    for (let i = 1; i <= totalUnits; i++) {
      const aptNumber = `Apt ${i}`;
      let missedMonths = 0;
      let totalDebt = 0;
      
      const aptPayments = buildingLedger.filter(p => p.aptNumber === aptNumber);
      
      last6Months.forEach(period => {
        const hasPaid = aptPayments.some(p => p.period === period);
        if (!hasPaid) {
          missedMonths++;
          totalDebt += monthlyCharge;
        }
      });
      
      if (missedMonths > 0) {
        const resident = buildingResidents.find(r => r.aptNumber.trim() === `${i}` || r.aptNumber.trim() === aptNumber);
        data.push({
          aptNumber,
          missedMonths,
          totalDebt,
          resident
        });
      }
    }
    
    // Sort by largest debt first
    return data.sort((a, b) => b.totalDebt - a.totalDebt);
  }, [buildingLedger, buildingResidents, totalUnits, monthlyCharge]);

  if (debtData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aucune Créance</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Tous les résidents sont à jour pour les 6 derniers mois !</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            État des Créances (6 derniers mois)
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Classement des impayés par appartement.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appartement</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Résident</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mois Impayés</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Dette Totale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {debtData.map((row, idx) => (
              <tr key={row.aptNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    {row.aptNumber}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {row.resident ? (
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {row.resident.firstName} {row.resident.lastName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {row.resident.phone}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Non inscrit</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                    row.missedMonths >= 3 ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}>
                    {row.missedMonths} mois
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-black text-slate-900 dark:text-white font-mono">
                      {row.totalDebt.toLocaleString()} DA
                    </span>
                    {row.resident && row.resident.phone && (
                      <button
                        onClick={() => {
                          const msg = `مرحباً ${row.resident?.firstName}،\nهذا تذكير ودي من NEXIA Syndic بخصوص مستحقات العمارة الخاصة بشقتكم ${row.aptNumber}.\nلديكم ${row.missedMonths} أشهر غير مدفوعة بإجمالي ${row.totalDebt.toLocaleString()} دج.\nيرجى تسوية وضعيتكم في أقرب وقت. شكراً.`;
                          const url = `https://wa.me/213${row.resident?.phone.replace(/^0/, '')}?text=${encodeURIComponent(msg)}`;
                          window.open(url, '_blank');
                        }}
                        className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-400 rounded-full transition-colors"
                        title="Envoyer un rappel par WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
