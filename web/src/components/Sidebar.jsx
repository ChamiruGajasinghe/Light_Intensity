import { Link, useLocation } from "react-router-dom";
import { HiChartBar, HiClock } from "react-icons/hi";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: HiChartBar, label: "Dashboard" },
    { path: "/history", icon: HiClock, label: "History" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-sidebar-dark py-6 shadow-[2px_0_10px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out
          fixed top-[60px] sm:top-[80px] left-0 h-[calc(100vh-60px)] sm:h-[calc(100vh-80px)] z-50 w-[250px] sm:w-[280px] lg:w-[250px] 
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <nav>
          <ul className="list-none m-0 p-0">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path} className="my-2">
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-4 py-4 px-8 text-text-dark no-underline transition-all ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-primary-blue to-transparent border-l-4 border-primary-blue"
                        : "hover:bg-gradient-to-r hover:from-primary-blue hover:to-transparent hover:border-l-4 hover:border-primary-blue"
                    }`}
                  >
                    <IconComponent className="text-xl w-6" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
