# SwipeableListWrapper

A cross-platform wrapper component that uses:
- `SwipeableList` (based on react-native-gesture-handler) for iOS
- `SwipeListView` (from react-native-swipe-list-view) for Android

## Usage

```tsx
import { SwipeableListWrapper } from "../../components";
import { RowMap } from "react-native-swipe-list-view";

// Your data interface (must include 'id' property)
interface YourItem {
  id: string;
  // other properties...
}

// Example component
const YourComponent = () => {
  const data: YourItem[] = [/* your data */];

  // Render the visible item
  const renderItem = (item: YourItem) => (
    <View>
      <Text>{item.name}</Text>
    </View>
  );

  // Handle deletion
  const handleDelete = (id: string) => {
    // Delete logic
  };

  // Required for Android - renders the hidden item behind the row
  const renderHiddenItem = (rowData: { item: YourItem }, rowMap: RowMap<YourItem>) => (
    <View style={tw`flex-1 flex-row justify-end items-center bg-white h-full`}>
      <TouchableOpacity
        style={tw`bg-red-500 w-[90px] h-full items-center justify-center`}
        onPress={() => handleDelete(rowData.item.id)}
      >
        <MaterialIcons name="delete" size={28} color="white" />
        <Text style={tw`text-white text-sm font-semibold`}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SwipeableListWrapper
      data={data}
      renderItem={renderItem}
      renderHiddenItem={renderHiddenItem}
      onDelete={handleDelete}
      deleteButtonStyle="bg-red-500"
      rightThreshold={90}
      rightOpenValue={-90}
    />
  );
};
```

## How it works

- On iOS: Uses `SwipeableList` component (based on react-native-gesture-handler)
- On Android: Uses `SwipeListView` component (from react-native-swipe-list-view)

This gives optimal performance and user experience for each platform while maintaining a consistent API. 