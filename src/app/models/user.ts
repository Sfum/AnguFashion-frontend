import firebase from 'firebase/compat/app';

export interface User extends firebase.User {
    uid: string;
    user_email: string;
    displayName: string;
    photoUrl: string;
    address: string;
    postcode: string;
    country: string;
    is_brand: boolean;
    role: string;
    brand_name: string;
    brand_description: string;
    brandId: number;
}
