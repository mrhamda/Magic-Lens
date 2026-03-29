"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
    Search,
    Camera,
    X,
    AlertTriangle,
    CheckCircle2,
    Leaf,
    Info,
    Flame,
    Zap,
    Droplets,
    Wine,
    FlaskConical,
    Barcode
} from "lucide-react";

const ALLERGEN_MAP = [
    { id: "en:vegan", label: "Vegan", icon: <Leaf className="w-4 h-4" /> },
    { id: "en:milk", label: "Dairy", icon: "🥛" },
    { id: "en:peanuts", label: "Peanuts", icon: "🥜" },
    { id: "en:eggs", label: "Eggs", icon: "🥚" },
    { id: "en:gluten", label: "Gluten", icon: "🌾" },
    { id: "en:soybeans", label: "Soy", icon: "🫘" },
    { id: "en:nuts", label: "Tree Nuts", icon: "🌰" },
    { id: "en:fish", label: "Fish", icon: "🐟" },
    { id: "en:crustaceans", label: "Shellfish", icon: "🦞" },
    { id: "en:sesame-seeds", label: "Sesame", icon: "🥯" },
    { id: "en:mustard", label: "Mustard", icon: "🌭" },
    { id: "en:sulphites", label: "Sulfites", icon: <Wine className="w-4 h-4" /> }
];

const Skeleton = ({ className }) => <div className={`animate-pulse bg-slate-200 rounded-[2rem] ${className}`} />;

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 }
};

