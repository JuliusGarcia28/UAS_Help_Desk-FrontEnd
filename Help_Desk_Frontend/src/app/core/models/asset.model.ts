export interface Asset {
  id: number;
  hostname: string;
  asset_type: string;
  serial_number: string;
  operative_system: string;
  cpu: string;
  ram: number;
  ip_address: string;

  status: number;

  responsible?: {
    id: number;
    email: string;
    department?: {
      id: number;
      name: string;
    };
  };

  department?: {
    id: number;
    name: string;
  };
}