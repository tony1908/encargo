'use client';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-sm font-medium text-gray-900">CargoEncar</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
          </div>

          <div className="text-sm text-gray-500">
            © 2024 CargoEncar. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
