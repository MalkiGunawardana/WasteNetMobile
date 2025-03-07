import React from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import { SkeletonLoader } from "./SkeletonLoader"

const { width } = Dimensions.get("window")

export const ItemSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonLoader width={150} height={24} />
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <SkeletonLoader width={width - 40} height={width - 40} style={styles.image} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Price */}
        <SkeletonLoader width={200} height={28} style={styles.marginBottom} />
        <SkeletonLoader width={150} height={32} style={styles.marginBottom} />

        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <SkeletonLoader width={100} height={20} />
          <SkeletonLoader width={100} height={20} />
        </View>

        {/* Description */}
        <View style={styles.description}>
          <SkeletonLoader width={150} height={24} style={styles.marginBottom} />
          <SkeletonLoader height={16} style={styles.marginBottom} />
          <SkeletonLoader height={16} style={styles.marginBottom} />
          <SkeletonLoader width="80%" height={16} />
        </View>

        {/* Details */}
        <View style={styles.details}>
          {[1, 2, 3].map((_, index) => (
            <View key={index} style={styles.detailRow}>
              <SkeletonLoader width={24} height={24} style={styles.icon} />
              <View style={styles.detailContent}>
                <SkeletonLoader width={80} height={16} style={styles.marginBottom} />
                <SkeletonLoader width={120} height={20} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <SkeletonLoader height={50} style={styles.button} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 40,
    marginBottom: 20,
  },
  imageContainer: {
    paddingHorizontal: 16,
  },
  image: {
    borderRadius: 10,
  },
  content: {
    padding: 20,
  },
  marginBottom: {
    marginBottom: 16,
  },
  quickInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
  },
  description: {
    marginBottom: 24,
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
  },
  icon: {
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  button: {
    borderRadius: 12,
  },
})

