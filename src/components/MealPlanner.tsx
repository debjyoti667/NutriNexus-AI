import React, { useState, useEffect } from 'react';
import { getMealRecommendations } from '../lib/gemini';
import { motion } from 'motion/react';
import { ShoppingBag, Clock, DollarSign, ChefHat, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function MealPlanner({ profile }: { profile: any }) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  const fetchRecommendations = async (mealType: string) => {
    setLoading(true);
    try {
      const data = await getMealRecommendations(profile, `Looking for a healthy ${mealType} option.`);
      setRecommendations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <h2 className="text-3xl font-serif font-bold text-brand-green">Smart Planner</h2>
        <p className="text-brand-text-muted text-sm font-medium">Personalized meal suggestions based on your goals and budget.</p>
      </div>

      <div className="flex justify-between bg-white p-1 rounded-2xl shadow-sm border border-brand-border">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all",
              activeTab === tab ? "bg-brand-green text-white" : "text-brand-text-muted hover:text-brand-green"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 space-y-4">
             <div className="w-12 h-12 border-4 border-brand-brown/20 border-t-brand-green rounded-full animate-spin" />
             <p className="text-brand-green font-bold">Consulting your Nutrition Co-pilot...</p>
          </div>
        ) : (
          recommendations.map((meal, i) => (
            <motion.div 
              key={meal.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-brand-border group hover:border-brand-brown transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-bold text-brand-green group-hover:text-brand-brown transition-colors">{meal.name}</h3>
                  <div className="flex items-center space-x-3 text-xs font-bold text-brand-text-muted uppercase tracking-widest">
                    <span className="flex items-center space-x-1">
                       <Clock className="w-3 h-3" />
                       <span>{meal.prepTime}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-brand-brown">
                       <DollarSign className="w-3 h-3" />
                       <span>Est. ₹{meal.cost}</span>
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-brand-cream rounded-2xl">
                  <ChefHat className="w-5 h-5 text-brand-green" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed italic">"{meal.reason}"</p>
              <button className="w-full py-3 bg-brand-green/5 text-brand-green rounded-xl font-bold hover:bg-brand-green hover:text-white transition-all flex items-center justify-center space-x-2">
                 <ShoppingBag className="w-4 h-4" />
                 <span>Add to Grocery List</span>
              </button>
            </motion.div>
          ))
        )}
      </div>

      <div className="bg-brand-brown/10 p-6 rounded-3xl border border-brand-brown/20 flex items-center space-x-4">
        <div className="p-3 bg-brand-brown rounded-2xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
           <p className="text-brand-green font-bold">Sustainable Habit Tip</p>
           <p className="text-xs text-brand-green/80">Swap your usual midday snack for a handful of almonds to stay full longer.</p>
        </div>
      </div>
    </div>
  );
}
