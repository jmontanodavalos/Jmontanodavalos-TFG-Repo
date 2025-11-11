export interface User {
   id: number;
   full_name: string;
   username: string;
   email: string;
   phone: string;
   password?: string;
   role: string;
   created_at: Date;
   subjects: number[];
}
