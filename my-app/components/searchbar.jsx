"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://world.openfoodfacts.org/cgi/suggest.pl?term=${input}&lc=en`
        );
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 200); 

    return () => clearTimeout(delay);
  }, [input]);

  const handleSelect = (name) => {
    setSuggestions([]);
    setInput(name);
    router.push(`/?q=${encodeURIComponent(name)}`);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a product (e.g. Oreo)..."
          className="w-full p-3 text-black border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-all"
        />
        {loading && (
          <div className="absolute right-3 animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border mt-1 rounded-lg shadow-2xl max-h-60 overflow-auto">
          {suggestions.map((item, i) => (
            <li
              key={i}
              onClick={() => handleSelect(item.text)}
              className="p-3 hover:bg-blue-50 cursor-pointer text-black border-b last:border-0"
            >
              {item.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}