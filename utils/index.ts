import { Platform } from "react-native";

const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:8082" : "http://localhost:8082";

export { API_URL };
