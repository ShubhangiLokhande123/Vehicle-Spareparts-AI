export enum Screen {
  Home,
  SelectImage,
  Preview,
  Processing,
  VehicleConfirm,
  VehicleDetail,
  PartResults,
  PartDetail,
  Settings,
  SavedParts,
  History,
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  variant: string;
  confidenceScore: number;
  imageUrl?: string;
}

export interface VehicleIdentification extends Omit<Vehicle, 'id' | 'imageUrl'> {
  identification_id: number;
  created_at: string;
  user_confirmed: boolean;
  image_storage_path?: string;
  localImageUri?: string;
}

export interface Part {
  id?: number;
  name: string;
  imageUrl: string;
  sku: string;
  description: string;
  category: string;
  confidenceScore?: number;
}
