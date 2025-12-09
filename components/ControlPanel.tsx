import React, { useState } from 'react';
import { HelpCircle, Thermometer, ListFilter, PieChart, Shuffle, Sliders } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ControlPanelProps {
  temperature: number;
  setTemperature: (val: number) => void;
  topK: number;
  setTopK: (val: number) => void;
  topP: number;
  setTopP: (val: number) => void;
  maxTopK?: number;
  disabled?: boolean;
  onRandomize?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  temperature,
  setTemperature,
  topK,
  setTopK,
  topP,
  setTopP,
  maxTopK = 40,
  disabled = false,
  onRandomize
}) => {
  // We track dragging state to toggle transition duration.
  // Dragging = Instant (0ms). Randomize = Smooth (700ms).
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => {
      setIsDragging(false);
  };

  const handleChange = (setter: (val: number) => void, val: number) => {
      setter(val);
  };

  const transitionClass = isDragging ? 'transition-none' : 'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]';

  return (
    <div className="bg-gray-900/80 backdrop-blur-md p-5 flex flex-col gap-4 relative h-full">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Panel Header */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-1">
        <div className="flex items-center gap-2 text-gray-100">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="font-bold tracking-wide text-sm uppercase">Configuration</span>
        </div>

        {/* Randomize Button */}
        {onRandomize && (
            <button 
                onClick={onRandomize}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-800 hover:bg-indigo-600/20 text-indigo-300 hover:text-white rounded-md transition-all duration-300 border border-gray-700 hover:border-indigo-500/50 text-xs font-medium group"
                title="Randomize Values"
            >
                <Shuffle className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                <span>Randomize</span>
            </button>
        )}
      </div>

      {/* Temperature Control */}
      <div>
        <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-md bg-gray-800 border border-gray-700 ${
                temperature < 0.5 ? 'text-cyan-400' : temperature > 1.0 ? 'text-red-400' : 'text-purple-400'
            }`}>
                <Thermometer className="w-4 h-4" />
            </div>
            <div>
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-200 text-sm">Temperature</span>
                    <Tooltip content="Controls randomness. Low Temp (0.1) = Winner takes all. High Temp (2.0) = Equal chance for everyone.">
                    <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-300" />
                    </Tooltip>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Custom Slider */}
            <div className="h-6 flex-1 flex items-center relative select-none">
                 {/* Track Background */}
                 <div className="absolute w-full h-1.5 bg-gray-800 rounded-full overflow-hidden ring-1 ring-white/5">
                    <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-red-500 opacity-30 ${transitionClass}`}></div>
                 </div>
                 
                 {/* Visual Thumb - Small size maintained */}
                 <div 
                    className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] z-20 pointer-events-none transform -translate-x-1/2 ${transitionClass}`}
                    style={{ left: `${((temperature - 0.1) / (2.0 - 0.1)) * 100}%` }}
                 >
                     <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-300 rounded-full"></div>
                 </div>

                 {/* Invisible Interactive Input */}
                 <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => handleChange(setTemperature, parseFloat(e.target.value))}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    disabled={disabled}
                    className="relative w-full h-6 opacity-0 cursor-pointer z-30"
                 />
            </div>

            {/* Value Display */}
            <div className={`w-12 text-right text-base font-mono font-medium leading-none ${
                temperature < 0.5 ? 'text-cyan-400' : temperature > 1.0 ? 'text-red-400' : 'text-purple-400'
            }`}>
                {temperature.toFixed(2)}
            </div>
        </div>
      </div>

      {/* Top K Control */}
      <div>
        <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-gray-800 border border-gray-700 text-emerald-400">
                <ListFilter className="w-4 h-4" />
            </div>
            <div>
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-200 text-sm">Top K</span>
                    <Tooltip content="Hard Limit. Only the top K most likely words are considered. The rest are discarded immediately.">
                    <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-300" />
                    </Tooltip>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="h-6 flex-1 flex items-center relative select-none">
                 {/* Track */}
                 <div className="absolute w-full h-1.5 bg-gray-800 rounded-full overflow-hidden ring-1 ring-white/5">
                    <div 
                        className={`h-full bg-emerald-500/50 ${transitionClass}`} 
                        style={{ width: `${(topK / maxTopK) * 100}%` }}
                    ></div>
                 </div>
                 
                 {/* Thumb - Small size maintained */}
                 <div 
                    className={`absolute w-3.5 h-3.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] z-20 pointer-events-none transform -translate-x-1/2 ${transitionClass}`}
                    style={{ left: `${(topK / maxTopK) * 100}%` }}
                 ></div>

                 <input
                    type="range"
                    min="1"
                    max={maxTopK}
                    step="1"
                    value={topK}
                    onChange={(e) => handleChange(setTopK, parseInt(e.target.value))}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    disabled={disabled}
                    className="relative w-full h-6 opacity-0 cursor-pointer z-30"
                 />
            </div>
            
            {/* Value Display */}
            <div className="w-12 text-right text-base font-mono font-medium leading-none text-emerald-400">
                {topK}
            </div>
        </div>
      </div>

      {/* Top P Control */}
      <div>
        <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-gray-800 border border-gray-700 text-amber-400">
                <PieChart className="w-4 h-4" />
            </div>
            <div>
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-200 text-sm">Top P</span>
                    <Tooltip content="Nucleus Sampling. Keeps the top words whose cumulative probability adds up to P.">
                    <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-300" />
                    </Tooltip>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="h-6 flex-1 flex items-center relative select-none">
                 <div className="absolute w-full h-1.5 bg-gray-800 rounded-full overflow-hidden ring-1 ring-white/5">
                    <div 
                        className={`h-full bg-amber-500/50 ${transitionClass}`} 
                        style={{ width: `${topP * 100}%` }}
                    ></div>
                 </div>
                 
                 {/* Thumb - Small size maintained */}
                 <div 
                    className={`absolute w-3.5 h-3.5 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)] z-20 pointer-events-none transform -translate-x-1/2 ${transitionClass}`}
                    style={{ left: `${topP * 100}%` }}
                 ></div>

                 <input
                    type="range"
                    min="0.01"
                    max="1.0"
                    step="0.01"
                    value={topP}
                    onChange={(e) => handleChange(setTopP, parseFloat(e.target.value))}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    disabled={disabled}
                    className="relative w-full h-6 opacity-0 cursor-pointer z-30"
                 />
            </div>
            
            {/* Value Display */}
            <div className="w-12 text-right text-base font-mono font-medium leading-none text-amber-400">
                {topP.toFixed(2)}
            </div>
        </div>
      </div>

    </div>
  );
};