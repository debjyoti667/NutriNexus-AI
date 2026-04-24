import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Activity, Flame, TrendingUp, Calendar, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { getHabitNudge } from '../lib/gemini';

export default function Dashboard({ userId, profile }: { userId: string, profile: any }) {
  const [meals, setMeals] = useState<any[]>([]);
  const [nudge, setNudge] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const q = query(
        collection(db, 'meals'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const mealsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMeals(mealsData);

      if (mealsData.length > 2) {
        const nudgeData = await getHabitNudge(mealsData);
        setNudge(nudgeData);
      }
      setLoading(false);
    }
    fetchData();
  }, [userId]);

  const stats = [
    { label: 'Wellness Score', value: '84', icon: Activity, color: 'text-brand-brown' },
    { label: 'Daily Energy', value: '1,240', unit: 'kcal', icon: Flame, color: 'text-orange-500' },
    { label: 'Streak', value: '5', unit: 'days', icon: TrendingUp, color: 'text-blue-500' },
  ];

  const macroData = [
    { name: 'Protein', value: 30, color: '#5F7161' },
    { name: 'Carbs', value: 45, color: '#AF8C72' },
    { name: 'Fats', value: 25, color: '#D1CEC8' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-brand-text-muted font-medium">Welcome back,</p>
          <h1 className="text-3xl font-serif font-bold text-brand-green">{profile?.displayName?.split(' ')[0]}</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest">Today's Goal</p>
          <p className="text-brand-brown font-bold">Stay Active</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-white p-4 rounded-3xl shadow-sm border border-brand-green/5 space-y-1"
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-serif font-bold text-brand-green">{stat.value}</span>
              {stat.unit && <span className="text-[10px] text-brand-text-muted font-bold">{stat.unit}</span>}
            </div>
            <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-tighter">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {nudge && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-brand-green text-white p-6 rounded-3xl shadow-lg relative overflow-hidden"
        >
          <Zap className="absolute top-2 right-2 w-12 h-12 text-white/10" />
          <h3 className="font-serif font-bold text-brand-brown mb-2 flex items-center space-x-2">
             <Zap className="w-4 h-4" />
             <span>AI Insight</span>
          </h3>
          <p className="font-semibold text-lg leading-tight mb-4">{nudge.nudge}</p>
          <div className="flex space-x-2">
            {nudge.suggestions.map((s: string) => (
              <span key={s} className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">{s}</span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-border space-y-4">
          <h3 className="font-serif font-bold text-brand-green text-lg tracking-tight">Macro Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-500">
             {macroData.map(m => (
               <div key={m.name} className="flex items-center space-x-1">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                 <span>{m.name}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-border space-y-4">
          <h3 className="font-serif font-bold text-brand-green text-lg tracking-tight">Recent Activity</h3>
          <div className="space-y-4">
            {meals.slice(0, 3).map((meal, i) => (
              <div key={meal.id} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-green font-bold">
                  {meal.healthScore}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-brand-green">{meal.foodName}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {meal.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-green">{meal.nutrition?.calories} kcal</p>
                </div>
              </div>
            ))}
            {meals.length === 0 && (
              <p className="text-gray-400 text-sm italic py-4">No meals logged yet. Start scanning!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
