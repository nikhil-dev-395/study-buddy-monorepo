import { useState } from "react";

type SearchBoxProps = {
  text: string;
};

export function SearchBox({ text }: SearchBoxProps) {
  const [searchText, setSearchText] = useState(text);
  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="bg-slate-800 text-slate-300 placeholder:text-slate-500 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
        />
      </div>
    </>
  );
}
