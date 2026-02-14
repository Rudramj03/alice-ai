import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL

});

export const sendMessage = (message) =>
  API.post("/chat", { message });
