import { useState } from "react";

type InputBarProps = {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
};

export default function InputBar({ value, onChange, onSearch }: InputBarProps) {
  const [query, setQuery] = useState(value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange?.(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch?.(query);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto mt-8">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search by subject, skill, or location (e.g., React, Seattle)..."
        className="w-full pl-11 pr-10 py-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 text-zinc-100 placeholder:text-zinc-500 text-sm backdrop-blur-md shadow-lg transition-all duration-300 focus:outline-none focus:border-zinc-700 focus:ring-2 focus:ring-emerald-500/20"
      />

      {/* Clear Button (appears when typing) */}
      {query && (
        <button
          onClick={() => {
            setQuery("");
            onChange?.("");
          }}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
