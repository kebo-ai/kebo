import React from 'react';
import { Platform, ListRenderItemInfo } from 'react-native';
import { SwipeListView, RowMap } from 'react-native-swipe-list-view';
import { SwipeableList, SwipeableItem } from '../SwipeableList/SwipeableList';
import tw from 'twrnc';

// Base props interface that both components share
interface BaseProps<T extends SwipeableItem> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  containerStyle?: string;
  closeOnRowBeginSwipe?: boolean;
}

// Props specific to SwipeableList (iOS)
interface SwipeableListSpecificProps<T extends SwipeableItem> extends BaseProps<T> {
  onDelete?: (id: string) => void;
  deleteButtonStyle?: string;
  rightThreshold?: number;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  disableSwipe?: boolean;
}

// Props specific to SwipeListView (Android)
interface SwipeListViewSpecificProps<T extends SwipeableItem> extends BaseProps<T> {
  renderHiddenItem: (rowData: ListRenderItemInfo<T>, rowMap: RowMap<T>) => React.ReactElement | null;
  rightOpenValue: number;
  disableRightSwipe?: boolean;
  keyExtractor?: (item: T) => string;
  onRowOpen?: (rowKey: string) => void;
  onRowClose?: (rowKey: string) => void;
  useNativeDriver?: boolean;
  swipeToOpenPercent?: number;
  swipeToClosePercent?: number;
  directionalDistanceChangeThreshold?: number;
}

// Type union for the component's props
type SwipeableListWrapperProps<T extends SwipeableItem> = 
  SwipeableListSpecificProps<T> & Partial<SwipeListViewSpecificProps<T>> & {
    renderHiddenItem?: (rowData: any, rowMap: RowMap<T>) => React.ReactElement | null;
    rightOpenValue?: number;
    keyExtractor?: (item: T) => string;
  };

export function SwipeableListWrapper<T extends SwipeableItem>(props: SwipeableListWrapperProps<T>) {
  const { 
    data, 
    renderItem, 
    containerStyle = '',
    closeOnRowBeginSwipe = true,
  } = props;

  // Render based on platform
  if (Platform.OS === 'ios') {
    // iOS: Use SwipeableList
    return (
      <SwipeableList
        data={data}
        renderItem={renderItem}
        onDelete={props.onDelete}
        deleteButtonStyle={props.deleteButtonStyle}
        rightThreshold={props.rightThreshold}
        containerStyle={containerStyle}
        onSwipeStart={props.onSwipeStart}
        onSwipeEnd={props.onSwipeEnd}
        disableSwipe={props.disableSwipe}
        closeOnRowBeginSwipe={closeOnRowBeginSwipe}
      />
    );
  } else {
    // Android: Use SwipeListView with optimized settings for WhatsApp-like experience
    return (
      <SwipeListView
        data={data}
        renderItem={(rowData: any, rowMap: RowMap<T>) => {
          return renderItem(rowData.item) as React.ReactElement;
        }}
        renderHiddenItem={props.renderHiddenItem || (() => null)}
        rightOpenValue={props.rightOpenValue || -80}
        disableRightSwipe={props.disableRightSwipe}
        keyExtractor={props.keyExtractor || (item => item.id)}
        onRowOpen={props.onRowOpen}
        onRowClose={props.onRowClose}
        useNativeDriver={true}
        swipeToOpenPercent={30}
        swipeToClosePercent={50}
        closeOnRowBeginSwipe={false}
        closeOnRowPress={false}
        closeOnScroll={false}
        directionalDistanceChangeThreshold={20}
        disableLeftSwipe={false}
        friction={20}
        tension={0}
        swipeGestureBegan={props.onSwipeStart}
        swipeGestureEnded={props.onSwipeEnd}
        style={tw`${containerStyle}`}
        previewDuration={0}
        previewOpenDelay={3000}
        stopLeftSwipe={150}
        stopRightSwipe={-150}
      />
    );
  }
} 