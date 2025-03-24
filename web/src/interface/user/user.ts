export interface UserType {
    user_id : number;
    username: string;
    password: string;
    role:  "admin" | "manager" | "individual" | "merchant";
    phone: string;
}