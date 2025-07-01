'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Search, RefreshCw, Users, Car, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import supabase from '@/lib/supabaseClient';
import { transformVehicleData, generateCSV, downloadCSV } from '@/lib/utils/vehicle';
import type { VehicleDisplay, VehicleStats } from '@/lib/types';

export default function AdminPage() {
  const [vehicles, setVehicles] = useState<VehicleDisplay[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleDisplay[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchTerm, statusFilter, districtFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .order('registration_time', { ascending: false });

      if (vehiclesError) {
        console.error('Supabase error:', vehiclesError);
        toast.error('Failed to fetch vehicles');
        return;
      }

      if (!vehiclesData) {
        toast.error('No data received');
        return;
      }

      // Transform data to match the expected format
      const transformedVehicles = vehiclesData.map(transformVehicleData);
      setVehicles(transformedVehicles);

      // Calculate stats
      const totalVehicles = transformedVehicles.length;
      const arrivedVehicles = transformedVehicles.filter(v => v.arrived).length;
      const pendingVehicles = totalVehicles - arrivedVehicles;

      // Group by district
      const byDistrict = transformedVehicles.reduce((acc, vehicle) => {
        acc[vehicle.fromDistrict] = (acc[vehicle.fromDistrict] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStats({
        total: totalVehicles,
        arrived: arrivedVehicles,
        pending: pendingVehicles,
        byDistrict
      });

    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = vehicles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((vehicle) =>
        vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((vehicle) =>
        statusFilter === 'arrived' ? vehicle.arrived : !vehicle.arrived
      );
    }

    // District filter
    if (districtFilter !== 'all') {
      filtered = filtered.filter((vehicle) =>
        vehicle.fromDistrict === districtFilter
      );
    }

    setFilteredVehicles(filtered);
  };

  const exportToCSV = () => {
    try {
      const csvContent = generateCSV(filteredVehicles);
      downloadCSV(csvContent, 'vehicle-registrations.csv');
      toast.success('CSV file downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV file');
    }
  };

  const getUniqueDistricts = () => {
    const districts = vehicles.map((vehicle) => vehicle.fromDistrict);
    return [...new Set(districts)].sort();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage vehicle registrations and track arrivals</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full mr-4">
                    <Car className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-gray-600">Total Vehicles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-full mr-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.arrived}</p>
                    <p className="text-sm text-gray-600">Arrived</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-full mr-4">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-full mr-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Object.keys(stats.byDistrict).length}</p>
                    <p className="text-sm text-gray-600">Districts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vehicle Management</CardTitle>
            <CardDescription>
              Filter and manage all vehicle registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by vehicle number, driver name, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="arrived">Arrived</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {getUniqueDistricts().map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              Showing {filteredVehicles.length} of {vehicles.length} vehicles
            </div>

            {/* Vehicles Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle ID</TableHead>
                    <TableHead>Vehicle Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-mono text-sm">{vehicle.id}</TableCell>
                      <TableCell className="font-semibold">{vehicle.vehicleNumber}</TableCell>
                      <TableCell>{vehicle.vehicleType}</TableCell>
                      <TableCell>{vehicle.driverName}</TableCell>
                      <TableCell>{vehicle.fromDistrict}</TableCell>
                      <TableCell>{vehicle.capacity}</TableCell>
                      <TableCell>
                        <Badge variant={vehicle.arrived ? "default" : "secondary"}>
                          {vehicle.arrived ? 'Arrived' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(vehicle.registrationTime).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredVehicles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No vehicles found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>

        {/* District Statistics */}
        {stats && Object.keys(stats.byDistrict).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>District Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(stats.byDistrict).map(([district, count]) => (
                  <div key={district} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-lg">{count}</p>
                    <p className="text-sm text-gray-600">{district}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}