"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Camera,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowLeftRight,
  Zap,
  Leaf,
  Wine,
  Waves,
  FlaskConical,
  Info,
  Flame,
  Droplets,
  Barcode,
  Trophy,
  Tag,
} from "lucide-react";

const ALLERGEN_MAP = [
  { id: "en:vegan", label: "Vegan", icon: <Leaf className="w-3 h-3" /> },
  { id: "en:milk", label: "Dairy", icon: "🥛" },
  { id: "en:peanuts", label: "Peanuts", icon: "🥜" },
  { id: "en:eggs", label: "Eggs", icon: "🥚" },
  { id: "en:gluten", label: "Gluten", icon: "🌾" },
  { id: "en:soybeans", label: "Soy", icon: "🫘" },
  { id: "en:nuts", label: "Tree Nuts", icon: "🌰" },
  { id: "en:fish", label: "Fish", icon: <Waves className="w-3 h-3" /> },
  { id: "en:crustaceans", label: "Shellfish", icon: "🦐" },
  { id: "en:mustard", label: "Mustard", icon: "🍯" },
  { id: "en:sesame-seeds", label: "Sesame", icon: "🥯" },
  { id: "en:sulphites", label: "Sulfites", icon: <Wine className="w-3 h-3" /> },
];

export default function SafeSwapCompare() {
  const [myAllergies, setMyAllergies] = useState([]);
  const [leftProduct, setLeftProduct] = useState(null);
  const [rightProduct, setRightProduct] = useState(null);
  const [activeScanner, setActiveScanner] = useState(null);
  const [loading, setLoading] = useState({ left: false, right: false });

  const fetchProduct = async (side, query) => {
    if (!query) return;

    setLoading((prev) => ({ ...prev, [side]: true }));

    try {
      const res = await fetch(`/api/proxy?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      if (side === "left") setLeftProduct(data);
      else setRightProduct(data);
    } catch (err) {
      console.error(`Product "${query}" not found.`);
    } finally {
      setLoading((prev) => ({ ...prev, [side]: false }));
    }
  };

  const getScore = (product) => {
    if (!product) return -1;
    const analysisTags = product.ingredients_analysis_tags || [];
    const productAllergens = product.allergens_tags || [];
    let conflictCount = 0;

    myAllergies.forEach((id) => {
      if (id === "en:vegan" && analysisTags.includes("en:non-vegan"))
        conflictCount++;
      else if (productAllergens.includes(id)) conflictCount++;
    });

    const nutriMap = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const nutriScore = nutriMap[product.nutriscore_grade?.toLowerCase()] || 6;

    return conflictCount * 10 + nutriScore;
  };

  const leftScore = getScore(leftProduct);
  const rightScore = getScore(rightProduct);
  const winner =
    leftProduct && rightProduct
      ? leftScore < rightScore
        ? "left"
        : rightScore < leftScore
          ? "right"
          : "tie"
      : null;

  useEffect(() => {
    if (!activeScanner) return;
    const scanner = new Html5QrcodeScanner("compare-reader", {
      fps: 10,
      qrbox: { width: 250, height: 200 },
      aspectRatio: 1.0,
    });
    scanner.render(
      (text) => {
        fetchProduct(activeScanner, text);
        scanner.clear().then(() => setActiveScanner(null));
      },
      () => {},
    );
    return () => {
      scanner.clear().catch((e) => console.error(e));
    };
  }, [activeScanner]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-2"
        >
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-800">
              MAGIC<span className="text-blue-600">LENS</span> COMPARE
            </h1>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
              Smart allergen detection
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="bg-blue-50 p-3 rounded-2xl cursor-pointer"
          >
            <Zap className="w-6 h-6 text-blue-600 fill-blue-600" />
          </motion.div>
        </motion.div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Your Restrictions
            </h2>
            <motion.span
              key={myAllergies.length}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"
            >
              {myAllergies.length} Selected
            </motion.span>
          </div>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
            className="flex flex-wrap gap-2 justify-start"
          >
            {ALLERGEN_MAP.map((item) => {
              const active = myAllergies.includes(item.id);
              return (
                <motion.button
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    show: { opacity: 1, scale: 1 },
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setMyAllergies((prev) =>
                      active
                        ? prev.filter((x) => x !== item.id)
                        : [...prev, item.id],
                    )
                  }
                  className={`px-4 py-2.5 rounded-2xl border-2 text-sm font-bold transition-colors flex items-center gap-2 ${
                    active
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                  }`}
                >
                  {item.icon} {item.label}
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative items-stretch">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              y: [0, -2, 2, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white border-8 border-[#FDFDFD] shadow-2xl w-16 h-16 rounded-full items-center justify-center"
          >
            <ArrowLeftRight className="w-6 h-6 text-blue-600" />
          </motion.div>

          <LayoutGroup>
            <div className="flex flex-col space-y-6 h-full">
              <InputSection
                onSearch={(val) => fetchProduct("left", val)}
                onScan={() => setActiveScanner("left")}
                isLoading={loading.left}
                side="left"
              />
              <div className="flex-grow h-full">
                <AnimatePresence mode="wait">
                  {loading.left ? (
                    <motion.div
                      key="loading-left"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="h-full min-h-[700px] bg-slate-100 animate-pulse rounded-[3rem]"
                    />
                  ) : (
                    <ProductCard
                      key={leftProduct?.id || "empty-left"}
                      product={leftProduct}
                      myAllergies={myAllergies}
                      isWinner={winner === "left"}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col space-y-6 h-full">
              <InputSection
                onSearch={(val) => fetchProduct("right", val)}
                onScan={() => setActiveScanner("right")}
                isLoading={loading.right}
                side="right"
              />
              <div className="flex-grow h-full">
                <AnimatePresence mode="wait">
                  {loading.right ? (
                    <motion.div
                      key="loading-right"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="h-full min-h-[700px] bg-slate-100 animate-pulse rounded-[3rem]"
                    />
                  ) : (
                    <ProductCard
                      key={rightProduct?.id || "empty-right"}
                      product={rightProduct}
                      myAllergies={myAllergies}
                      isWinner={winner === "right"}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </LayoutGroup>
        </div>
      </div>

      <AnimatePresence>
        {activeScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white w-full max-w-md rounded-[3rem] p-8 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Barcode className="text-blue-600" />
                  <span className="font-black uppercase text-xs tracking-widest">
                    Scanning {activeScanner}
                  </span>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={() => setActiveScanner(null)}
                  className="p-2 bg-slate-100 rounded-full hover:text-red-500 transition-colors"
                >
                  <X />
                </motion.button>
              </div>
              <div
                id="compare-reader"
                className="rounded-2xl overflow-hidden border-4 border-slate-50 shadow-inner"
              ></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputSection({ onSearch, onScan, isLoading, side }) {
  const [val, setVal] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-2 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex gap-2"
    >
      <div className="flex-1 flex items-center px-6 gap-3">
        <Search className="text-slate-400 w-5 h-5" />
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch(val)}
          placeholder={
            side === "left" ? "Add Product A..." : "Add Product B..."
          }
          className="w-full py-4 outline-none text-sm font-bold placeholder:text-slate-300 bg-transparent"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSearch(val)}
        disabled={isLoading}
        className="px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Zap className="w-4 h-4" />
          </motion.div>
        ) : (
          "Add"
        )}
      </motion.button>
    </motion.div>
  );
}

function ProductCard({ product, myAllergies, isWinner }) {
  if (!product) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-full min-h-[700px] border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50 bg-white"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Search className="w-16 h-16" />
        </motion.div>
        <p className="font-black uppercase text-xs tracking-[0.3em]">
          Select Product
        </p>
      </motion.div>
    );
  }

  const analysisTags = product.ingredients_analysis_tags || [];
  const productAllergens = product.allergens_tags || [];
  const conflicts = [];

  myAllergies.forEach((id) => {
    if (id === "en:vegan" && analysisTags.includes("en:non-vegan"))
      conflicts.push("Non-Vegan");
    else if (productAllergens.includes(id))
      conflicts.push(ALLERGEN_MAP.find((a) => a.id === id)?.label);
  });

  const isSafe = conflicts.length === 0;
  const ingredientsList = product.ingredients_text
    ? product.ingredients_text
        .split(/[,.;()]/)
        .filter((i) => i.trim().length > 1)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: isWinner ? 1.02 : 1,
        borderColor: isWinner ? "#fbbf24" : "#f1f5f9",
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`h-full flex flex-col bg-white rounded-[3rem] shadow-2xl overflow-hidden relative border-4 transition-shadow ${
        isWinner ? "shadow-amber-100" : "shadow-slate-200/60"
      }`}
    >
      <AnimatePresence>
        {isWinner && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-6 right-6 z-20 bg-amber-400 text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-bounce"
          >
            <Trophy className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Better Choice
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-8 flex items-center gap-8 border-b border-slate-50 bg-slate-50/30">
        <motion.img
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={product.image_front_small_url}
          className="w-24 h-24 md:w-32 md:h-32 object-contain bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100"
          alt=""
        />
        <div className="min-w-0">
          <motion.h3
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-2xl font-black text-slate-800 leading-tight mb-2 truncate"
          >
            {product.product_name}
          </motion.h3>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase text-blue-500 tracking-widest"
          >
            {product.brands || "Generic"}
          </motion.span>
        </div>
      </div>

      <div className="p-8 space-y-8 flex-grow flex flex-col">
        {product.comparison_price && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                Jämförelsepris
              </span>
            </div>
            <span className="text-lg font-black text-blue-700">
              {product.comparison_price}
            </span>
          </motion.div>
        )}

        <motion.div
          animate={{
            backgroundColor: isSafe ? "#ecfdf5" : "#fef2f2",
            borderColor: isSafe ? "#d1fae5" : "#fee2e2",
          }}
          className="p-6 rounded-[2rem] border-2 flex items-center gap-5 transition-all"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            {isSafe ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-red-500" />
            )}
          </motion.div>
          <div>
            <p className="font-black uppercase text-sm tracking-tight">
              {isSafe ? "Safe Choice" : "Warning"}
            </p>
            <AnimatePresence>
              {conflicts.length > 0 && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 0.6, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs font-bold"
                >
                  Matches your triggers: {conflicts.join(", ")}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <NutriCard
            label="Sugar"
            value={product.nutriments?.sugars_100g}
            unit="g"
            delay={0.1}
          />
          <NutriCard
            label="Cals"
            value={product.nutriments?.["energy-kcal_100g"]}
            unit="kcal"
            icon={<Flame className="w-3 h-3 text-orange-400" />}
            delay={0.15}
          />
          <NutriCard
            label="Salt"
            value={product.nutriments?.salt_100g}
            unit="g"
            delay={0.2}
          />
          <NutriCard
            label="Fat"
            value={product.nutriments?.fat_100g}
            unit="g"
            icon={<Droplets className="w-3 h-3 text-blue-400" />}
            delay={0.25}
          />
        </div>

        <div className="space-y-4 flex-grow flex flex-col">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <FlaskConical className="w-3 h-3" /> Ingredients List
          </h5>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden flex-grow min-h-[250px] relative"
          >
            <div className="absolute inset-0 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 border-b border-slate-100 sticky top-0">
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-center">
                      #
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Component
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Info
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ingredientsList.map((ing, idx) => (
                    <motion.tr
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.02 }}
                      key={idx}
                      className="hover:bg-white transition-colors"
                    >
                      <td className="px-6 py-4 text-xs font-black text-slate-300 text-center">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 capitalize">
                          {ing.trim().toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Info className="w-3 h-3 text-slate-200 inline" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-between px-2 pt-6 border-t border-slate-50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Nutri-Score Grade
          </span>
          <motion.span
            key={product.nutriscore_grade}
            initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            className={`text-4xl font-black italic uppercase ${
              ["a", "b"].includes(product.nutriscore_grade)
                ? "text-emerald-500"
                : "text-orange-500"
            }`}
          >
            {product.nutriscore_grade || "?"}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

function NutriCard({ label, value, unit, icon, delay = 0 }) {
  const numericValue = Number(value) || 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="p-4 rounded-2xl border-2 border-slate-50 bg-white shadow-sm"
    >
      <div className="flex items-center gap-1.5 mb-1 opacity-60">
        {icon}
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
          {label}
        </p>
      </div>
      <p className="text-lg font-black text-slate-800">
        {numericValue.toFixed(1)}
        <span className="text-[10px] ml-0.5 opacity-40 font-bold">{unit}</span>
      </p>
    </motion.div>
  );
}
