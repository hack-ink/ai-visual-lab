import React from 'react';
import { Filter, ArrowDownToLine, Sigma } from 'lucide-react';

interface SamplingRulesProps {
    topK: number;
    topP: number;
}

export const SamplingRules: React.FC<SamplingRulesProps> = ({ topK, topP }) => {
    return (
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-white/5 shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-indigo-300">
                <Filter size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Sampling Rules</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top K Section */}
                <div className="flex gap-3">
                    <div className="mt-1">
                        <ArrowDownToLine size={20} className="text-emerald-400" />
                    </div>
                    <div className="text-sm">
                        <span className="text-emerald-400 font-bold block mb-1">Top K (Vertical Wall)</span>
                        <p className="text-gray-400 leading-relaxed">
                            Strict cutoff. Only the top <strong className="text-gray-200">{topK}</strong> candidates are allowed. The rest are discarded immediately.
                        </p>
                    </div>
                </div>

                {/* Top P Section */}
                <div className="flex gap-3">
                    <div className="mt-1">
                        <Sigma size={20} className="text-amber-400" />
                    </div>
                    <div className="text-sm">
                         <span className="text-amber-400 font-bold block mb-1">Top P (Dynamic Floor)</span>
                         <p className="text-gray-400 leading-relaxed">
                             Cumulative probability cutoff. We keep adding words until we reach <strong className="text-gray-200">{(topP * 100).toFixed(0)}%</strong> mass.
                         </p>
                    </div>
                </div>
            </div>
        </div>
    );
};