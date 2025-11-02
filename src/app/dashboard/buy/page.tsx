'use client';

import { useState } from 'react';

export default function BuyInsurancePage() {
  const [formData, setFormData] = useState({
    containerNumber: '',
    merchandiseValue: '',
    expectedArrivalDate: '',
    origin: '',
    destination: '',
  });

  const [showQuote, setShowQuote] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculatePremium = () => {
    const value = parseFloat(formData.merchandiseValue) || 0;
    return (value * 0.02).toFixed(2);
  };

  const calculateDailyCompensation = () => {
    const value = parseFloat(formData.merchandiseValue) || 0;
    return (value * 0.01).toFixed(2);
  };

  const handleGetQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setShowQuote(true);
  };

  const handlePurchase = () => {
    if (acceptTerms) {
      alert('Insurance policy purchased successfully!');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Buy Insurance</h1>
        <p className="text-sm text-gray-500 mt-1">Container delay protection</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleGetQuote} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-2">Container Number</label>
                <input
                  type="text"
                  name="containerNumber"
                  value={formData.containerNumber}
                  onChange={handleInputChange}
                  placeholder="MSCU1234567"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-2">Value (USD)</label>
                <input
                  type="number"
                  name="merchandiseValue"
                  value={formData.merchandiseValue}
                  onChange={handleInputChange}
                  placeholder="50000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-2">Origin</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  placeholder="Shanghai"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-2">Destination</label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="Los Angeles"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-2">Expected Arrival</label>
                <input
                  type="date"
                  name="expectedArrivalDate"
                  value={formData.expectedArrivalDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Get Quote
            </button>
          </form>

          {showQuote && (
            <div className="mt-8 space-y-6">
              {/* Quote Details */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Quote Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coverage Amount</span>
                    <span className="font-medium text-gray-900">
                      ${parseFloat(formData.merchandiseValue).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Premium (2%)</span>
                    <span className="font-medium text-gray-900">${calculatePremium()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Daily Compensation (1%)</span>
                    <span className="font-medium text-gray-900">${calculateDailyCompensation()}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Terms</h3>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li>• Coverage starts from expected arrival date</li>
                  <li>• 1% daily compensation for delays</li>
                  <li>• Maximum coverage: 60 days</li>
                  <li>• Real-time tracking included</li>
                  <li>• 24-48 hour claim processing</li>
                </ul>

                <div className="mt-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600">
                    I accept the terms and conditions
                  </label>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={!acceptTerms}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
                  acceptTerms
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Purchase Insurance - ${calculatePremium()}
              </button>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Coverage</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p>Container delay insurance provides compensation for late deliveries.</p>
              <p className="font-medium text-gray-900 mt-2">You receive:</p>
              <p>• 1% of value per day delayed</p>
              <p>• Instant claim processing</p>
              <p>• Real-time tracking</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Process</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex gap-2">
                <span className="font-medium text-gray-900">1.</span>
                <span>Enter container details</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-900">2.</span>
                <span>Review quote & terms</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-900">3.</span>
                <span>Purchase policy</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-900">4.</span>
                <span>Track & claim if delayed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}