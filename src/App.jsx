import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRouter from './AppRouter';
import api from './utils/api';

function App() {
  useEffect(() => {
    // 1. Check for session expired signal from API interceptor
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session_expired')) {
      toast.error("Session expired. Please login again.");
      // Clean URL
      window.history.replaceState({}, document.title, "/");
    }

    // 2. Validate session on mount if token exists
    const validateSession = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          await api.get('/users/profile');
        } catch (error) {
          // api.js interceptor handles 401, so we just catch 
          // any other unexpected errors here.
          console.error("Session validation failed:", error);
        }
      }
    };

    validateSession();
  }, []);

  return (
    <div>
      <AppRouter />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
