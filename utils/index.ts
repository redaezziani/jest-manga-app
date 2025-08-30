import { Platform } from "react-native";

const API_URL =
  Platform.OS === "android" ? "http://192.168.100.230:8082" : "http://localhost:8082";

export { API_URL };
