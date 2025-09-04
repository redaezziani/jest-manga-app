import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface AnimatedSplashScreenProps {
  onAnimationFinish?: () => void;
}

const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onAnimationFinish,
}) => {
  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const backgroundOpacity = useSharedValue(0);
  const circleScale1 = useSharedValue(0);
  const circleScale2 = useSharedValue(0);
  const circleScale3 = useSharedValue(0);

  // Loading dots animation
  const dot1Scale = useSharedValue(1);
  const dot2Scale = useSharedValue(1);
  const dot3Scale = useSharedValue(1);

  useEffect(() => {
    const startAnimation = () => {
      // Background fade in
      backgroundOpacity.value = withTiming(1, { duration: 500 });

      // Animated circles with different timing
      circleScale1.value = withDelay(
        200,
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }),
          withRepeat(
            withTiming(1.1, {
              duration: 2000,
              easing: Easing.inOut(Easing.sin),
            }),
            -1,
            true
          )
        )
      );

      circleScale2.value = withDelay(
        400,
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }),
          withRepeat(
            withTiming(1.05, {
              duration: 2500,
              easing: Easing.inOut(Easing.sin),
            }),
            -1,
            true
          )
        )
      );

      circleScale3.value = withDelay(
        600,
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }),
          withRepeat(
            withTiming(1.08, {
              duration: 1800,
              easing: Easing.inOut(Easing.sin),
            }),
            -1,
            true
          )
        )
      );

      // Logo animation with bounce
      logoScale.value = withDelay(
        800,
        withSequence(
          withSpring(1.3, { damping: 6, stiffness: 80 }),
          withSpring(1, { damping: 12, stiffness: 150 })
        )
      );

      logoOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));

      // Logo rotation with smooth easing
      logoRotation.value = withDelay(
        800,
        withSequence(
          withTiming(360, { duration: 1200, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 0 })
        )
      );

      // Title animation with spring
      titleOpacity.value = withDelay(
        1200,
        withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
      );
      titleTranslateY.value = withDelay(
        1200,
        withSpring(0, { damping: 10, stiffness: 100 })
      );

      // Subtitle animation
      subtitleOpacity.value = withDelay(
        1600,
        withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
      );
      subtitleTranslateY.value = withDelay(
        1600,
        withSpring(0, { damping: 8, stiffness: 80 })
      );

      // Loading dots pulsing animation
      dot1Scale.value = withDelay(
        2000,
        withRepeat(
          withSequence(
            withTiming(1.5, { duration: 400 }),
            withTiming(1, { duration: 400 })
          ),
          -1,
          false
        )
      );

      dot2Scale.value = withDelay(
        2200,
        withRepeat(
          withSequence(
            withTiming(1.5, { duration: 400 }),
            withTiming(1, { duration: 400 })
          ),
          -1,
          false
        )
      );

      dot3Scale.value = withDelay(
        2400,
        withRepeat(
          withSequence(
            withTiming(1.5, { duration: 400 }),
            withTiming(1, { duration: 400 })
          ),
          -1,
          false
        )
      );

      // Finish animation after 3.5 seconds
      setTimeout(() => {
        if (onAnimationFinish) {
          runOnJS(onAnimationFinish)();
        }
      }, 3500);
    };

    startAnimation();
  }, []);

  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
    opacity: logoOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const circle1Style = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale1.value }],
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale2.value }],
  }));

  const circle3Style = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale3.value }],
  }));

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot1Scale.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot2Scale.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot3Scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.background, backgroundStyle]}>
        <LinearGradient
          colors={["#ff4133", "#ff6b5a", "#ff8a7a", "#ffb3a7"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Animated background circles */}
      <Animated.View style={[styles.circle1, circle1Style]} />
      <Animated.View style={[styles.circle2, circle2Style]} />
      <Animated.View style={[styles.circle3, circle3Style]} />

      {/* Additional decorative elements */}
      <View style={styles.sparkle1} />
      <View style={styles.sparkle2} />
      <View style={styles.sparkle3} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo with glow effect */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <View style={styles.logoGlow}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* App Title */}
        <Animated.Text style={[styles.title, titleStyle]}>
          جست مانجا
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          اكتشف عالم المانجا المثير
        </Animated.Text>

        {/* Loading indicator with animated dots */}
        <Animated.View style={[styles.loadingContainer, subtitleStyle]}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, dot1Style]} />
            <Animated.View style={[styles.dot, dot2Style]} />
            <Animated.View style={[styles.dot, dot3Style]} />
          </View>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  circle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -100,
    right: -100,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: -50,
    left: -50,
  },
  circle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    top: height * 0.3,
    left: width * 0.8,
  },
  sparkle1: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    top: height * 0.2,
    left: width * 0.2,
  },
  sparkle2: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    top: height * 0.7,
    right: width * 0.3,
  },
  sparkle3: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    top: height * 0.4,
    left: width * 0.1,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoGlow: {
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  logo: {
    width: 130,
    height: 130,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Doc",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    fontFamily: "Doc",
    marginBottom: 50,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginHorizontal: 5,
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontFamily: "Doc",
    textAlign: "center",
  },
});

export default AnimatedSplashScreen;
