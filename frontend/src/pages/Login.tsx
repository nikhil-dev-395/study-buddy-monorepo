import LoginButton from "../components/login/LoginButton";

export default function Login() {
  return (
    <>
      <div className="flex flex-col justify-center items-center max-h-screen">
        {/* we will study buddy icon later */}

        <img
          src="src/assets/image.png"
          alt="Study Buddy Icon"
          className="w-32 h-32 mb-8 object-cover rounded-full"
        />

        <h1 className="text-4xl font-bold mb-4">Study Buddy ...</h1>
        <p className="text-lg mb-8 text-center text-slate-400">
          Your ultimate companion for effective studying and productivity.
        </p>

        <LoginButton />
      </div>
    </>
  );
}
