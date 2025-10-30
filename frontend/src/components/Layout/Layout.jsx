import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="pt-16 grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;



// import { Outlet } from "react-router-dom";
// import Header from "./Header";
// import Footer from "./Footer";
// import { useAuth } from "../../contexts/AuthContext";

// const Layout = () => {
//   const { user } = useAuth();

//   return (
//     <div className="min-h-screen bg-white dark:bg-primary-900 text-primary-500 dark:text-gray-100 transition-colors duration-300 ease-in-out font-body">
//       {/* Global Header */}
//       <Header user={user} />

//       {/* Main Content */}
//       <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full animate-fade-in">
//         <Outlet />
//       </main>

//       {/* Global Footer */}
//       <Footer />
//     </div>
//   );
// };

// export default Layout;
