export interface Vehicle {
    ownerId: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    insuranceService?: boolean;
    image?: {
      beforeService?: string;
      afterService?: string;
      date?: Date;
    }[];
  }