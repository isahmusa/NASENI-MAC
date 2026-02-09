
import React, { useState } from 'react';
import { PRODUCTS } from '../constants';
import { Project } from '../types';

interface MockupGeneratorProps {
  onSave?: (project: Omit<Project, 'id' | 'userId' | 'createdAt'>) => void;
}

const MockupGenerator: React.FC<MockupGeneratorProps> = ({ onSave }) => {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [logo, setLogo] = useState<string | null>(null);
  const [background, setBackground] = useState('studio');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // In a real app, we'd use a library to capture the DOM as an image.
    // For this conceptual implementation, we'll save the logo + product as a representation.
    if (logo && onSave) {
      onSave({
        type: 'mockup',
        name: `Mockup_${selectedProduct.name.replace(/\s+/g, '_')}`,
        data: logo, // Conceptual: saving the composite
        metadata: { productType: selectedProduct.id, background }
      });
    } else {
      alert('Please upload a logo first.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-500">
      {/* Control Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="studio-glass p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold mb-6">Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">1. Upload Logo</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-white/10 group-hover:border-blue-500/50 transition-colors rounded-2xl p-8 text-center bg-white/5">
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-sm font-medium">Click or drag logo</p>
                  <p className="text-xs text-zinc-600 mt-1">PNG, SVG supported</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">2. Select Product</label>
              <div className="grid grid-cols-2 gap-3">
                {PRODUCTS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`p-3 rounded-xl border text-sm transition-all ${
                      selectedProduct.id === p.id 
                        ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">3. Background</label>
              <select 
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="studio">Studio Minimalist</option>
                <option value="lifestyle">Lifestyle Context</option>
                <option value="transparent">Transparent Background</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            setIsGenerating(true);
            setTimeout(() => setIsGenerating(false), 1500);
          }}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:scale-[1.02] transition-transform"
        >
          {isGenerating ? 'Rendering Engine...' : 'Generate HD Mockup'}
        </button>
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex-1 studio-glass rounded-3xl border border-white/5 relative min-h-[500px] flex items-center justify-center p-12 overflow-hidden bg-black/40">
          {/* Base Product */}
          <img 
            src={selectedProduct.image} 
            alt={selectedProduct.name}
            className={`max-w-full max-h-full rounded-2xl object-contain mix-blend-lighten opacity-80 transition-all ${isGenerating ? 'blur-sm scale-95' : ''}`}
          />
          
          {/* Overlay Logo */}
          {logo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img 
                src={logo} 
                alt="Logo Overlay" 
                className={`w-32 h-32 object-contain drop-shadow-2xl animate-in zoom-in-75 duration-300 transition-all ${isGenerating ? 'opacity-0' : ''}`}
                style={{ filter: 'brightness(1.1) contrast(1.1)' }}
              />
            </div>
          )}

          {isGenerating && (
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest animate-pulse">Computing Lighting & Shadows</p>
             </div>
          )}

          {/* Watermark/Badges */}
          <div className="absolute top-6 left-6 px-3 py-1 bg-black/50 backdrop-blur rounded-lg border border-white/10 text-[10px] font-bold tracking-widest uppercase">
            Preview Model: V-3.1
          </div>
        </div>

        <div className="flex justify-between items-center px-4">
          <div className="flex gap-4">
            <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10">🔍 Zoom</button>
            <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10" onClick={handleSave}>💾 Save</button>
          </div>
          <button className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 shadow-xl">
            Download 4K Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockupGenerator;
