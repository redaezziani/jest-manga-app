import { Check, ChevronDown } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
} from "react-native";

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  style?: any;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  selectedValue,
  onValueChange,
  placeholder = "اختر خيارا",
  style,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);

  const buttonRef = useRef<TouchableOpacity>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const openDropdown = () => {
    if (disabled) return;

    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownTop(y + height + 5);
      setDropdownLeft(x);
      setDropdownWidth(width);
    });

    setModalVisible(true);

    // Animate dropdown appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDropdown = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  const selectOption = (value: string) => {
    onValueChange(value);
    closeDropdown();
  };

  const renderOption = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        backgroundColor: item.value === selectedValue ? "#f8f9ff" : "white",
      }}
      onPress={() => selectOption(item.value)}
      activeOpacity={0.7}
    >
      <Text
        style={{
          fontSize: 12,
          color: item.value === selectedValue ? "#5d3aca" : "#333",
          fontFamily: "Doc",
          flex: 1,
          textAlign: "right",
        }}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      {item.value === selectedValue && (
        <Check size={14} color="#5d3aca" style={{ marginLeft: 6 }} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: disabled ? "#f5f5f5" : "white",
            borderWidth: 1,
            borderColor: disabled ? "#e0e0e0" : "#d1d5db",
            borderRadius: 6,
            // remove default shadow on android
            elevation: 0,
            shadowColor: "#000",
            minHeight: 36,
          },
          style,
        ]}
        onPress={openDropdown}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <ChevronDown
          size={16}
          color={disabled ? "#999" : "#5d3aca"}
          style={{
            transform: [{ rotate: modalVisible ? "180deg" : "0deg" }],
          }}
        />

        <Text
          style={{
            fontSize: 13,
            color: selectedOption ? "#333" : "#999",
            fontFamily: "Doc",
            flex: 1,
            textAlign: "right",
            marginRight: 8,
          }}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
          activeOpacity={1}
          onPress={closeDropdown}
        >
          <Animated.View
            style={{
              position: "absolute",
              top: dropdownTop,
              left: dropdownLeft,
              width: dropdownWidth,
              maxHeight: 250,
              backgroundColor: "white",
              borderRadius: 8,
              elevation: 8,

              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              zIndex: 1000,
            }}
          >
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={{
                borderRadius: 8,
                overflow: "hidden",
              }}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default CustomSelect;
