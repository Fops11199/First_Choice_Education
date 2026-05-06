import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CleanLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 relative">
        <Outlet />
      </main>
    </div>
  );
};

export default CleanLayout;
