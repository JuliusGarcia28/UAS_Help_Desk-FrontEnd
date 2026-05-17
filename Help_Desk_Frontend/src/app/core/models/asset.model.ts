export interface Asset {
  id: string;
  hostname: string;
  asset_type: string;
  serial_number: string;
  operative_system: string;
  cpu: string;
  ram: number;
  ip_address: string;

  status: number;

  responsible?: {
    id: string;
    email: string;
    department?: {
      id: string;
      name: string;
    };
  };

  department?: {
    id: string;
    name: string;
  };
}