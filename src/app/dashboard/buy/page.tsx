'use client';

import { useState } from 'react';
import { ShieldCheckIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function BuyInsurancePage() {
  const [formData, setFormData] = useState({
    containerNumber: '',
    merchandiseValue: '',
    expectedArrivalDate: '',
    origin: '',
    destination: '',
  });

  const [showQuote, setShowQuote] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculatePremium = () => {
    const value = parseFloat(formData.merchandiseValue) || 0;
    return (value * 0.02).toFixed(2); // 2% of merchandise value
  };

  const handleGetQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setShowQuote(true);
  };

  const handlePurchase = () => {
    alert('Insurance policy purchased successfully!');
    // Here you would integrate with your blockchain/payment logic
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buy Insurance</h1>
        <p className="text-gray-600">Protect your cargo against delivery delays</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Container Details</h2>

          <form onSubmit={handleGetQuote} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Container Tracking Number
              </label>
              <input
                type="text"
                name="containerNumber"
                value={formData.containerNumber}
                onChange={handleInputChange}
                placeholder="e.g., MSCU1234567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origin Port
              </label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                placeholder="e.g., Shanghai, China"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Port
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="e.g., Los Angeles, USA"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merchandise Value (USD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="merchandiseValue"
                  value={formData.merchandiseValue}
                  onChange={handleInputChange}
                  placeholder="50000"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Arrival Date
              </label>
              <input
                type="date"
                name="expectedArrivalDate"
                value={formData.expectedArrivalDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Get Quote
            </button>
          </form>
        </div>

        {/* Quote Section */}
        <div className="space-y-6">
          {showQuote ? (
            <>
              {/* Insurance Quote */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheckIcon className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Insurance Quote</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-indigo-100">Coverage Amount</span>
                    <span className="font-semibold text-xl">
                      ${parseFloat(formData.merchandiseValue).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-indigo-100">Premium (2%)</span>
                    <span className="font-semibold text-xl">${calculatePremium()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-indigo-100">Daily Compensation</span>
                    <span className="font-semibold text-xl">
                      ${(parseFloat(formData.merchandiseValue) * 0.01).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coverage Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Coverage Details</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                    <span>1% of merchandise value per day of delay</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                    <span>Coverage starts from expected arrival date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                    <span>Real-time container tracking included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                    <span>Instant claims processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                    <span>24/7 support available</span>
                  </li>
                </ul>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    By purchasing this insurance policy, you agree to the following terms:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>Claims must be filed within 30 days of the delay</li>
                    <li>Proof of container tracking required</li>
                    <li>Maximum coverage period: 60 days from expected arrival</li>
                    <li>Force majeure events may affect coverage</li>
                  </ul>
                </div>

                <div className="mt-6 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the terms and conditions and understand the coverage details
                  </label>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Purchase Insurance - ${calculatePremium()}
              </button>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Your Quote</h3>
              <p className="text-sm text-gray-600">
                Fill in the container details to receive an instant insurance quote
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
