import re

with open('src/apps/manager/dashboard/NexiaDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace recentActivity
dynamic_recent_activity = """
  // Dynamic Recent Activity from resolved incidents
  const recentActivity = resolvedIncidents.slice(0, 5).map(inc => {
    let Icon = AlertCircle;
    let color = 'text-slate-500';
    let bg = 'bg-slate-50 dark:bg-slate-500/10';
    
    if (inc.category === 'water') {
      Icon = Droplets; color = 'text-sky-500'; bg = 'bg-sky-50 dark:bg-sky-500/10';
    } else if (inc.category === 'security') {
      Icon = ShieldCheck; color = 'text-amber-500'; bg = 'bg-amber-50 dark:bg-amber-500/10';
    } else if (inc.category === 'power') {
      Icon = Activity; color = 'text-indigo-500'; bg = 'bg-indigo-50 dark:bg-indigo-500/10';
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
"""

old_recent = """  const recentActivity = [
    { id: 1, title: t.nexia_dashboard.mock_activity_1_title, desc: t.nexia_dashboard.mock_activity_1_desc, time: t.nexia_dashboard.mock_activity_1_time, icon: Droplets, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10' },
    { id: 2, title: t.nexia_dashboard.mock_activity_2_title, desc: t.nexia_dashboard.mock_activity_2_desc, time: t.nexia_dashboard.mock_activity_2_time, icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { id: 3, title: t.nexia_dashboard.mock_activity_3_title, desc: t.nexia_dashboard.mock_activity_3_desc, time: t.nexia_dashboard.mock_activity_3_time, icon: Shirt, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  ];"""
content = content.replace(old_recent, dynamic_recent_activity.strip())

# 2. Add dynamic chart data logic
dynamic_chart_logic = """
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
"""
content = content.replace("  return (", dynamic_chart_logic.strip(), 1)

# 3. Replace the static array in the chart mapping
old_chart = """            {[
              { label: t.nexia_dashboard.month_jan, sec: 40, imm: 30, net: 20, bla: 10 },
              { label: t.nexia_dashboard.month_feb, sec: 45, imm: 30, net: 25, bla: 12 },
              { label: t.nexia_dashboard.month_mar, sec: 50, imm: 30, net: 22, bla: 15 },
              { label: t.nexia_dashboard.month_apr, sec: 55, imm: 35, net: 28, bla: 20 },
              { label: t.nexia_dashboard.month_may, sec: 60, imm: 35, net: 35, bla: 25 },
              { label: t.nexia_dashboard.month_jun, sec: 80, imm: 40, net: 40, bla: 30 },
            ].map((col, idx) => ("""
content = content.replace(old_chart, "            {chartData.map((col, idx) => (")

# 4. Add useNexiaStore import for resolvedIncidents if missing
if 'resolvedIncidents' not in content:
    content = content.replace('const { buildings, activeIncidents, finances, employees, paymentLedger } = useNexiaStore();',
                              'const { buildings, activeIncidents, resolvedIncidents, finances, employees, paymentLedger } = useNexiaStore();')

with open('src/apps/manager/dashboard/NexiaDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Dashboard!")
