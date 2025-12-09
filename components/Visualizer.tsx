import React, { useMemo } from 'react';
import { TokenCandidate } from '../types';
import { calculateProbabilities } from '../utils/math';
import { SoftmaxFormula } from './SoftmaxFormula';
import { SamplingRules } from './SamplingRules';

interface VisualizerProps {
  candidates: TokenCandidate[];
  temperature: number;
  topK: number;
  topP: number;
}

export const Visualizer: React.FC<VisualizerProps> = ({ candidates, temperature, topK, topP }) => {
  
  // --- VISUAL CONSTANTS ---
  const CHART_HEIGHT = 100; // Use 100% of the allocated svg space
  const TRANSITION_DURATION = 'duration-500 ease-in-out';
  const LINE_THICKNESS = 2; // px - Matched to border-2 exactly with non-scaling-stroke
  
  // --- COLOR THEME ---
  // Precise mapping to Tailwind Slider Colors:
  // T=0.1 (Cyan-500 ~190) -> T=1.0 (Purple-500 ~270) -> T=2.0 (Red-500 ~360)
  const themeHue = temperature <= 1.0 
    ? 190 + ((temperature - 0.1) / 0.9) * (270 - 190)
    : 270 + ((temperature - 1.0) / 1.0) * (360 - 270);
  
  const themeColor = `hsl(${themeHue}, 90%, 60%)`;
  const themeColorDim = `hsl(${themeHue}, 85%, 30%)`;

  // --- DATA PROCESSING ---
  const data = useMemo(() => {
    // 1. Calc Probs
    const probs = calculateProbabilities(candidates, temperature);
    
    // 2. Sort Descending
    const sorted = probs.map(p => {
      const original = candidates.find(c => c.id === p.id)!;
      return { ...original, probability: p.probability };
    }).sort((a, b) => b.probability - a.probability);

    // 3. Compute Cumulative & Cutoffs
    let currentSum = 0;
    let cutoffIndex = -1;

    return sorted.map((item, index) => {
      currentSum += item.probability;
      
      // Top P Logic
      if (cutoffIndex === -1 && currentSum >= topP) {
        cutoffIndex = index;
      }

      const isInsideTopK = index < topK;
      const isInsideTopP = cutoffIndex === -1 || index <= cutoffIndex;
      const isKept = isInsideTopK && isInsideTopP;

      return {
        ...item,
        cumSum: currentSum,
        remainingAfter: Math.max(0, 1.0 - currentSum), // Curve falls from 1.0 to 0.0
        isKept,
        color: isKept ? themeColor : '#374151'
      };
    });
  }, [candidates, temperature, topK, topP, themeColor]);

  // --- CHART MATH ---
  const getY = (val: number) => {
    return CHART_HEIGHT - (val * CHART_HEIGHT);
  };

  const step = 100 / data.length;

  // 1. Distribution Path (Temperature Curve)
  const distPoints = data.map((d, i) => ({
    x: (i + 0.5) * step,
    y: getY(d.probability)
  }));
  const distPath = generateMonotoneCubicPath(distPoints);

  // 2. Remaining Mass Path (Top P Curve Logic, Temp Color)
  const goldPoints = [
    { x: 0, y: getY(1.0) }, // Start at 100%
    ...data.map((d, i) => ({
      x: (i + 0.5) * step,
      y: getY(d.remainingAfter)
    }))
  ];
  // Ensure the curve ends at the baseline (0.0) after the last point
  if (data.length > 0) {
      goldPoints.push({ x: 100, y: getY(0) }); 
  }
  
  const goldPath = generateMonotoneCubicPath(goldPoints);

  // 3. Threshold Lines
  const thresholdValue = Math.max(0, 1.0 - topP);
  const thresholdY = getY(thresholdValue);
  const topKX = topK * step;

  // Calculate Sum of Exponentials for the formula display (passed to child component)
  const sumExp = data.reduce((acc, item) => {
      return acc + Math.exp(item.baseLogit / temperature);
  }, 0);

  return (
    <div className="w-full space-y-6">
      
      {/* Main Card */}
      <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="mb-4 border-b border-gray-800 pb-2">
            <div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
                    Visualizing probability distribution and sampling filters
                </p>
            </div>
        </div>

        {/* CHART AREA */}
        <div className="h-72 relative mt-4 mx-2 select-none group/chart">
           
           {/* LAYER 1: Bars Container (Bottom Z-Index, but allow hover popup) */}
           <div 
             className="absolute top-0 left-0 w-full flex items-end justify-between pr-[1px] h-full" 
           >
              {data.map((item, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === data.length - 1;

                  return (
                    <div 
                        key={item.id} 
                        className="flex-1 h-full flex flex-col justify-end px-0.5 relative group hover:z-50 transition-all duration-200"
                    >
                        
                        {/* TOOLTIP (Relative to BAR HEIGHT now) */}
                        <div 
                            className={`absolute mb-2 w-max max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity ${TRANSITION_DURATION} pointer-events-none ${
                                isFirst ? 'left-0 origin-bottom-left' : 
                                isLast ? 'right-0 origin-bottom-right' : 
                                'left-1/2 -translate-x-1/2 origin-bottom'
                            }`}
                            style={{ bottom: `${item.probability * 100}%` }}
                        >
                            <div className="bg-gray-950 text-white p-3 rounded-xl border border-gray-700 shadow-2xl flex flex-col gap-1">
                                <div className="flex justify-between font-bold border-b border-gray-800 pb-1 mb-1 text-sm">
                                    <span>{item.word}</span>
                                    <span style={{ color: themeColor }}>{(item.probability * 100).toFixed(1)}%</span>
                                </div>
                                <div className="text-xs text-gray-400 font-mono space-y-0.5">
                                    <div className="flex justify-between gap-4"><span>Logit:</span> <span>{item.baseLogit}</span></div>
                                    <div className="flex justify-between gap-4"><span>CumSum:</span> <span className="text-amber-400">{(item.cumSum * 100).toFixed(1)}%</span></div>
                                    <div className="flex justify-between gap-4 border-t border-gray-800 pt-1 mt-1">
                                        <span>Status:</span> 
                                        <span className={item.isKept ? "text-emerald-400" : "text-gray-500"}>
                                            {item.isKept ? "KEPT" : "DISCARDED"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BAR */}
                        <div 
                            className={`w-full rounded-t relative transition-all ${TRANSITION_DURATION} ${
                                item.isKept ? 'opacity-90' : 'opacity-20 grayscale'
                            }`}
                            style={{ 
                                height: `${item.probability * 100}%`,
                                backgroundColor: item.color
                            }}
                        >
                        </div>

                    </div>
                  );
              })}
           </div>

           {/* LAYER 2: HTML Overlay Elements (Middle Z-Index) */}
           <div className="absolute inset-0 pointer-events-none z-40">
               {/* Top K Wall */}
               <div 
                  className={`absolute border-l-2 border-emerald-400 border-dashed opacity-80 transition-all ${TRANSITION_DURATION}`}
                  style={{ left: `${topKX}%`, height: '100%', top: 0 }}
               >
                  <div className="bg-gray-900 text-xs font-medium text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      Top K {topK}
                  </div>
               </div>

               {/* Top P Label */}
               <div 
                  className={`absolute right-0 flex items-center transition-all ${TRANSITION_DURATION}`}
                  style={{ top: `${thresholdY}%`, transform: 'translateY(-50%)' }}
               >
                   <span className="text-xs font-medium text-amber-400 bg-gray-900 px-1.5 py-0.5 rounded border border-amber-500/20 shadow-sm">
                      P Floor {(1.0 - topP).toFixed(2)}
                   </span>
               </div>
           </div>

           {/* LAYER 3: SVG Layer (Top Z-Index) */}
           <svg 
              className="absolute top-0 left-0 w-full h-full z-30 pointer-events-none overflow-visible" 
              preserveAspectRatio="none" 
              viewBox="0 0 100 100"
           >
                <defs>
                    <filter id="glow-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="black" floodOpacity="0.9"/>
                    </filter>
                </defs>

                {/* 1. Distribution Curve */}
                <path 
                    d={distPath} 
                    fill="none" 
                    stroke={themeColor}
                    strokeWidth={LINE_THICKNESS}
                    vectorEffect="non-scaling-stroke"
                    strokeOpacity="0.9"
                    strokeDasharray="4 4"
                    style={{ filter: 'url(#glow-shadow)' }}
                    className={`transition-all ${TRANSITION_DURATION}`}
                />

                {/* 2. Remaining Mass Curve */}
                <path 
                    d={goldPath} 
                    fill="none" 
                    stroke={themeColor} 
                    strokeWidth={LINE_THICKNESS}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all ${TRANSITION_DURATION}`}
                    style={{ filter: 'url(#glow-shadow)' }} 
                />

                {/* Top P Threshold Line */}
                <line 
                    x1="0" y1={thresholdY} 
                    x2="100" y2={thresholdY} 
                    stroke="#fbbf24" 
                    strokeWidth={LINE_THICKNESS}
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray="4 4" 
                    opacity="0.8"
                    className={`transition-all ${TRANSITION_DURATION}`}
                />
           </svg>
        </div>

        {/* X-Axis Labels */}
        <div className="w-full flex justify-between mt-3 px-2 mx-2">
            {data.map(item => (
                <div key={item.id} className="flex-1 text-center px-0.5 flex flex-col items-center gap-1">
                    {/* Percentage Label */}
                    <div className="h-4 flex items-center">
                        {item.probability > 0.04 && (
                            <span className={`text-xs font-bold leading-none transition-all ${TRANSITION_DURATION} ${
                                item.isKept ? 'text-white' : 'text-gray-500 opacity-40'
                            }`}>
                                {(item.probability * 100).toFixed(0)}%
                            </span>
                        )}
                    </div>
                    {/* Word Label */}
                    <span className={`text-xs font-medium truncate block w-full transition-colors ${TRANSITION_DURATION} ${
                        item.isKept ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        {item.word}
                    </span>
                </div>
            ))}
        </div>

      </div>
      
      {/* SEPARATE COMPONENTS for Formula and Rules */}
      
      <SoftmaxFormula 
        topCandidate={data[0]}
        temperature={temperature}
        sumExp={sumExp}
        themeColor={themeColor}
      />

      <SamplingRules 
        topK={topK}
        topP={topP}
      />

    </div>
  );
};

