import React, { useState } from "react";
import { View, Pressable, Image, Text, StyleSheet, Dimensions, SafeAreaView } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView, LongPressGestureHandler, State, PanGestureHandler } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const { width } = Dimensions.get('window');
const ICON_SIZE = 70;
const GRID_PADDING = 20;
const ICONS_PER_ROW = 3;
const GRID_WIDTH = width - (GRID_PADDING * 2);
const ICON_MARGIN = (GRID_WIDTH - (ICON_SIZE * ICONS_PER_ROW)) / (ICONS_PER_ROW * 2);

const appsData = [
  { id: "1", name: "Camera", icon: require("../../assets/images/success-toast.png") },
  { id: "2", name: "Messages", icon: require("../../assets/images/success-toast.png") },
  { id: "3", name: "Music", icon: require("../../assets/images/success-toast.png") },
];

interface AppIcon {
  id: string;
  name: string;
  icon: any;
  position?: { x: number; y: number };
}

export default function AppIcons() {
  const [apps, setApps] = useState<AppIcon[]>(appsData.map((app, index) => ({
    ...app,
    position: {
      x: (index % ICONS_PER_ROW) * (ICON_SIZE + ICON_MARGIN * 2),
      y: Math.floor(index / ICONS_PER_ROW) * (ICON_SIZE + ICON_MARGIN * 2)
    }
  })));
  const [editMode, setEditMode] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const removeApp = (id: string) => {
    setApps((prev) => prev.filter((app) => app.id !== id));
  };

  const onLongPress = () => {
    setEditMode(!editMode);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const onDragStart = (id: string) => {
    if (editMode) {
      setDraggingId(id);
    }
  };

  const onDragEnd = () => {
    setDraggingId(null);
  };

  const updateIconPosition = (id: string, translationX: number, translationY: number) => {
    setApps(prev => prev.map(app => {
      if (app.id === id && app.position) {
        return {
          ...app,
          position: {
            x: app.position.x + translationX,
            y: app.position.y + translationY
          }
        };
      }
      return app;
    }));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <LongPressGestureHandler
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
              onLongPress();
            }
          }}
          minDurationMs={500}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.text}>Long Press to Edit</Text>
              <Pressable 
                onPress={toggleEditMode}
                style={styles.editButton}
              >
                <Text style={[styles.text, styles.editText]}>
                  {editMode ? "Done" : "Edit"}
                </Text>
              </Pressable>
            </View>
            <View style={styles.appsGrid}>
              {apps.map((app) => (
                <PanGestureHandler
                  key={app.id}
                  onGestureEvent={({ nativeEvent }) => {
                    if (editMode && draggingId === app.id) {
                      updateIconPosition(app.id, nativeEvent.translationX, nativeEvent.translationY);
                    }
                  }}
                  onBegan={() => onDragStart(app.id)}
                  onEnded={onDragEnd}
                >
                  <Animated.View>
                    <MotiView
                      style={[
                        styles.appIcon,
                        app.position && {
                          position: 'absolute',
                          left: app.position.x,
                          top: app.position.y,
                        }
                      ]}
                      from={{ 
                        scale: 1,
                        rotate: "0deg"
                      }}
                      animate={editMode ? { 
                        scale: draggingId === app.id ? 1.1 : 1,
                        rotate: ["-3deg", "3deg", "-3deg", "3deg", "0deg"]
                      } : { 
                        scale: 1,
                        rotate: "0deg"
                      }}
                      transition={{ 
                        loop: editMode && draggingId !== app.id,
                        type: "timing",
                        duration: 500,
                        rotate: {
                          type: "timing",
                          duration: 500,
                        }
                      }}
                    >
                      {editMode && (
                        <>
                          <Pressable 
                            style={styles.deleteButton} 
                            onPress={() => removeApp(app.id)}
                          >
                            <View style={styles.deleteCircle}>
                              <Ionicons name="close" size={16} color="#fff" />
                            </View>
                          </Pressable>
                          <View style={styles.moveIndicator}>
                            <View style={styles.moveCircle}>
                              <Ionicons name="pencil" size={14} color="#fff" />
                            </View>
                          </View>
                        </>
                      )}
                      <View style={styles.iconContainer}>
                        <Image source={app.icon} style={styles.icon} />
                      </View>
                      <Text style={styles.text}>{app.name}</Text>
                    </MotiView>
                  </Animated.View>
                </PanGestureHandler>
              ))}
            </View>
          </View>
        </LongPressGestureHandler>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#260035",
  },
  container: {
    flex: 1,
    paddingHorizontal: GRID_PADDING,
  },
  header: {
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  editButton: {
    padding: 8,
  },
  editText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  appsGrid: {
    flex: 1,
    position: 'relative',
  },
  appIcon: {
    alignItems: "center",
    width: ICON_SIZE,
    height: ICON_SIZE + 20,
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    backgroundColor: '#32CD32',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: "absolute",
    top: -6,
    left: -6,
    zIndex: 2,
  },
  deleteCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#260035',
  },
  moveIndicator: {
    position: "absolute",
    bottom: 15,
    right: -6,
    zIndex: 2,
  },
  moveCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#260035',
  },
  icon: {
    width: ICON_SIZE * 0.6,
    height: ICON_SIZE * 0.6,
  },
});
