/*import React, { useEffect, useRef } from "react"
import { View, Animated, StyleSheet, Dimensions } from "react-native"

const { width } = Dimensions.get("window")

interface SkeletonProps {
  width?: number | string
  height?: number
  style?: any
}

export const SkeletonLoader = ({ width: w, height = 20, style }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,      //fade in
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,       //fade out
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [opacity]) // Added opacity to dependencies

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: w || "100%",
          height,
          opacity,
        },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E1E9EE",
    borderRadius: 4,
  },
})*/

// app/components/SkeletonLoader.tsx      correct for viewbuyerscreen
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: any;
}

export const SkeletonLoader = ({
  width: w,
  height = 20,
  style,
}: SkeletonProps) => {
  const [opacity, setOpacity] = useState(0.3);
  const animationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    animationInterval.current = setInterval(() => {
      setOpacity((prevOpacity) => (prevOpacity === 0.3 ? 0.7 : 0.3));
    }, 800);

    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
    };
  }, []);

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: w || "100%",
          height,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E1E9EE",
    borderRadius: 4,
  },
});
