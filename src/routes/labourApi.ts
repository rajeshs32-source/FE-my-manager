import axios from "axios";
import { Labour } from "../features/labour/labourType";

const API_URL = "http://localhost:6002/api/";

export const getAllLabours = async (): Promise<Labour[]> => {
  const response = await axios.get(`${API_URL}labour`);
  console.log("🚀 ~ getAllLabours ~ response:", response)
  return response.data.data;
};

export const addLabour = async (order: Labour): Promise<Labour> => {
  const response = await axios.post(`${API_URL}labour/create`, order);
  return response.data;
};

export const deleteLabour= async (id: string): Promise<Labour> => {
    const response = await axios.delete(`${API_URL}labour/${id}`);
    console.log("🚀 ~ deleteLabour ~ response:", response)
    return response.data;
};
