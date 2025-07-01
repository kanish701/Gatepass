'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Download, Car, CheckCircle, Copy } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import supabase from '@/lib/supabaseClient';
import type { FormData } from '@/lib/types';

const formSchema = z.object({
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  vehicleNumber: z.string().min(3, 'Vehicle number must be at least 3 characters'),
  capacity: z.string().min(1, 'Capacity is required'),
  fromDistrict: z.string().min(1, 'District is required'),
  driverName: z.string().min(2, 'Driver name must be at least 2 characters'),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
});

const vehicleTypes = [
  'Van', 'Bus', 'Mini Bus', 'Car', 'Bike', 'Auto Rickshaw', 'Truck', 'Tempo'
];

const districts = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
  'Vellore', 'Erode', 'Thanjavur', 'Dindigul', 'Cuddalore', 'Kanchipuram',
  'Namakkal', 'Karur', 'Tiruvannamalai', 'Virudhunagar', 'Theni', 'Sivaganga',
  'Ramanathapuram', 'Thoothukudi', 'Kanniyakumari', 'Dharmapuri', 'Krishnagiri',
  'The Nilgiris', 'Nagapattinam', 'Pudukkottai', 'Tiruvarur', 'Ariyalur',
  'Perambalur', 'Kallakurichi', 'Chengalpattu', 'Tenkasi', 'Tirupathur',
  'Mayiladuthurai', 'Ranipet'
];

interface RegistrationData {
  vehicle: {
    id: string;
    vehicleNumber: string;
    vehicleType: string;
    capacity: number;
    fromDistrict: string;
    driverName: string;
    contactNumber: string;
    registrationTime: string;
  };
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [qrValue, setQrValue] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleType: '',
      vehicleNumber: '',
      capacity: '',
      fromDistrict: '',
      driverName: '',
      contactNumber: '',
    },
  });

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([
          {
            vehicle_type: values.vehicleType,
            vehicle_number: values.vehicleNumber.toUpperCase(),
            capacity: parseInt(values.capacity),
            from_district: values.fromDistrict,
            driver_name: values.driverName,
            contact_number: values.contactNumber,
            registration_time: new Date().toISOString(),
            arrived: false,
            arrival_time: null
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Registration failed: ' + error.message);
        return;
      }

      if (!data) {
        toast.error('Registration failed: No data returned');
        return;
      }

      // Generate QR code link
      const qrLink = `${window.location.origin}/verify?id=${data.id}`;
      
      // Update the record with QR code link
      await supabase
        .from('vehicles')
        .update({ qr_code: qrLink })
        .eq('id', data.id);

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(qrLink, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrValue(qrLink);
      setQrCodeDataUrl(qrDataUrl);
      setRegistrationData({
        vehicle: {
          id: data.id,
          vehicleNumber: data.vehicle_number,
          vehicleType: data.vehicle_type,
          capacity: data.capacity,
          fromDistrict: data.from_district,
          driverName: data.driver_name,
          contactNumber: data.contact_number,
          registrationTime: data.registration_time
        }
      });

      toast.success('Vehicle registered successfully!');
      form.reset();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeDataUrl && registrationData) {
      const downloadLink = document.createElement('a');
      downloadLink.href = qrCodeDataUrl;
      downloadLink.download = `vehicle-qr-${registrationData.vehicle.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('QR code downloaded successfully!');
    }
  };

  const copyQRLink = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      toast.success('QR link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (registrationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Registration Successful!
              </h1>
              <p className="text-gray-600">Your vehicle has been registered for the Maanadu event</p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Vehicle ID</p>
                    <p className="font-semibold text-sm font-mono">{registrationData.vehicle.id}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Vehicle Number</p>
                    <p className="font-semibold">{registrationData.vehicle.vehicleNumber}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="font-semibold">{registrationData.vehicle.vehicleType}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Capacity</p>
                    <p className="font-semibold">{registrationData.vehicle.capacity} people</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">From District</p>
                    <p className="font-semibold">{registrationData.vehicle.fromDistrict}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Driver</p>
                    <p className="font-semibold">{registrationData.vehicle.driverName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-center">QR Code for Verification</CardTitle>
                <CardDescription className="text-center">
                  Show this QR code at the event venue for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-white rounded-xl shadow-sm border-2 border-gray-100">
                    {qrCodeDataUrl && (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code" 
                        className="w-48 h-48 rounded-lg"
                      />
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button onClick={downloadQRCode} className="flex-1 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download QR Code
                    </Button>
                    <Button onClick={copyQRLink} variant="outline" className="flex-1 flex items-center gap-2">
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </Button>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-1">Verification Link:</p>
                    <p className="text-xs text-blue-600 break-all font-mono">{qrValue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <Button variant="outline" asChild className="mr-4">
                <Link href="/register">Register Another Vehicle</Link>
              </Button>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vehicle Registration
            </h1>
            <p className="text-gray-600">Register your vehicle for the Maanadu event</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registration Form</CardTitle>
              <CardDescription>
                Please fill in all the required information about your vehicle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., TN01AB1234" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seating Capacity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Number of people the vehicle can carry" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fromDistrict"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From District/Place</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districts.map(district => (
                              <SelectItem key={district} value={district}>{district}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="driverName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name of the driver" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="10-digit mobile number" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register Vehicle'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

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