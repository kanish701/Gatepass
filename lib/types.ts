export interface Vehicle {
  id: string;
  vehicle_type: string;
  vehicle_number: string;
  capacity: number;
  from_district: string;
  driver_name: string;
  contact_number: string;
  registration_time: string;
  arrived: boolean;
  arrival_time: string | null;
  qr_code: string | null;
}

export interface VehicleDisplay {
  id: string;
  vehicleType: string;
  vehicleNumber: string;
  capacity: number;
  fromDistrict: string;
  driverName: string;
  contactNumber: string;
  registrationTime: string;
  arrived: boolean;
  arrivalTime: string | null;
}

export interface VehicleStats {
  total: number;
  arrived: number;
  pending: number;
  byDistrict: Record<string, number>;
}

export interface FormData {
  vehicleType: string;
  vehicleNumber: string;
  capacity: string;
  fromDistrict: string;
  driverName: string;
  contactNumber: string;
}