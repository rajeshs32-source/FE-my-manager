import axios from "axios";
import { DailySchedule } from "../features/dailySchedule/dailyScheduleFormTypes";

const API_URL = "http://localhost:6002/api/";

export const getDailySchedule = async (): Promise<DailySchedule[]> => {
  const response = await axios.get(`${API_URL}daily-schedules`);
  console.log("🚀 ~ getDailySchedule~ response:", response)
  return response.data.data;
};

export const addDailySchedule = async (order: DailySchedule): Promise<DailySchedule> => {
  const response = await axios.post(`${API_URL}daily-schedules/create`, order);
  console.log("🚀 ~ createDailySchedule ~ response:", response)
  return response.data;
};

export const deleteDailySchedule = async (id: string): Promise<DailySchedule> => {
    const response = await axios.delete(`${API_URL}daily-schedules/${id}`);
    console.log("🚀 ~ deleteDailySchedule ~ response:", response)
    return response.data;
};
