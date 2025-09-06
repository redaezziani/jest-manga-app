import { Platform } from "react-native";

const API_URL =
  Platform.OS === "android"
    ? "http://192.168.100.184:8082" // Android Emulator -> Host machine
    : "http://localhost:8082"; // iOS simulator / web

export { API_URL };
