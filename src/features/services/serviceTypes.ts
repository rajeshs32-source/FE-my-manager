import { serviceEnum } from "../../enum/serviceEnum";

export interface Service {
    _id?: string; 
    name: string;
    description?: string;
    tags: string[];
    category: serviceEnum;
  }
  