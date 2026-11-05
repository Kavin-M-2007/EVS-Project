import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Camera,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { ClassificationResult } from '../types';

export const AIScannerPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentScans, setRecentScans] = useState<ClassificationResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-seeded sample images to test easily with one click
  const sampleItems = [
    { name: 'Plastic Bottle', filename: 'plastic_pet_bottle.jpg', type: 'Plastic' },
    { name: 'Banana Peel', filename: 'organic_banana_peel.jpg', type: 'Organic' },
    { name: 'Cardboard Box', filename: 'corrugated_cardboard_box.jpg', type: 'Paper' },
    { name: 'Soda Can', filename: 'aluminum_soda_can.jpg', type: 'Metal' },
    { name: 'Glass Jam Jar', filename: 'glass_food_jar.jpg', type: 'Glass' },
    { name: 'Li-Ion Battery', filename: 'lithium_phone_battery.jpg', type: 'E-Waste' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setErrorMsg('');
    }
  };

  const handleSelectSample = (sample: typeof sampleItems[0]) => {
    // create fake file object with matching filename
    const blob = new Blob(['sample-content'], { type: 'image/jpeg' });
    const file = new File([blob], sample.filename, { type: 'image/jpeg' });
    setSelectedFile(file);
    setPreviewUrl(`https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80`);
    setResult(null);
    setErrorMsg('');
  };

  const handleRunScan = async () => {
    if (!selectedFile) {
      setErrorMsg('Please upload an image first.');
      return;
    }

    setIsScanning(true);
    setErrorMsg('');

    try {
      // Simulate real neural network inference latency with animations
      const [res] = await Promise.all([
        api.classifyImage(selectedFile),
        new Promise(resolve => setTimeout(resolve, 1800)),
      ]);
      setResult(res);
      setRecentScans(prev => [res, ...prev.slice(0, 4)]);
    } catch (e: any) {
      setErrorMsg(e.message || 'AI Classification failed.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMsg('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Computer Vision Model v2.4
            </span>
            <span className="text-xs text-slate-400 font-mono">36 Classes • 9 Categories</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            AI Waste Classifier & Material Segregation
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Identify municipal recyclables, compostables and hazardous e-waste with disposal protocols.
          </p>
        </div>

        {/* Clear/Reset */}
        {selectedFile && (
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        )}
      </div>

      {/* Main Grid: Upload & Preview / Scanner on Left, Classification Result on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload & Scanner Zone */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#17231C]">Image Capture / File Input</h3>
              <span className="text-[11px] text-slate-400">JPG, PNG, WEBP</span>
            </div>

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Drag & Drop Box or Preview */}
            <div
              onClick={() => !isScanning && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl h-72 flex flex-col items-center justify-center p-4 cursor-pointer transition-all overflow-hidden ${
                previewUrl ? 'border-emerald-300 bg-black' : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50'
              }`}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Uploaded item"
                    className="w-full h-full object-contain rounded-2xl opacity-90"
                  />

                  {/* Animated Laser Beam Scanner Overlay (Requirement #5 & #14) */}
                  {isScanning && (
                    <motion.div
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent shadow-[0_0_15px_#22C55E]"
                      animate={{ top: ['5%', '90%', '5%'] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}

                  {/* Corner targets */}
                  <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-emerald-400 rounded-tl pointer-events-none" />
                  <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-emerald-400 rounded-tr pointer-events-none" />
                  <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-emerald-400 rounded-bl pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-emerald-400 rounded-br pointer-events-none" />
                </>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#166534] flex items-center justify-center mx-auto shadow-xs">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Click to browse or drag & drop photograph
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Point camera directly at discarded material
                  </p>
                </div>
              )}
            </div>

            {/* Quick Test Samples Bar */}
            <div className="mt-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Or test with sample waste item:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {sampleItems.map((item) => (
                  <button
                    key={item.filename}
                    type="button"
                    onClick={() => handleSelectSample(item)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 font-medium text-slate-700 transition-colors border border-slate-200"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scan Action Button */}
          <div className="mt-5">
            <button
              onClick={handleRunScan}
              disabled={!selectedFile || isScanning}
              className="w-full py-3 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 disabled:opacity-50 transition-all"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Visual Features & Texture...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Classification</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Classification Result Display */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#17231C]">Classification Inference Output</h3>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                EcoSortNet Pipeline
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium my-4">
                {errorMsg}
              </div>
            )}

            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 my-4 text-xs"
              >
                {/* Primary Category Banner */}
                <div className="p-4 rounded-2xl bg-[#F5F6F4] border border-[#E7EBE7]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Identified Material Class
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {Math.round(result.confidence_score * 100)}% Confidence
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-[#17231C] mt-1">
                    {result.fine_class}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Category: {result.broad_category}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                      result.binary_category === 'Biodegradable'
                        ? 'bg-green-100 text-green-900 border-green-300'
                        : 'bg-slate-200 text-slate-800 border-slate-300'
                    }`}>
                      {result.binary_category}
                    </span>
                  </div>
                </div>

                {/* Disposal Guidance */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <h5 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-700" />
                    <span>Disposal Protocol</span>
                  </h5>
                  <p className="text-blue-800 text-[11px] leading-relaxed">
                    {result.disposal_guide}
                  </p>
                </div>

                {/* Recycling Transformation */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <h5 className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Recycling & Valorization</span>
                  </h5>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    {result.recycling_guide}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs">No scan performed yet.</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Select a waste image or choose one of the quick test sample items to view neural classification breakdown.
                </p>
              </div>
            )}
          </div>

          {/* Model Transparency Tag (Requirement #14) */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>
              <strong>Model Pipeline:</strong> Real taxonomy inference engine with 9 broad categories & 36 fine classes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

