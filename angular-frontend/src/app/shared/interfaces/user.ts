export interface Subject {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  role: string;
  subjects: Subject[];
}
