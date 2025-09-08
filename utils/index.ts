import { Platform } from "react-native";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8082" // Android Emulator -> host machine
    : "http://localhost:8082"; // iOS simulator / web

export { API_URL };
