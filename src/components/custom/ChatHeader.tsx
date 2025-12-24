import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
import { colors } from "../../theme/colors";
import { Svg, Path } from "react-native-svg";
import { ArrowDownIconSvg } from "../svg/ArrowDownIcon";
import { ArrowLeftIconSvg } from "../svg/ArrowLeftIcon";
import { NewChatIconSvg } from "../svg/NewChatIconSvg";
import { HistorySvg } from "../svg/HistorySvg copy";
import { NewChatSvg } from "../svg/NewChatSvg";

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
        style={[tw`text-lg text-center`, { fontFamily: "SFUIDisplayMedium" }]}
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
