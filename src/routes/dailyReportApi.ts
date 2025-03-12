import axios from "axios";
import { DailyReport } from "../features/dailyReport/dailyReportTypes";

const API_URL = "http://localhost:6002/api/";

export const getDailyReport = async (): Promise<DailyReport[]> => {
  const response = await axios.get(`${API_URL}daily-reports`);
  console.log("🚀 ~ getDailyReport ~ response:", response)
  return response.data.data;
};

export const addDailyReport = async (order: DailyReport): Promise<DailyReport> => {
  const response = await axios.post(`${API_URL}daily-reports/create`, order);
  console.log("🚀 ~ addDailyReport ~ response:", response)
  return response.data;
};

export const deleteDailyReport = async (id: string): Promise<DailyReport> => {
    const response = await axios.delete(`${API_URL}daily-reports/${id}`);
    console.log("🚀 ~ deleteDailyReport ~ response:", response)
    return response.data;
};
