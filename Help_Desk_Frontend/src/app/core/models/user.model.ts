export interface Department {
  id: string;
  name: string;
  description: string;
  status: number;
  parent: string | null;
}

export interface User {
  id: string;

  username: string;

  first_name: string;

  last_name: string;

  email: string;

  role: string;

  status: number;

  department: Department | null;
}