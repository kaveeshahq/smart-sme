"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, AlertTriangle } from "lucide-react";

export default function AIInsights() {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchInsights() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/ai/insights");
      const data = await res.json();
      if (data.success) {
        setInsight(data.data.insight);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-50 rounded-xl border border-indigo-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm leading-tight">
              AI Business Insights
            </h3>
            <p className="text-xs text-gray-400 leading-tight">
              Powered by Claude
            </p>
          </div>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="p-1.5 hover:bg-white/60 rounded-lg transition-colors text-gray-500 disabled:opacity-50"
          title="Refresh insights"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-indigo-100/60 rounded-full animate-pulse w-full" />
          <div className="h-3 bg-indigo-100/60 rounded-full animate-pulse w-5/6" />
          <div className="h-3 bg-indigo-100/60 rounded-full animate-pulse w-3/4" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-orange-600">
          <AlertTriangle size={14} />
          Couldn&apos;t generate insights right now. Try refreshing.
        </div>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
      )}
    </div>
  );
}