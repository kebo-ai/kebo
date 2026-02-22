import React, { useRef, useCallback, useState, useEffect } from 'react';
import { View, Text, Animated, TouchableWithoutFeedback, Platform } from 'react-native';
import { GestureHandlerRootView, Swipeable, RectButton } from 'react-native-gesture-handler';
import tw from 'twrnc';
import { translate } from '@/i18n';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface SwipeableItem {
  id: string;
}

interface SwipeableListProps<T extends SwipeableItem> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  onDelete?: (id: string) => void;
  rightThreshold?: number;
  containerStyle?: string;
  deleteButtonStyle?: string;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  disableSwipe?: boolean;
  closeOnRowBeginSwipe?: boolean;
}

export const SwipeableList = <T extends SwipeableItem>({
  data,
  renderItem,
  onDelete,
  rightThreshold = 100,
  containerStyle = '',
  deleteButtonStyle = 'bg-red-500',
  onSwipeStart,
  onSwipeEnd,
  disableSwipe = false,
  closeOnRowBeginSwipe = true,
}: SwipeableListProps<T>) => {
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [swipeableStates, setSwipeableStates] = useState<{[key: string]: 'idle' | 'swiping' | 'open'}>({});

  // Close all rows
  const closeAllRows = useCallback(() => {
    Object.entries(swipeableRefs.current).forEach(([id, ref]) => {
      if (ref) {
        ref.close();
      }
    });
    setOpenRowId(null);
    setSwipeableStates({});
  }, []);

  // Close other rows except the current one
  const closeOtherRows = useCallback((currentId: string) => {
    Object.entries(swipeableRefs.current).forEach(([id, ref]) => {
      if (id !== currentId && ref) {
        ref.close();
        setSwipeableStates(prev => ({...prev, [id]: 'idle'}));
      }
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Close the row immediately before deleting
    if (swipeableRefs.current[id]) {
      swipeableRefs.current[id]?.close();
    }
    
    setOpenRowId(null);
    setSwipeableStates(prev => ({...prev, [id]: 'idle'}));
    
    // Small delay to ensure the animation completes
    setTimeout(() => {
      onDelete?.(id);
    }, Platform.OS === 'android' ? 150 : 100);
  }, [onDelete]);

  useEffect(() => {
    if (disableSwipe) {
      closeAllRows();
    }
  }, [disableSwipe, closeAllRows]);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>,
    item: T
  ) => {
    // Smoother interpolations for Android
    const trans = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [rightThreshold, rightThreshold/2, 0],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });

    const scale = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.9, 0.95, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          tw`w-[${rightThreshold}px]`,
          {
            transform: [{ translateX: trans }],
            opacity,
          },
        ]}
      >
        <RectButton
          style={[
            tw`flex-1 items-center justify-center ${deleteButtonStyle} rounded-r-lg`,
            { height: '100%' }
          ]}
          onPress={() => handleDelete(item.id)}
          underlayColor={Platform.OS === 'android' ? 'rgba(0,0,0,0.1)' : undefined}
        >
          <MaterialIcons 
            name="delete" 
            size={28} 
            color="white"
            style={tw`mb-1`}
          />
          <Text style={tw`text-white text-sm font-medium`}>
            {translate("common:delete")}
          </Text>
        </RectButton>
      </Animated.View>
    );
  };

  const handleRowPress = useCallback((itemId: string) => {
    if (openRowId === itemId && swipeableStates[itemId] === 'open' && closeOnRowBeginSwipe) {
      const ref = swipeableRefs.current[itemId];
      if (ref) {
        setIsClosing(true);
        ref.close();
        setTimeout(() => {
          setIsClosing(false);
          setOpenRowId(null);
          setSwipeableStates(prev => ({...prev, [itemId]: 'idle'}));
        }, Platform.OS === 'android' ? 400 : 300);
      }
    }
  }, [openRowId, swipeableStates, closeOnRowBeginSwipe]);

  return (
    <View style={tw`${containerStyle}`}>
      {data.map((item) => (
        <GestureHandlerRootView key={item.id} style={tw`bg-white`}>
          {disableSwipe ? (
            <View style={tw`bg-white`}>
              {renderItem(item)}
            </View>
          ) : (
            <Swipeable
              ref={(ref) => (swipeableRefs.current[item.id] = ref)}
              renderRightActions={(progress, dragX) => 
                renderRightActions(progress, dragX, item)
              }
              rightThreshold={Platform.OS === 'android' ? rightThreshold * 0.5 : rightThreshold * 0.6}
              onSwipeableOpen={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setOpenRowId(item.id);
                setSwipeableStates(prev => ({...prev, [item.id]: 'open'}));
                closeOtherRows(item.id);
                onSwipeStart?.();
              }}
              onSwipeableClose={() => {
                if (openRowId === item.id) {
                  setOpenRowId(null);
                  setSwipeableStates(prev => ({...prev, [item.id]: 'idle'}));
                }
                onSwipeEnd?.();
              }}
              onSwipeableWillOpen={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSwipeableStates(prev => ({...prev, [item.id]: 'swiping'}));
              }}
              friction={Platform.OS === 'android' ? 1.2 : 1}
              overshootFriction={Platform.OS === 'android' ? 10 : 8}
              overshootRight={false}
              enabled={!disableSwipe}
              enableTrackpadTwoFingerGesture={Platform.OS === 'ios'}
              containerStyle={tw`bg-white`}
              childrenContainerStyle={tw`bg-white`}
              hitSlop={{ left: 0, right: 0, top: 10, bottom: 10 }}
              useNativeAnimations={Platform.OS === 'ios'}
              shouldCancelWhenOutside={true}
              simultaneousHandlers={[]}
            >
              <TouchableWithoutFeedback 
                onPress={() => {
                  if (!isClosing) {
                    handleRowPress(item.id);
                  }
                }}
              >
                <View style={tw`bg-white`}>
                  {renderItem(item)}
                </View>
              </TouchableWithoutFeedback>
            </Swipeable>
          )}
        </GestureHandlerRootView>
      ))}
    </View>
  );
}; 