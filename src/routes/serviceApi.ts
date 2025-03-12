import axios from "axios";
import { Service } from "../features/services/serviceTypes";

const API_URL = "http://localhost:6002/api/";

export const getServices = async (): Promise<Service[]> => {
  const response = await axios.get(`${API_URL}services`);
  console.log("🚀 ~ getServices ~ response:", response)
  return response.data.data;
};

export const addService = async (service: Service): Promise<Service> => {
  const response = await axios.post(`${API_URL}services/create`, service);
  return response.data;
};
