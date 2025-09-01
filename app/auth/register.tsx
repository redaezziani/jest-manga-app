import { LayoutWithTopBar } from "@/components/LayoutWithBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/utils";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
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

      Alert.alert(
        "تم إنشاء الحساب بنجاح ✅",
        "يمكنك الآن تسجيل الدخول باستخدام بيانات حسابك الجديد",
        [
          {
            text: "تسجيل الدخول",
            onPress: () => {
              router.replace("/auth/login" as any);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Register error:", error);
      Alert.alert(
        "خطأ في إنشاء الحساب ❌",
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
            <View className="items-center mb-8">
              <Text
                style={{ fontFamily: "Arabic" }}
                className="text-3xl  text-gray-900 mb-2"
              >
                إنشاء حساب جديد
              </Text>
              <Text
                style={{ fontFamily: "Arabic" }}
                className="text-gray-600 text-center"
              >
                انضم إلينا واستمتع بقراءة المانجا المفضلة لديك
              </Text>
            </View>

            {/* Register Form */}
            <View className="space-y-4">
              {/* Name Input */}
              <View>
                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-700 text-sm mb-2"
                >
                  الاسم الكامل
                </Text>
                <Input
                  value={formData.name}
                  onChangeText={(text) => updateFormData("name", text)}
                  placeholder="أدخل اسمك الكامل"
                  autoCapitalize="words"
                  className={`border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-4 py-3`}
                />
                {errors.name && (
                  <Text
                    style={{ fontFamily: "Arabic" }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* Email Input */}
              <View>
                <Text
                  style={{ fontFamily: "Arabic" }}
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
                  className={`border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-4 py-3`}
                />
                {errors.email && (
                  <Text
                    style={{ fontFamily: "Arabic" }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View>
                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-700 text-sm mb-2"
                >
                  كلمة المرور
                </Text>
                <Input
                  value={formData.password}
                  onChangeText={(text) => updateFormData("password", text)}
                  placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                  secureTextEntry
                  className={`border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-4 py-3`}
                />
                {errors.password && (
                  <Text
                    style={{ fontFamily: "Arabic" }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.password}
                  </Text>
                )}
              </View>

              {/* Confirm Password Input */}
              <View>
                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-700 text-sm mb-2"
                >
                  تأكيد كلمة المرور
                </Text>
                <Input
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    updateFormData("confirmPassword", text)
                  }
                  placeholder="أعد إدخال كلمة المرور"
                  secureTextEntry
                  className={`border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg px-4 py-3`}
                />
                {errors.confirmPassword && (
                  <Text
                    style={{ fontFamily: "Arabic" }}
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
                className="bg-[#ff4133] hover:bg-[#e53e3e] py-4 rounded-lg mt-6"
              >
                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-white text-lg font-semibold"
                >
                  {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                </Text>
              </Button>

              {/* Login Link */}
              <View className="flex-row justify-center items-center mt-6">
                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-600"
                >
                  لديك حساب بالفعل؟{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/auth/login" as any)}
                >
                  <Text
                    style={{ fontFamily: "Arabic" }}
                    className="text-[#ff4133] font-semibold"
                  >
                    تسجيل الدخول
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Back to Home */}
              <View className="flex-row justify-center items-center mt-4">
                <TouchableOpacity onPress={() => router.push("/")}>
                  <Text
                    style={{ fontFamily: "Arabic" }}
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