export default function SafeSwap() {
    const [input, setInput] = useState("");
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [myAllergies, setMyAllergies] = useState([]);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        if (input.length >= 8 && /^\d+$/.test(input)) {
            handleSearch(input);
        }
    }, [input]);

    const handleSearch = async (searchTerm = input) => {
        if (!searchTerm) return;
        setLoading(true);
        setError("");
        setProduct(null);
        setIsScannerOpen(false);

        try {
            const res = await fetch(`/api/proxy?q=${encodeURIComponent(searchTerm)}`);
            if (!res.ok) throw new Error("Product not found in database.");
            const data = await res.json();
            setProduct(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const startScanner = () => {
        setIsScannerOpen(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: { width: 250, height: 180 },
                aspectRatio: 1.0,
            });
            scanner.render((text) => {
                setInput(text);
                scanner.clear();
            }, () => { });
        }, 100);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 font-sans text-slate-900">
            <div className="max-w-2xl mx-auto space-y-8">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between px-2"
                >
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-800">MAGIC<span className="text-blue-600">LENS</span></h1>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Smart allergen detection</p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-blue-50 p-3 rounded-2xl cursor-pointer"
                    >
                        <Zap className="w-6 h-6 text-blue-600 fill-blue-600" />
                    </motion.div>
                </motion.div>

                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative group">
                    <div className="absolute inset-0 bg-blue-500/10 blur-2xl group-focus-within:bg-blue-500/20 transition-all rounded-full" />
                    <div className="relative bg-white p-2 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 flex items-center px-6 gap-3">
                            <Search className="text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="Scan barcode or type product..."
                                className="w-full py-4 outline-none font-bold text-slate-700 placeholder:text-slate-300 bg-transparent"
                            />
                        </div>
                        <div className="flex gap-2 p-1">

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSearch()}
                                disabled={loading}
                                className="px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all"
                            >
                                {loading ? "..." : "Analyze"}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {isScannerOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-6 backdrop-blur-md"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 50 }}
                                className="bg-white w-full max-w-md rounded-[3rem] p-8 relative overflow-hidden"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <Barcode className="text-blue-600" />
                                        <span className="font-black uppercase text-xs tracking-widest">Scanning Product</span>
                                    </div>
                                    <motion.button
                                        whileHover={{ rotate: 90 }}
                                        onClick={() => setIsScannerOpen(false)}
                                        className="p-2 bg-slate-100 rounded-full hover:text-red-500"
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                </div>
                                <div id="reader" className="rounded-2xl overflow-hidden border-4 border-slate-50"></div>
                                <p className="text-center mt-6 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Position barcode within the frame</p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your Restrictions</h2>
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
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex flex-wrap gap-2"
                    >
                        {ALLERGEN_MAP.map(item => {
                            const active = myAllergies.includes(item.id);
                            return (
                                <motion.button
                                    key={item.id}
                                    variants={itemVariants}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setMyAllergies(prev => active ? prev.filter(x => x !== item.id) : [...prev, item.id])}
                                    className={`px-4 py-2.5 rounded-2xl border-2 text-sm font-bold transition-all flex items-center gap-2 
                    ${active ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                                >
                                    <span className={active ? "text-white" : "opacity-70"}>{item.icon}</span>
                                    {item.label}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </motion.div>
                    ) : product ? (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                                <div className="p-8 flex items-center gap-8 border-b border-slate-50 bg-slate-50/30">
                                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="relative group">
                                        <div className="absolute inset-0 bg-blue-100 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img src={product.image_front_small_url} className="relative w-24 h-24 md:w-32 md:h-32 object-contain bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm" alt="product" />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight mb-2">{product.product_name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest">{product.brands || 'No Brand'}</span>
                                            {product.nutriscore_grade && (
                                                <motion.span
                                                    initial={{ x: 20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-widest
                                                    ${['a', 'b'].includes(product.nutriscore_grade) ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                                                    Nutri-Score {product.nutriscore_grade}
                                                </motion.span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <ResultContent product={product} selectedAllergies={myAllergies} />
                                </div>
                            </div>
                        </motion.div>
                    ) : error && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-red-50 rounded-[3rem] border-4 border-red-100 flex flex-col items-center text-center gap-4">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                            <p className="font-black uppercase text-sm tracking-tight text-red-800">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ResultContent({ product, selectedAllergies }) {
    const nutriments = product.nutriments || {};
    const analysisTags = product.ingredients_analysis_tags || [];
    const productAllergens = product.allergens_tags || [];

    const conflicts = [];
    selectedAllergies.forEach(id => {
        if (id === "en:vegan" && analysisTags.includes("en:non-vegan")) conflicts.push("Non-Vegan");
        else if (productAllergens.includes(id)) conflicts.push(ALLERGEN_MAP.find(a => a.id === id)?.label);
    });

    const isSafe = conflicts.length === 0;

    return (
        <div className="space-y-10">
            <motion.div
                animate={{
                    backgroundColor: isSafe ? '#ecfdf5' : '#fef2f2',
                    borderColor: isSafe ? '#d1fae5' : '#fee2e2'
                }}
                className={`p-8 rounded-[2.5rem] relative overflow-hidden border-2 transition-colors`}
            >
                <div className="relative z-10 flex flex-col items-center text-center gap-4">
                    <motion.div
                        key={isSafe ? 'safe' : 'danger'}
                        initial={{ scale: 0.5, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                    >
                        {isSafe ? <CheckCircle2 className="w-16 h-16 text-emerald-500" /> : <AlertTriangle className="w-16 h-16 text-red-500" />}
                    </motion.div>
                    <div>
                        <h4 className="text-3xl font-black tracking-tighter uppercase">{isSafe ? "Safe to Eat" : "Avoid This"}</h4>
                        <AnimatePresence>
                            {conflicts.length > 0 ? (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 0.7, height: "auto" }}
                                    className="mt-2 font-bold flex items-center justify-center gap-2"
                                >
                                    Matches Triggers: {conflicts.join(", ")}
                                </motion.p>
                            ) : (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.6 }}
                                    className="mt-1 font-bold"
                                >
                                    Matches your safety profile
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className={`absolute -right-8 -bottom-8 w-32 h-32 opacity-10 ${isSafe ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isSafe ? <CheckCircle2 className="w-full h-full" /> : <AlertTriangle className="w-full h-full" />}
                </div>
            </motion.div>

            <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Nutritional Balance (100g)</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <NutriCard label="Calories" value={nutriments['energy-kcal_100g']} unit="kcal" icon={<Flame className="w-3 h-3 text-orange-400" />} delay={0.1} />
                    <NutriCard label="Sugars" value={nutriments.sugars_100g} unit="g" alert={nutriments.sugars_100g > 22} delay={0.15} />
                    <NutriCard label="Fats" value={nutriments.fat_100g} unit="g" icon={<Droplets className="w-3 h-3 text-blue-400" />} delay={0.2} />
                    <NutriCard label="Salt" value={nutriments.salt_100g} unit="g" alert={nutriments.salt_100g > 1.5} delay={0.25} />
                </div>
            </div>

            <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <FlaskConical className="w-3 h-3" /> Ingredients List
                </h5>
                <div className="bg-slate-50/50 rounded-[2rem] p-2 border border-slate-100">
                    {(product.ingredients_text || "").split(/[,.;]/).slice(0, 8).map((ing, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (i * 0.05) }}
                            className="flex items-center justify-between p-4 hover:bg-white rounded-2xl transition-colors group"
                        >
                            <span className="text-sm font-bold text-slate-600 capitalize">{ing.trim().toLowerCase()}</span>
                            <div className="flex items-center gap-2">
                                <div className="p-2">
                                    <Info className="w-3 h-3 text-slate-200 group-hover:text-blue-400 transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function NutriCard({ label, value, unit, icon, alert, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`p-5 rounded-[2rem] border-2 transition-all shadow-sm
            ${alert ? 'bg-red-50 border-red-100 shadow-red-100/50' : 'bg-white border-slate-50 shadow-slate-200/50'}`}
        >
            <div className="flex items-center gap-1.5 mb-2">
                {icon}
                <p className={`text-[10px] font-black uppercase tracking-tighter ${alert ? 'text-red-400' : 'text-slate-400'}`}>{label}</p>
            </div>
            <p className={`text-xl font-black tracking-tight ${alert ? 'text-red-600' : 'text-slate-800'}`}>
                {value ? Number(value).toFixed(1) : '0'}
                <span className="text-xs ml-1 opacity-40 font-bold">{unit}</span>
            </p>
        </motion.div>
    );
}