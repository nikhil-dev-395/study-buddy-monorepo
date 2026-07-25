import { createContext, useContext, useState } from "react";
const AuthContext = createContext({
  isLoggedIn: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsLoggedIn: (value: boolean) => {},
});
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // REMEMBER :  Replace with your actual authentication logic
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // NOTE :  if we want to use login true environment
  //   if (!isLoggedIn) {
  //     setIsLoggedIn(true);
  //   }
  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
