import axios from "axios";

export const judge0Client = axios.create({
  baseURL: "https://judge0-ce.p.rapidapi.com",
  headers: {
    "Content-Type": "application/json",
    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
  },
  timeout: 10000,
});