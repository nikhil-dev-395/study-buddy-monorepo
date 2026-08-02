export default function InputBar() {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        className="bg-gray-800 text-gray-300 placeholder:text-gray-500 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl w-[300px] py-2 px-4  mt-10"
      />
    </div>
  );
}
