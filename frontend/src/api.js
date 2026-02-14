import axios from "axios";

const API = axios.create({
  baseURL: "https://alice-backend-0vvw.onrender.com"

});

export const sendMessage = (message) =>
  API.post("/chat", { message });
