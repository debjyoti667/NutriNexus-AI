import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import FoodScanner from './components/FoodScanner';
import MealPlanner from './components/MealPlanner';
import { LayoutGrid, Camera, Utensils, User, LogOut, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const { user, profile, loading, login, logout, setProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scan' | 'plan' | 'profile'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6 text-center space-y-12">
        <div className="space-y-4">
          <div className="inline-flex p-4 bg-brand-green/10 rounded-3xl mb-4">
            <Sparkles className="w-12 h-12 text-brand-green" />
          </div>
          <h1 className="text-5xl font-serif font-bold text-brand-green tracking-tight leading-none">NutriNexus<br/><span className="text-brand-brown">AI</span></h1>
          <p className="text-brand-text-muted max-w-xs mx-auto font-medium">Your personal AI nutrition co-pilot for smarter choice & better habits.</p>
        </div>
        
        <div className="w-full max-w-sm space-y-4">
          <button 
            onClick={login}
            className="w-full py-5 bg-brand-green text-white rounded-3xl font-bold shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 invert pr-1" alt="Google" />
            <span>Connect with Google</span>
          </button>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Safe • Private • AI-Powered</p>
        </div>
      </div>
    );
  }

  if (profile && !profile.onboardingComplete) {
    return <Onboarding profile={profile} onComplete={() => setProfile({ ...profile, onboardingComplete: true })} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard userId={user.uid} profile={profile} />;
      case 'scan': return <FoodScanner userId={user.uid} />;
      case 'plan': return <MealPlanner profile={profile} />;
      case 'profile': return (
        <div className="space-y-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-brand-green/10 flex items-center justify-center text-3xl font-display font-bold text-brand-green relative overflow-hidden">
              {user.photoURL ? <img src={user.photoURL} alt="User" /> : profile?.displayName?.[0]}
            </div>
            <div className="text-center">
               <h2 className="text-2xl font-serif font-bold text-brand-green">{profile?.displayName}</h2>
               <p className="text-brand-text-muted font-medium">{profile?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm space-y-4">
                <p className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest">Selected Goals</p>
                <div className="flex flex-wrap gap-2">
                   {profile?.healthGoals?.map((goal: string) => (
                     <span key={goal} className="px-3 py-1 bg-brand-green/5 text-brand-green rounded-full text-xs font-bold">{goal}</span>
                   ))}
                </div>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm space-y-4">
                <p className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest">Meal Budget</p>
                <p className="text-2xl font-serif font-bold text-brand-green">₹{profile?.budgetLimit}</p>
             </div>
          </div>

          <button 
            onClick={logout}
            className="w-full py-4 border-2 border-brand-green/10 text-brand-green rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream max-w-md mx-auto relative overflow-hidden flex flex-col">
      <main className="flex-1 p-6 pt-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="bg-white/80 backdrop-blur-xl border-t border-brand-border p-4 pb-8 flex items-center justify-around rounded-t-3xl shadow-2xl relative z-50">
        {[
          { id: 'dashboard', icon: LayoutGrid, label: 'Feed' },
          { id: 'scan', icon: Camera, label: 'Scan' },
          { id: 'plan', icon: Utensils, label: 'Plan' },
          { id: 'profile', icon: User, label: 'Me' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={cn(
              "flex flex-col items-center space-y-1 transition-all",
              activeTab === item.id ? "text-brand-green" : "text-brand-text-muted/60"
            )}
          >
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-300",
              activeTab === item.id ? "bg-brand-green/10 scale-110" : ""
            )}>
              <item.icon className="w-6 h-6 shrink-0" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

