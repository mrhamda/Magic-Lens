"use client";

import { useState } from "react";
import CompareProducts from "../../components/CompareProducts";
import FoodChecker from "../../search/page";
import { Search, ArrowLeftRight, ExternalLink } from "lucide-react";

export default function Home(props) {
  const [activeTab, setActiveTab] = useState("search");

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-white/80 backdrop-blur-xl border border-slate-200 px-2 py-2 rounded-full shadow-2xl flex items-center gap-1">
        <button
          onClick={() => setActiveTab("search")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${activeTab === "search"
            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
            : "text-slate-500 hover:bg-slate-100"
            }`}
        >
          <Search className="w-4 h-4" />
          Single Search
        </button>
        <button
          onClick={() => setActiveTab("compare")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${activeTab === "compare"
            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
            : "text-slate-500 hover:bg-slate-100"
            }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          Compare
        </button>
      </nav>

      <div className="pb-24">
        {activeTab === "search" ? <FoodChecker /> : <CompareProducts />}

        <footer className="mt-12 pb-12 text-center">
          <div className="inline-flex flex-col items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Last updated Date: Jan 16, 2026
            </p>
            <a
              href="https://www.linkedin.com/in/abdullah-hamdan-b2ab463a0/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Abdullah Hamdan
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}