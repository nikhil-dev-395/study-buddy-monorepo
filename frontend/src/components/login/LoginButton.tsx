import { FcGoogle } from "react-icons/fc";

export default function LoginUser() {
  return (
    <>
      {/* <h1>LoginUser</h1> */}

      {/* we need to create ui */}
      <div className="gap-4 bg-white text-black inline p-4 rounded-md hover:scale-105 transition-transform duration-300 cursor-pointer">
        {/* continue with google login */}
        <button className="flex items-center gap-2 outline-none border-none cursor-pointer">
          <FcGoogle size={28} />
          login with google
        </button>
      </div>
    </>
  );
}
