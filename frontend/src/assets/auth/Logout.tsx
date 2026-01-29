import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthAPI from "../../lib/auth/AuthApi";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await AuthAPI.logout();
      } catch (err) {
        console.log(err);
      } finally {
        localStorage.clear();
        navigate('/', { replace: true });
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;
