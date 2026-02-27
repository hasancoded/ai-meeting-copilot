import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Video, LogOut, User, Menu, X, Settings } from "lucide-react";
import { Button } from "./ui/Button";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-3 group transition-transform hover:scale-105"
            >
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-xl shadow-sm">
                <Video className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                Meeting Copilot
              </span>
            </Link>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-700">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{user?.email}</span>
              </div>
              <Link
                to="/settings"
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white animate-slide-down">
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-700">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{user?.email}</span>
              </div>
              <Link
                to="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 AI Meeting Copilot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
