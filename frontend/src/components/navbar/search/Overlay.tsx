import { SearchBox } from "./SearchBox";

type SearchOverlayProps = {
  onClose: () => void;
};

export function SearchOverlay({ onClose }: SearchOverlayProps) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-20">
        <div className="w-full max-w-2xl rounded-xl bg-white p-6 text-black shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Search</h2>

            <button onClick={onClose}>✕</button>
          </div>

          <SearchBox text="" />
        </div>
      </div>
    </>
  );
}
