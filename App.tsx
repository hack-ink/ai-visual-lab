import React, { useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { Visualizer } from './components/Visualizer';
import { TokenCandidate } from './types';
import { BrainCircuit } from 'lucide-react';

// MOCK DATA: Logits are closely grouped to demonstrate the "flattening" effect of high temperature effectively.
const MOCK_CANDIDATES: TokenCandidate[] = [
  { id: 1, word: 'sunny', baseLogit: 10.0 },
  { id: 2, word: 'bright', baseLogit: 9.8 },
  { id: 3, word: 'clear', baseLogit: 9.5 },
  { id: 4, word: 'warm', baseLogit: 9.0 },
  { id: 5, word: 'cloudy', baseLogit: 8.5 },
  { id: 6, word: 'humid', baseLogit: 8.0 },
  { id: 7, word: 'rainy', baseLogit: 7.5 },
  { id: 8, word: 'stormy', baseLogit: 6.0 },
];

const App: React.FC = () => {
  // Default states tailored for a good initial demo
  const [temperature, setTemperature] = useState<number>(1.0);
  const [topK, setTopK] = useState<number>(MOCK_CANDIDATES.length); 
  const [topP, setTopP] = useState<number>(1.0);

  const maxTopK = MOCK_CANDIDATES.length;

  const randomizeValues = () => {
    // Generate random values for a "feeling lucky" effect
    setTemperature(Number((0.1 + Math.random() * 1.9).toFixed(2))); // 0.1 - 2.0
    setTopK(Math.floor(1 + Math.random() * maxTopK)); // 1 - 8
    setTopP(Number((0.1 + Math.random() * 0.9).toFixed(2))); // 0.1 - 1.0
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                AI Visual <span className="text-indigo-400">Lab</span>
            </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Controls */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
                
                {/* Control Panel Wrapper - Removed double border */}
                <div className="rounded-2xl shadow-2xl overflow-hidden">
                    <ControlPanel 
                        temperature={temperature}
                        setTemperature={setTemperature}
                        topK={topK}
                        setTopK={setTopK}
                        topP={topP}
                        setTopP={setTopP}
                        maxTopK={maxTopK}
                        onRandomize={randomizeValues}
                    />
                </div>

                {/* Experiment Guide - Refined to match unified style */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-sm text-indigo-200/80 leading-relaxed shadow-lg backdrop-blur-md">
                    <h3 className="font-semibold text-indigo-300 mb-3 uppercase tracking-wide text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                        Experiment Guide
                    </h3>
                    <ul className="space-y-4 list-disc pl-4 marker:text-indigo-500">
                        <li>
                            <span className="text-white font-bold block mb-1">Temperature Effect</span> 
                            Slide to <span className="text-cyan-300 font-mono">0.1</span>. The winner spikes. The Gold Curve drops sharply to 0.
                            Slide to <span className="text-red-300 font-mono">2.0</span>. The bars flatten. The Gold Curve floats down gently.
                        </li>
                         <li>
                            <span className="text-white font-bold block mb-1">Top K (Vertical Wall)</span> 
                            Set to <span className="text-emerald-300 font-mono">3</span>. A wall appears, strictly cutting off candidates #4-8.
                        </li>
                        <li>
                            <span className="text-white font-bold block mb-1">Top P (Gold Floor)</span> 
                            The Gold Line indicates the "Remaining Mass". 
                            Slide to <span className="text-amber-300 font-mono">0.5</span>. The dashed Floor moves up. As soon as the Falling Gold Curve hits this Floor, we stop.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Column: Visualization */}
            <div className="lg:col-span-8">
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header Text removed from here and integrated into Visualizer for better alignment */}
                    <Visualizer 
                        candidates={MOCK_CANDIDATES}
                        temperature={temperature}
                        topK={topK}
                        topP={topP}
                    />
                </div>
            </div>

        </div>
      </main>
    </div>
  );
};

export default App;