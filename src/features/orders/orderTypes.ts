interface VehicleDetails {
    make: string;
    model: string;
    year: string;
    licensePlate: string;
    insuranceService: boolean;
}

interface RevenueDetails {
    serviceCategory: string;
    advancePayment: string;
    paymentDate: Date;
    paymentMode: string;
}

interface ServiceDetails {
    serviceType: string;
    description: string;
}

interface Address {
    addressLine1: string;
    addressLine2: string;
    city: string;
    postalCode: string;
};

interface User {
    name: string;
    phone: string;
    address: Address;
}

export interface Order {
    _id?: string;
    user: User;
    orderDate?: Date;
    vehicle: VehicleDetails;
    revenueDetail: RevenueDetails[];
    services: ServiceDetails[];
    status?: string;
}
