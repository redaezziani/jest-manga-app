import { LayoutWithTopBar } from "@/components/LayoutWithBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/utils";
import { Link, Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterData>>({});
  const [registerError, setRegisterError] = useState<string>("");
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "يجب ألا يكون الاسم فارغًا";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "يجب إدخال البريد الإلكتروني";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "عنوان البريد الإلكتروني غير صالح";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "يجب إدخال كلمة المرور";
    } else if (formData.password.length < 6) {
      newErrors.password = "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "يجب تأكيد كلمة المرور";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setRegisterError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل إنشاء الحساب");
      }

      // Navigate to login page after successful registration
      router.replace("/auth/login");
    } catch (error) {
      console.error("Register error:", error);
      setRegisterError(
        error instanceof Error ? error.message : "حدث خطأ غير متوقع"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear register error when user starts typing
    if (registerError) {
      setRegisterError("");
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
                className="text-2xl text-gray-900"
              >
                إنشاء حساب جديد
              </Text>
              <Text
                style={{ fontFamily: "Doc" }}
                className="text-gray-500 text-sm"
              >
                انضم إلينا واستمتع بقراءة المانجا المفضلة لديك
              </Text>
            </View>

            {/* Register Error */}
            {registerError && (
              <View className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-red-600 text-center"
                >
                  {registerError}
                </Text>
              </View>
            )}

            {/* Register Form */}
            <View className="flex flex-col gap-2">
              {/* Name Input */}
              <View>
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-gray-700 text-sm mb-2"
                >
                  الاسم الكامل
                </Text>
                <Input
                  value={formData.name}
                  onChangeText={(text) => updateFormData("name", text)}
                  autoCapitalize="words"
                  style={{ fontFamily: "Doc" }}
                  className={`border ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <Text
                    style={{ fontFamily: "Doc" }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.name}
                  </Text>
                )}
              </View>

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
                  secureTextEntry
                  style={{ fontFamily: "Doc" }}
                  className={`border ${errors.password ? "border-red-500" : ""}`}
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

              <View>
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-gray-700 text-sm mb-2"
                >
                  تأكيد كلمة المرور
                </Text>
                <Input
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    updateFormData("confirmPassword", text)
                  }
                  secureTextEntry
                  style={{ fontFamily: "Doc" }}
                  className={`border ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                {errors.confirmPassword && (
                  <Text
                    style={{ fontFamily: "Doc" }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>

              {/* Register Button */}
              <Button
                onPress={handleRegister}
                disabled={loading}
                className="bg-[#ff4133] hover:bg-[#e53e3e] mt-6"
              >
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-white text-lg"
                >
                  {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                </Text>
              </Button>

              {/* Login Link */}
              <View className="flex-row justify-center items-center mt-6">
                <Text style={{ fontFamily: "Doc" }} className="text-gray-600">
                  لديك حساب بالفعل؟{" "}
                </Text>
                <Link href="/auth/login" asChild>
                  <Text
                    style={{ fontFamily: "Doc" }}
                    className="text-[#ff4133] font-semibold"
                  >
                    تسجيل الدخول
                  </Text>
                </Link>
              </View>

              {/* Back to Home */}
              <View className="flex-row justify-center items-center mt-4">
                <Link href="/" asChild>
                  <Text
                    style={{ fontFamily: "Doc" }}
                    className="text-gray-500 text-sm"
                  >
                    العودة للصفحة الرئيسية
                  </Text>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LayoutWithTopBar>
  );
}
