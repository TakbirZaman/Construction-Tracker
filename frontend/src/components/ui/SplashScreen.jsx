import React, { useState, useEffect } from 'react';

const STEPS = [
  { label: 'Activating extension...', duration: 900 },
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

      // Animate progress within this step
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
      className={`fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Glow blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-10 w-80">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-500/20 rounded-2xl blur-xl scale-150" />
            <img
              src="https://www.nnsel.com/assets/nnsel-B5wYGJs_.png"
              alt="ConstructTrack"
              className="relative w-16 h-16 object-contain rounded-2xl border border-slate-800 bg-slate-900 p-2"
            />
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-2xl tracking-widest text-white uppercase">ConstructTrack</div>
            <div className="text-xs text-slate-500 font-mono tracking-widest mt-1">ENTERPRISE PRO ERP</div>
          </div>
        </div>

        {/* Progress section */}
        <div className="w-full flex flex-col gap-3">
          {/* Step label */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-400 font-mono tracking-wide">
              {STEPS[stepIndex]?.label}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Percentage */}
          <div className="flex justify-between text-xs text-slate-600 font-mono">
            <span>v1.0.0</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Bottom label */}
        <p className="text-xs text-slate-700 font-mono tracking-wider">
          Construction & Real Estate ERP
        </p>
      </div>
    </div>
  );
}
