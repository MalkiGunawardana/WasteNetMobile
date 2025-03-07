// app/components/BuyerSkeleton.tsx
import React from 'react';
import { View, Platform } from 'react-native';

let SkeletonComponent = View;

// Conditional import for react-native-skeleton-placeholder
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  const SkeletonPlaceholder = require('react-native-skeleton-placeholder').default;
  SkeletonComponent = SkeletonPlaceholder;
} else {
    //if we are on web, we dont need to import anything. We can use View
}

export const BuyerSkeleton = () => {
  return (
    <SkeletonComponent>
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ width: '60%', height: 30, borderRadius: 4, marginBottom: 20 }} />
        <View style={{ width: '100%', height: 20, borderRadius: 4, marginBottom: 10 }} />
        <View style={{ width: '100%', height: 20, borderRadius: 4, marginBottom: 10 }} />
        <View style={{ width: '100%', height: 20, borderRadius: 4, marginBottom: 10 }} />
      </View>
    </SkeletonComponent>
  );
};
