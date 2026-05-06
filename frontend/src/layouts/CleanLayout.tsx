import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CleanLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col h-screen overflow-hidden">
      <Navbar />
      <main className="flex-grow pt-16 h-full relative">
        <Outlet />
      </main>
    </div>
  );
};

export default CleanLayout;
