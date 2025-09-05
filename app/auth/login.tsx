import { LayoutWithTopBar } from "@/components/LayoutWithBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { API_URL } from "@/utils";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    email: string;
    name: string;
    profile: string | null;
  };
  access_token: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [loginError, setLoginError] = useState<string>("");
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "يجب إدخال البريد الإلكتروني";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "عنوان البريد الإلكتروني غير صالح";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "يجب إدخال كلمة المرور";
    } else if (formData.password.length < 7) {
      newErrors.password = "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل تسجيل الدخول");
      }

      const loginResponse: LoginResponse = data;

      // Use auth context to login
      await login(loginResponse.user, loginResponse.access_token);

      // Navigate to home page after successful login
      router.replace("/");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        error instanceof Error ? error.message : "حدث خطأ غير متوقع"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof LoginData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear login error when user starts typing
    if (loginError) {
      setLoginError("");
    }
  };

  return (
    <LayoutWithTopBar>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Header */}
            <View className="items-start mb-8">
              <Text
                style={{ fontFamily: "Doc" }}
                className="text-2xl text-gray-900 "
              >
                تسجيل الدخول
              </Text>
              <Text
                style={{ fontFamily: "Doc" }}
                className="text-gray-500 text-sm "
              >
                مرحباً بك مرة أخرى! سجل الدخول للمتابعة إلى حسابك والاستفادة من
                جميع ميزات
              </Text>
            </View>

            {/* Login Error */}
            {loginError && (
              <View className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-red-600 text-center"
                >
                  {loginError}
                </Text>
              </View>
            )}

            <View className="flex flex-col gap-2">
              <View>
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-gray-700 text-sm mb-2"
                >
                  البريد الإلكتروني
                </Text>
                <Input
                  value={formData.email}
                  onChangeText={(text) => updateFormData("email", text)}
                  placeholder="أدخل بريدك الإلكتروني"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{ fontFamily: "Doc" }}
                  className={`border ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <Text
                    style={{ fontFamily: "Doc" }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View>
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-gray-700 text-sm mb-2"
                >
                  كلمة المرور
                </Text>
                <Input
                  value={formData.password}
                  onChangeText={(text) => updateFormData("password", text)}
                  placeholder="أدخل كلمة المرور"
                  secureTextEntry
                  style={{ fontFamily: "Doc" }}
                  className={`${errors.password ? "border-red-500" : ""}`}
                />
                {errors.password && (
                  <Text
                    style={{ fontFamily: "Doc" }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.password}
                  </Text>
                )}
              </View>

              {/* Login Button */}
              <Button
                onPress={handleLogin}
                disabled={loading}
                className="bg-[#ff4133] hover:bg-[#e53e3e] mt-6"
              >
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-white text-lg"
                >
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Text>
              </Button>

              {/* Register Link */}
              <View className="flex-row justify-center items-center mt-6">
                <Text style={{ fontFamily: "Doc" }} className="text-gray-600">
                  ليس لديك حساب؟{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/auth/register" as any)}
                >
                  <Text
                    style={{ fontFamily: "Doc" }}
                    className="text-[#ff4133] font-semibold"
                  >
                    إنشاء حساب جديد
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Back to Home */}
              <View className="flex-row justify-center items-center mt-4">
                <TouchableOpacity onPress={() => router.push("/")}>
                  <Text
                    style={{ fontFamily: "Doc" }}
                    className="text-gray-500 text-sm"
                  >
                    العودة للصفحة الرئيسية
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LayoutWithTopBar>
  );
}