// --- HELPERS ---

/**
 * Generates a smooth SVG path using Monotone Cubic Interpolation (Monotone Hermite Spline).
 * This preserves the monotonicity of the data (prevents overshooting/ringing) 
 * which is critical for visualizing probability distributions (T=0.1) where values change sharply.
 */
const generateMonotoneCubicPath = (points: {x: number, y: number}[]) => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    const n = points.length;
    
    // 1. Calculate secants (slopes between points)
    const dxs: number[] = [];
    const dys: number[] = [];
    const secants: number[] = [];
    
    for (let i = 0; i < n - 1; i++) {
        const dx = points[i+1].x - points[i].x;
        const dy = points[i+1].y - points[i].y;
        dxs.push(dx);
        dys.push(dy);
        secants.push(dy / dx);
    }

    // 2. Calculate tangents (m) at each point
    const ms: number[] = new Array(n).fill(0);

    // Initial and final tangents (simple average or one-sided difference)
    ms[0] = secants[0];
    ms[n-1] = secants[n-2];

    // Internal tangents (average of secants)
    for (let i = 1; i < n - 1; i++) {
        const m = (secants[i-1] + secants[i]) / 2;
        // If secants have opposite signs, the curve is turning; set slope to 0 to prevent overshoot.
        if (secants[i-1] * secants[i] <= 0) {
            ms[i] = 0;
        } else {
            ms[i] = m;
        }
    }

    // 3. Monotonicity enforcement (Fritsch-Carlson)
    for (let i = 0; i < n - 1; i++) {
        if (secants[i] === 0) {
            ms[i] = 0;
            ms[i+1] = 0;
        } else {
            const alpha = ms[i] / secants[i];
            const beta = ms[i+1] / secants[i];
            const dist = alpha * alpha + beta * beta;
            if (dist > 9) {
                const tau = 3 / Math.sqrt(dist);
                ms[i] = tau * alpha * secants[i];
                ms[i+1] = tau * beta * secants[i];
            }
        }
    }

    // 4. Generate SVG Path commands (Cubic Bezier)
    let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
    
    for (let i = 0; i < n - 1; i++) {
        const p0 = points[i];
        const p1 = points[i+1];
        
        // Convert Hermite tangents to Bezier control points
        // CP1 = P0 + (dx/3, m0 * dx/3)
        // CP2 = P1 - (dx/3, m1 * dx/3)
        
        const dx = dxs[i];
        
        const cp1x = p0.x + dx / 3;
        const cp1y = p0.y + ms[i] * dx / 3;
        
        const cp2x = p1.x - dx / 3;
        const cp2y = p1.y - ms[i+1] * dx / 3;

        d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`;
    }

    return d;
};
