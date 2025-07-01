import type { Vehicle, VehicleDisplay } from '../types';

export function transformVehicleData(vehicle: Vehicle): VehicleDisplay {
  return {
    id: vehicle.id,
    vehicleType: vehicle.vehicle_type,
    vehicleNumber: vehicle.vehicle_number,
    capacity: vehicle.capacity,
    fromDistrict: vehicle.from_district,
    driverName: vehicle.driver_name,
    contactNumber: vehicle.contact_number,
    registrationTime: vehicle.registration_time,
    arrived: vehicle.arrived,
    arrivalTime: vehicle.arrival_time,
  };
}

export function generateCSV(vehicles: VehicleDisplay[]): string {
  const headers = [
    'Vehicle ID',
    'Vehicle Number',
    'Type',
    'Driver',
    'District',
    'Capacity',
    'Status',
    'Registered',
    'Arrived'
  ];

  const rows = vehicles.map(vehicle => [
    vehicle.id,
    vehicle.vehicleNumber,
    vehicle.vehicleType,
    vehicle.driverName,
    vehicle.fromDistrict,
    vehicle.capacity.toString(),
    vehicle.arrived ? 'Arrived' : 'Pending',
    new Date(vehicle.registrationTime).toLocaleDateString(),
    vehicle.arrivalTime ? new Date(vehicle.arrivalTime).toLocaleDateString() : 'N/A'
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}