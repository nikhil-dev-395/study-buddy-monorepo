import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router.tsx";
// import { AuthProvider } from "./context/AuthProvider";
function App() {
  return (
    <div className="App py-10 px-10  bg-black text-white min-h-screen ">
      {/* <AuthProvider> */}
        <RouterProvider router={router} />
      {/* </AuthProvider> */}
    </div>
  );
}

export default App;
