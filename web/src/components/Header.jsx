import { Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { FaBolt, FaBell } from "react-icons/fa6";

const Header = ({
  title,
  subtitle,
  onTestAlert,
  connectionStatus,
  onToggleMenu,
  isMenuOpen,
}) => {
  return (
    <header className="bg-gradient-to-r from-primary-blue to-[#667eea] text-white py-4 px-4 sm:py-6 sm:px-8 shadow-custom sticky top-0 z-[1000]">
      <div className="flex items-center justify-between w-full">
        {/* Left side: Toggle + Title */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {/* Menu Toggle Button */}
          {onToggleMenu && (
            <button
              onClick={onToggleMenu}
              className="lg:hidden bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 transition-all flex-shrink-0"
            >
              {isMenuOpen ? (
                <HiX className="text-xl sm:text-2xl" />
              ) : (
                <HiMenu className="text-xl sm:text-2xl" />
              )}
            </button>
          )}

          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="text-2xl sm:text-4xl animate-pulse flex-shrink-0">
              <FaBolt />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold m-0 truncate">{title}</h1>
              <div className="text-xs sm:text-sm opacity-90 hidden sm:block truncate">{subtitle}</div>
            </div>
          </div>
        </div>

        {/* Right side: Status + Actions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {connectionStatus && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/20 py-1.5 px-2 sm:py-2 sm:px-3 lg:px-4 rounded-full text-xs sm:text-sm">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary-green animate-blink"></div>
              <span className="hidden sm:inline">{connectionStatus}</span>
            </div>
          )}
          {onTestAlert && (
            <button
              onClick={onTestAlert}
              className="bg-white/20 border-none text-white p-2 sm:py-2 sm:px-4 rounded-full cursor-pointer text-sm sm:text-base transition-all hover:bg-white/30 hover:scale-105"
              title="Test Alert System"
            >
              <FaBell />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
