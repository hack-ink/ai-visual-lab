import React from 'react';
import { Calculator } from 'lucide-react';
import { TokenCandidate } from '../types';

interface ProcessedCandidate extends TokenCandidate {
    probability: number;
}

interface SoftmaxFormulaProps {
    topCandidate: ProcessedCandidate;
    temperature: number;
    sumExp: number;
    themeColor: string;
}

export const SoftmaxFormula: React.FC<SoftmaxFormulaProps> = ({ topCandidate, temperature, sumExp, themeColor }) => {
    // Math helpers
    const scaledLogit = topCandidate.baseLogit / temperature;
    const exponentiated = Math.exp(scaledLogit);

    return (
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-white/5 shadow-xl">
            <div className="flex items-center gap-2 mb-4" style={{ color: themeColor }}>
                <Calculator size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Softmax Formula</span>
            </div>
            
            {/* Formula Block */}
            <div className="mb-4 bg-gray-950/50 p-4 rounded-lg border border-white/5 flex items-center justify-center overflow-x-auto">
               <div className="font-mono text-base text-gray-200 flex items-center gap-4 whitespace-nowrap">
                 {/* Left P */}
                 <span className="text-gray-400 font-medium">P("{topCandidate.word}")</span>
                 
                 <span className="text-gray-600">=</span>
                 
                 {/* Middle Terms */}
                 <div className="flex flex-col items-center justify-center opacity-80">
                    <div className="border-b border-gray-500 px-2 mb-0.5">
                        e<sup className="text-xs text-indigo-400">{topCandidate.baseLogit}/{temperature.toFixed(1)}</sup>
                    </div>
                    <div className="text-xs text-gray-500">
                         Σ e<sup className="text-[10px]">z/T</sup>
                    </div>
                 </div>
                 
                 <span className="text-gray-600">=</span>
                 
                 <div className="flex flex-col items-center justify-center text-sm opacity-80">
                    <div className="border-b border-gray-600 px-1 text-indigo-300">
                        {exponentiated.toExponential(1)}
                    </div>
                    <div className="text-gray-500">
                        {sumExp.toExponential(1)}
                    </div>
                 </div>
                 
                 <span className="text-gray-600">=</span>
                 
                 {/* Result */}
                 <span className="text-base font-bold" style={{ color: themeColor }}>
                     {(topCandidate.probability * 100).toFixed(0)}%
                 </span>
               </div>
            </div>

            {/* Breakdown - Using Grid for aligned labels without excessive gap */}
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs font-mono text-gray-500 px-1">
                <div className="whitespace-nowrap">1. Logit / Temp</div>
                <div>
                    {topCandidate.baseLogit} / {temperature.toFixed(1)} = <span className="text-indigo-300">{scaledLogit.toFixed(2)}</span>
                </div>
                
                <div className="whitespace-nowrap">2. Exp(Scaled)</div>
                <div>
                    e^{scaledLogit.toFixed(2)} = <span className="text-indigo-300">{exponentiated.toExponential(2)}</span>
                </div>
            </div>
        </div>
    );
};