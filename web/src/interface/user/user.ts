export interface UserType {
    user_id : number;
    username: string;
    // password: string;
    role:  "admin" | "manager" | "individual" | "merchant";
    phone: string;
    address: object[];
}

export interface Address {
    name: string;
    phone: string;
    detail: string;
}