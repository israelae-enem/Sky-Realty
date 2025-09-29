// components/RentAnalyticsCards.tsx
import useRentAnalytics from "@/app/hooks/useAnalytics";

export default function RentAnalyticsCards() {
  const analytics = useRentAnalytics();

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-700 p-4 rounded text-white">
        <h2>Total Rent Collected</h2>
        <p className="text-2xl font-bold">${analytics.total_collected}</p>
      </div>
      <div className="bg-gray-700 p-4 rounded text-white">
        <h2>Outstanding Rents</h2>
        <p className="text-2xl font-bold">${analytics.total_outstanding}</p>
      </div>
      <div className="bg-gray-700 p-4 rounded text-white">
        <h2>Late Rents</h2>
        <p className="text-2xl font-bold">${analytics.total_late}</p>
      </div>
      <div className="bg-gray-700 p-4 rounded text-white">
        <h2>Occupied Properties</h2>
        <p className="text-2xl font-bold">{analytics.occupied_properties}</p>
      </div>
    </div>
  );
}