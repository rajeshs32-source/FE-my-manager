import axios from "axios";
import { Order } from "../features/orders/orderTypes";

const API_URL = "http://localhost:6002/api/";

export const getOrders = async (): Promise<Order[]> => {
  const response = await axios.get(`${API_URL}orders`);
  console.log("🚀 ~ getOrders ~ response:", response)
  return response.data.data;
};

export const addOrder = async (order: Order): Promise<Order> => {
  const response = await axios.post(`${API_URL}orders/create`, order);
  return response.data;
};

export const deleteOrder = async (id: string): Promise<Order> => {
    const response = await axios.delete(`${API_URL}orders/${id}`);
    console.log("🚀 ~ deleteOrder ~ response:", response)
    return response.data;
};
