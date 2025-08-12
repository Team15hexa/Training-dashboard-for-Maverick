import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";

const NotFound = () => {
  const location = useLocation();
  const { darkMode } = useDarkMode();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="text-center">
        <h1 className={`text-4xl font-bold mb-4 transition-all duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>404</h1>
        <p className={`text-xl mb-4 transition-all duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Oops! Page not found</p>
        <a href="/" className={`transition-all duration-300 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'} underline`}>
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
