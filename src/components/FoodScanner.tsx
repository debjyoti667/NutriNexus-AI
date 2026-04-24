import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, ShoppingCart, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeFoodImage } from '../lib/gemini';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function FoodScanner({ userId }: { userId: string }) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const base64 = image.split(',')[1];
      const data = await analyzeFoodImage(base64);
      setResult(data);
      
      // Save to Firebase
      await addDoc(collection(db, 'meals'), {
        userId,
        foodName: data.foodName,
        nutrition: data.nutrition,
        healthScore: data.healthScore,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-3xl font-serif font-bold text-brand-green">AI Food Scanner</h2>
        <p className="text-brand-text-muted max-w-sm font-medium">Scan your meal to get instant nutritional insights and healthier alternatives.</p>
      </div>

      <div className="flex justify-center">
        {!image ? (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-md aspect-square rounded-3xl border-2 border-dashed border-brand-green/20 bg-white flex flex-col items-center justify-center space-y-3 hover:bg-brand-green/5 transition-colors shadow-sm"
          >
            <div className="p-4 bg-brand-green/10 rounded-full">
              <Camera className="w-8 h-8 text-brand-green" />
            </div>
            <span className="font-medium text-brand-green">Click to Scan or Upload</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="environment"
              onChange={handleImageChange} 
            />
          </button>
        ) : (
          <div className="w-full max-w-md space-y-4">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img src={image} alt="Food to scan" className="w-full h-full object-cover" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
            {!result && (
              <button 
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full py-4 bg-brand-green text-white rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Meal...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Get Nutrition Insights</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-brand-border space-y-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-serif font-bold text-brand-green">{result.foodName}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    result.healthScore > 70 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  )}>
                    Health Score: {result.healthScore}/100
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Calories', value: result.nutrition.calories, unit: 'kcal' },
                { label: 'Protein', value: result.nutrition.protein, unit: 'g' },
                { label: 'Carbs', value: result.nutrition.carbs, unit: 'g' },
                { label: 'Fats', value: result.nutrition.fats, unit: 'g' },
              ].map(item => (
                <div key={item.label} className="bg-brand-cream p-3 rounded-2xl text-center border border-brand-border">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-brand-text-muted">{item.label}</p>
                  <p className="text-lg font-serif font-bold text-brand-green">{item.value}{item.unit}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-serif font-bold text-brand-green flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-brand-brown" />
                <span>Healthier Alternatives</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.healthierAlternatives.map((alt: string) => (
                  <span key={alt} className="px-3 py-2 bg-brand-brown/5 text-brand-brown rounded-xl text-sm font-medium border border-brand-brown/10">
                    {alt}
                  </span>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setImage(null)}
              className="w-full py-3 border-2 border-brand-green/20 text-brand-green rounded-xl font-bold hover:bg-brand-green/5 transition-colors"
            >
              Scan Another Meal
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
