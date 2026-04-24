import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Target, Wallet, Utensils, ArrowRight } from 'lucide-react';

export default function Onboarding({ profile, onComplete }: { profile: any, onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<string[]>([]);
  const [budget, setBudget] = useState(100);

  const toggleGoal = (goal: string) => {
    setGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  const handleFinish = async () => {
    await updateDoc(doc(db, 'users', profile.uid), {
      healthGoals: goals,
      budgetLimit: budget,
      onboardingComplete: true
    });
    onComplete();
  };

  const goalOptions = [
    'Weight Loss', 'Muscle Gain', 'Increase Energy', 'Diabetes Friendly', 'Heart Healthy', 'Budget Conscious'
  ];

  return (
    <div className="min-h-screen bg-brand-cream p-6 flex flex-col justify-center max-w-md mx-auto">
      <motion.div 
        key={step} 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-serif font-bold text-brand-green">Tell us your goals.</h1>
              <p className="text-brand-text-muted font-medium">Pick any that apply to you.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {goalOptions.map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-4 rounded-3xl border-2 text-left transition-all ${
                    goals.includes(goal) 
                    ? "border-brand-green bg-brand-green text-white" 
                    : "border-brand-border bg-white text-brand-text-muted"
                  }`}
                >
                  <Target className={`w-5 h-5 mb-2 ${goals.includes(goal) ? "text-brand-brown" : "text-brand-border"}`} />
                  <span className="font-bold text-sm leading-tight">{goal}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setStep(2)}
              disabled={goals.length === 0}
              className="w-full py-5 bg-brand-green text-white rounded-3xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-serif font-bold text-brand-green">What's your budget?</h1>
              <p className="text-brand-text-muted font-medium">Target price per healthy meal (₹)</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-border space-y-8">
              <div className="text-6xl font-serif font-bold text-brand-green text-center tracking-tighter">
                ₹{budget}
              </div>
              <input 
                type="range" 
                min="50" 
                max="1000" 
                step="50"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full accent-brand-green h-2 bg-brand-border rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-brand-text-muted uppercase tracking-widest">
                <span>Value</span>
                <span>Premium</span>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <button 
                onClick={handleFinish}
                className="w-full py-5 bg-brand-green text-white rounded-3xl font-bold transition-all"
              >
                Start Journey
              </button>
              <button 
                onClick={() => setStep(1)}
                className="w-full py-3 text-gray-400 font-bold hover:text-brand-green transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
