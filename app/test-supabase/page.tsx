'use client';
import supabase from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function TestSupabase() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('vehicles').select('*');
        if (error) {
          console.error('Supabase error:', error);
          setError(error.message);
        } else {
          setVehicles(data ?? []);
          console.log('Supabase connection successful!', data);
        }
      } catch (err) {
        console.error('Connection error:', err);
        setError('Failed to connect to Supabase');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Supabase Connection Test</h1>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Testing connection...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h2 className="text-red-800 font-semibold">Connection Error:</h2>
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-red-500 mt-2">
                Make sure the 'vehicles' table exists in your Supabase database.
              </p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="text-green-800 font-semibold">✅ Supabase Connected Successfully!</h2>
                <p className="text-green-600">Found {vehicles.length} vehicles in the database.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Vehicle Data:</h3>
                <pre className="text-sm text-gray-600 overflow-auto max-h-96">
                  {JSON.stringify(vehicles, null, 2)}
                </pre>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-800 font-semibold">Next Steps:</h3>
                <ul className="text-blue-600 text-sm mt-2 space-y-1">
                  <li>• Create the 'vehicles' table in Supabase if it doesn't exist</li>
                  <li>• Set up Row Level Security (RLS) policies</li>
                  <li>• Update the application to use Supabase instead of the Express server</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}