import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { Svg, Path } from "react-native-svg";
import { ArrowDownIconSvg } from "@/components/icons/arrow-down-icon";
import { ArrowLeftIconSvg } from "@/components/icons/arrow-left-icon";
import { NewChatIconSvg } from "@/components/icons/new-chat-icon-svg";
import { NewChatSvg } from "@/components/icons/new-chat-svg";

interface ChatHeaderProps {
  onNewChat?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onNewChat }) => {
  const navigation = useNavigation();

  return (
    <View style={tw`bg-[#FAFAFA] h-16 flex-row items-center justify-between px-4 `}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={tw`rounded-lg p-2 justify-center items-center`}
      >
        <ArrowLeftIconSvg />
      </TouchableOpacity>

      <Text
        weight="medium"
        style={tw`text-lg text-center`}
      >
        Kebo Wise
      </Text>

      {onNewChat ? (
        <>
          <View style={tw`flex-row items-center gap-2`}>
            <TouchableOpacity onPress={onNewChat} style={tw`px-1`}>
              <NewChatIconSvg/> 
              {/* <NewChatSvg /> */}
            </TouchableOpacity>
             {/* <TouchableOpacity
             onPress={""}
            >
              <HistorySvg />
            </TouchableOpacity> */}
          </View>
        </>
      ) : (
        <View style={tw`w-10`} />
      )}
    </View>
  );
};
