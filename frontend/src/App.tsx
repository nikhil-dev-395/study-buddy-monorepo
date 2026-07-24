import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
function App() {
  return (
    <div className="App py-10 px-10     ">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
