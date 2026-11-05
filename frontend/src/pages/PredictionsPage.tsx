import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PredictionsPage: React.FC = () => {
  const { user } = useAuth();
  const [predictionData, setPredictionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPredictions() {
      try {
        const data = await api.getPredictions(
          user?.role === 'SUPER_ADMIN' ? undefined : (user?.municipality_id || 1)
        );
        setPredictionData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPredictions()
  }, [user]);

  // Combine historical and forecast curve for visual comparison
  const combinedChartData = [
    ...(predictionData?.historical_data || []).map((h: any) => ({
      date: h.date,
      historical: h.actual_waste_kg,
      predicted: null
    })),
    ...(predictionData?.forecast_data || []).map((f: any) => ({
      date: f.date,
      historical: null,
      predicted: f.predicted_waste_kg
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Predictive AI Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">ARIMA + XGBoost Hybrid</span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            AI Waste Prediction & Overflow Forecasting Centre
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Predict high-waste surge periods, pre-empt smart bin overflows, and optimize vehicle dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span>Model Accuracy: {predictionData?.model_confidence_overall || 91.4}%</span>
        </div>
      </div>

      {/* Historical vs Predicted Waste Generation Curve (Requirement #18) */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#17231C]">
              7-Day Historical Intake vs 7-Day Forward Forecast
            </h3>
            <p className="text-xs text-[#747D75]">
              Continuous predictive curve highlighting weekend volumetric spikes
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#166534]" />
              <span className="text-slate-700">Actual Historical Intake</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-[#22C55E]" />
              <span className="text-emerald-700 font-semibold">AI Predicted Demand</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E7EBE7',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="historical"
                name="Actual (kg)"
                stroke="#166534"
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Forecast (kg)"
                stroke="#22C55E"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High Waste Zones & Predicted Overflow Bins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High-Waste Zones */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#17231C]">Forecasted High-Waste Zones</h3>
            <span className="text-[10px] text-slate-400 font-mono">Next 48 Hours</span>
          </div>

          <div className="space-y-3">
            {(predictionData?.high_waste_zones || []).map((zone: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{zone.zone}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    zone.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {zone.risk_level} RISK
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>Predicted Vol: <strong>{zone.predicted_volume_kg} kg</strong></span>
                  <span>Peak Hours: <strong>{zone.peak_window}</strong></span>
                </div>
                <p className="text-[10px] text-slate-400">{zone.bottleneck}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Bin Overflow Countdown */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-sm font-bold text-[#17231C]">Predicted Bin Overflow Countdowns</h3>
            </div>
            <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              Imminent Surge
            </span>
          </div>

          <div className="space-y-3">
            {(predictionData?.overflow_risk_bins || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No bins at immediate overflow risk.</p>
            ) : (
              (predictionData?.overflow_risk_bins || []).map((b: any) => (
                <div
                  key={b.bin_id}
                  className="p-3.5 rounded-2xl bg-red-50/40 border border-red-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{b.bin_code}</span>
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                        {b.current_fill_pct}% Full
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5 font-medium">{b.location_name}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-red-700 block">
                      ~{b.predicted_overflow_hours} hrs
                    </span>
                    <span className="text-[10px] text-red-500 font-medium">Until Overflow</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Suggested Operational Actions (Requirement #18) */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-[#17231C]">Suggested Pre-Emptive Operational Actions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(predictionData?.recommendations || []).map((rec: any) => (
            <div
              key={rec.id}
              className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="font-mono text-emerald-800">{rec.id}</span>
                  <span className={`px-2 py-0.5 rounded-md ${
                    rec.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-2 leading-snug">
                  {rec.action}
                </h4>
              </div>

              <div className="pt-2 border-t border-emerald-100 text-[11px] text-emerald-900">
                <strong>Projected Impact:</strong> {rec.impact}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

