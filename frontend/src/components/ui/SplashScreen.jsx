import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  { label: 'Initializing system...', duration: 900 },
  { label: 'Loading modules...', duration: 700 },
  { label: 'Connecting to server...', duration: 800 },
  { label: 'Preparing workspace...', duration: 600 },
];

export default function SplashScreen({ onDone }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let current = 0;
    const totalDuration = STEPS.reduce((s, t) => s + t.duration, 0);
    let elapsed = 0;

    const runStep = (index) => {
      if (index >= STEPS.length) {
        setProgress(100);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onDone, 500);
        }, 400);
        return;
      }
      setStepIndex(index);
      const stepDuration = STEPS[index].duration;
      const startPct = (elapsed / totalDuration) * 100;
      elapsed += stepDuration;
      const endPct = (elapsed / totalDuration) * 100;

      const startTime = Date.now();
      const animate = () => {
        const t = Math.min(1, (Date.now() - startTime) / stepDuration);
        setProgress(startPct + (endPct - startPct) * t);
        if (t < 1) requestAnimationFrame(animate);
        else runStep(index + 1);
      };
      requestAnimationFrame(animate);
    };

    runStep(0);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(135deg, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}
    >
      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-instagram-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-instagram-orange/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
      </div>

      <div className="relative flex flex-col items-center gap-10 w-80">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-brand-400/20 rounded-3xl blur-2xl scale-150 animate-pulse-slow" />
            <div className="relative w-20 h-20 bg-instagram-gradient rounded-3xl flex items-center justify-center shadow-glow-brand">
              <span className="text-white font-bold text-2xl font-display">CT</span>
            </div>
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-3xl tracking-wide text-gradient-brand uppercase">ConstructTrack</div>
            <div className="text-xs text-slate-400 font-mono tracking-widest mt-1.5">ENTERPRISE PRO ERP</div>
          </div>
        </motion.div>

        {/* Progress section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-500 font-mono tracking-wide">
              {STEPS[stepIndex]?.label}
            </span>
          </div>

          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-500 via-violet-500 to-emerald-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>v1.0.0</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </motion.div>

        <p className="text-xs text-slate-400 font-mono tracking-wider">
          Construction & Real Estate ERP
        </p>
      </div>
    </div>
  );
}
