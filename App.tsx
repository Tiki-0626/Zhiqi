
import React, { useState, useEffect } from 'react';
import Experience from './components/Experience';
import { generateFestiveBlessing, generateTreePoem } from './services/geminiService';
import { COLORS } from './constants';
import { MorphState } from './types';
import { Star, Send, Loader2, VolumeX, Volume2, Info, Boxes, TreePine } from 'lucide-react';

const App: React.FC = () => {
  const [blessing, setBlessing] = useState('');
  const [poem, setPoem] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [treeState, setTreeState] = useState<MorphState>('SCATTERED');

  useEffect(() => {
    const fetchPoem = async () => {
      const p = await generateTreePoem();
      setPoem(p);
    };
    fetchPoem();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    
    // Animate tree assembly alongside AI call
    setTreeState('ASSEMBLED');
    
    // Generate a blessing for a "Valued Guest" since input is removed
    const result = await generateFestiveBlessing('our Valued Guest', 'opulent and cinematic');
    setBlessing(result);
    setLoading(false);
  };

  const handleReset = () => {
    setBlessing('');
    setTreeState('SCATTERED');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#021a12]">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Experience treeState={treeState} />
      </div>

      {/* Header / Logo */}
      <div className="absolute top-8 left-8 z-10">
        <h1 className="font-cinzel text-3xl md:text-4xl font-bold tracking-[0.2em] text-[#d4af37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          WINSTON
          <span className="block text-[10px] md:text-xs font-inter tracking-[0.4em] text-[#065f46] mt-1 bg-[#d4af37] px-2 py-0.5 rounded-sm uppercase font-bold">
            MERRY CHRISTMAS
          </span>
        </h1>
      </div>

      {/* Controls Overlay */}
      <div className="absolute top-8 right-8 z-10 flex flex-col gap-4">
        <button 
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="p-3 bg-black/40 border border-[#d4af37]/30 rounded-full text-[#d4af37] hover:bg-[#d4af37]/20 transition-all backdrop-blur-md"
        >
          {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="p-3 bg-black/40 border border-[#d4af37]/30 rounded-full text-[#d4af37] hover:bg-[#d4af37]/20 transition-all backdrop-blur-md"
        >
          <Info size={20} />
        </button>
        <button 
          onClick={() => setTreeState(prev => prev === 'ASSEMBLED' ? 'SCATTERED' : 'ASSEMBLED')}
          className="p-3 bg-black/40 border border-[#d4af37]/30 rounded-full text-[#d4af37] hover:bg-[#d4af37]/20 transition-all backdrop-blur-md"
          title="Toggle Signature Form"
        >
          {treeState === 'ASSEMBLED' ? <Boxes size={20} /> : <TreePine size={20} />}
        </button>
      </div>

      {/* Main Interactive Panel */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-lg">
        <div className="bg-black/60 backdrop-blur-xl border border-[#d4af37]/20 p-8 rounded-2xl shadow-[0_0_50px_rgba(4,57,39,0.5)]">
          {!blessing ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-playfair text-2xl text-[#f9d71c] italic">Assemble Your Holiday</h2>
                <p className="text-xs text-[#d4af37]/60 uppercase tracking-widest">Opulent Winston Experience</p>
              </div>

              <div className="flex justify-center pt-2">
                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-[#d4af37] hover:bg-[#f9d71c] text-[#021a12] font-bold px-10 py-4 rounded-full transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 uppercase tracking-widest text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Assembling...
                    </>
                  ) : (
                    <>
                      <Star size={18} fill="currentColor" />
                      Reveal Signature
                    </>
                  )}
                </button>
              </div>
              
              <div className="pt-6 border-t border-[#d4af37]/10">
                <p className="text-[10px] text-[#d4af37]/40 text-center leading-relaxed font-cinzel italic">
                  {poem || "Atmosphere initializing..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-4">
               <div className="flex justify-center text-[#f9d71c]">
                <Star size={48} fill="#f9d71c" className="drop-shadow-[0_0_15px_rgba(249,215,28,0.8)]" />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-playfair text-xl text-[#d4af37] tracking-wider uppercase">A Winston Signature Blessing</h3>
                <p className="font-cinzel text-lg md:text-xl text-white leading-relaxed drop-shadow-md">
                  "{blessing}"
                </p>
              </div>

              <button 
                onClick={handleReset}
                className="text-[#d4af37]/60 hover:text-[#f9d71c] text-xs uppercase tracking-[0.3em] transition-colors pt-4 block w-full"
              >
                Disassemble Signature
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#021a12] border border-[#d4af37] p-8 max-w-md rounded-lg relative shadow-[0_0_100px_rgba(4,57,39,0.8)]">
             <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-[#d4af37] text-2xl hover:scale-110 transition-transform"
            >
              ×
            </button>
            <h3 className="font-cinzel text-2xl text-[#d4af37] mb-4 border-b border-[#d4af37]/20 pb-2">The Winston Philosophy</h3>
            <div className="text-sm text-emerald-100/80 leading-relaxed space-y-4 font-inter">
              <p>Experience the convergence of algorithm and elegance. The Winston Signature tree utilizes dynamic particle physics to morph between chaos and structure.</p>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-[#d4af37]/80">
                <li>Procedural Dual-State Morphing</li>
                <li>Faceted Emerald Reflection Shaders</li>
                <li>Generative Hallmark Greetings (Gemini AI)</li>
                <li>Cinematic Post-Process Orchestration</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cinematic Vignette */}
      <div className="pointer-events-none absolute inset-0 z-0 shadow-[inset_0_0_200px_rgba(0,0,0,1)]"></div>
    </div>
  );
};

export default App;
