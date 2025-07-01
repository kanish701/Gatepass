'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Camera, CheckCircle, Car, User, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { transformVehicleData } from '@/lib/utils/vehicle';
import type { VehicleDisplay } from '@/lib/types';

export default function VerifyPage() {
  const [vehicleId, setVehicleId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setVehicleId(id);
      verifyVehicle(id);
    }
  }, [searchParams]);

  const verifyVehicle = async (id: string) => {
    if (!id) {
      toast.error('Please enter a vehicle ID');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Vehicle not found');
        setVehicleData(null);
        return;
      }

      if (data) {
        setVehicleData(transformVehicleData(data));
      } else {
        toast.error('Vehicle not found');
        setVehicleData(null);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify vehicle');
      setVehicleData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsArrived = async () => {
    if (!vehicleData) return;

    setIsLoading(true);
    try {
      const arrivalTime = new Date().toISOString();
      
      const { error } = await supabase
        .from('vehicles')
        .update({ 
          arrived: true, 
          arrival_time: arrivalTime 
        })
        .eq('id', vehicleData.id);

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Failed to mark arrival');
        return;
      }

      setVehicleData({
        ...vehicleData,
        arrived: true,
        arrivalTime: arrivalTime
      });
      toast.success('Vehicle marked as arrived!');
    } catch (error) {
      console.error('Arrival update error:', error);
      toast.error('Failed to mark arrival');
    } finally {
      setIsLoading(false);
    }
  };

  const startQRScanner = () => {
    setIsScanning(true);
    toast.info('QR Scanner feature requires camera permissions. For now, please enter the vehicle ID manually.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyVehicle(vehicleId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vehicle Verification
            </h1>
            <p className="text-gray-600">Scan QR code or enter vehicle ID to verify arrival</p>
          </div>

          {!vehicleData && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Verify Vehicle</CardTitle>
                <CardDescription>
                  Use the QR scanner or manually enter the vehicle ID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Button 
                    onClick={startQRScanner}
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <Camera className="w-5 h-5" />
                    Start QR Scanner
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or enter manually
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="vehicleId">Vehicle ID</Label>
                    <Input
                      id="vehicleId"
                      placeholder="Enter vehicle ID"
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify Vehicle'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {vehicleData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Vehicle ID</p>
                    <p className="font-semibold text-lg">{vehicleData.id}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Vehicle Number</p>
                    <p className="font-semibold text-lg">{vehicleData.vehicleNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">{vehicleData.vehicleType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-medium">{vehicleData.capacity} people</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium">{vehicleData.fromDistrict}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Driver Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{vehicleData.driverName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{vehicleData.contactNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4" />
                    <h3 className="font-semibold">Timeline</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Registered:</span>
                      <span className="text-sm font-medium">
                        {new Date(vehicleData.registrationTime).toLocaleString()}
                      </span>
                    </div>
                    {vehicleData.arrived && vehicleData.arrivalTime && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Arrived:</span>
                        <span className="text-sm font-medium text-green-600">
                          {new Date(vehicleData.arrivalTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  {vehicleData.arrived ? (
                    <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <span className="text-green-700 font-medium text-lg">
                        Vehicle Already Arrived
                      </span>
                    </div>
                  ) : (
                    <Button 
                      onClick={markAsArrived}
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Marking...' : 'Mark as Arrived'}
                    </Button>
                  )}
                </div>

                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setVehicleData(null);
                      setVehicleId('');
                    }}
                  >
                    Verify Another Vehicle
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center mt-8">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}