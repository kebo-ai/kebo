import logger from "@/utils/logger";
import { observer } from "mobx-react-lite";
import React, { FC, useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  View,
  FlatList,
  Keyboard,
  Alert,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { KeyboardProvider, KeyboardStickyView } from "react-native-keyboard-controller";
import tw from "twrnc";
import moment from "moment";
import * as Haptics from "expo-haptics";

// Components
import { ChatInput } from "@/components/common/ChatInput";
import { ChatMessage } from "@/components/common/ChatMessage";
import { ChatEmpty } from "@/components/common/ChatEmpty";

// Services
import { ChatService } from "@/services/ChatService";

// Types
import { MessageType } from "@/components/common/ChatMessage";
import { translate } from "@/i18n";
import { colors } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { NewChatIconSvg } from "@/components/icons/NewChatIconSvg";

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: string;
  isLoading?: boolean;
  rawResponse?: any;
}

interface ChatbotScreenProps {}

export const ChatbotScreen: FC<ChatbotScreenProps> = observer(
  function ChatbotScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const params = useLocalSearchParams<{ initialQuestion?: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<TextInput | null>(null);

    const [showScrollToEnd, setShowScrollToEnd] = useState(false);

    // Dynamic headerRight — show new chat button when messages exist
    useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: messages.length > 0
          ? () => (
              <TouchableOpacity onPress={handleNewChat} style={tw`px-1`}>
                <NewChatIconSvg />
              </TouchableOpacity>
            )
          : undefined,
      });
    }, [navigation, messages.length]);

    // Scroll to end when keyboard appears
    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        () => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }
      );

      return () => {
        keyboardDidShowListener.remove();
      };
    }, [messages.length]);

    // Process initialQuestion from route params, if present
    useEffect(() => {
      if (params.initialQuestion) {
        handleSendMessage(params.initialQuestion);
      }
    }, [params.initialQuestion]);

    // Handle sending a message
    const handleSendMessage = async (content: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        type: "user",
        timestamp: moment().format("HH:mm"),
      };

      const loadingMessageId = (Date.now() + 1).toString();
      const loadingMessage: Message = {
        id: loadingMessageId,
        content: "",
        type: "bot",
        timestamp: moment().format("HH:mm"),
        isLoading: true,
      };

      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
        loadingMessage,
      ]);
      setIsLoading(true);

      try {
        const response = await ChatService.sendMessage(content);
        const rawResponseData = response.rawResponse || {};
        const responseContent =
          rawResponseData.response ||
          rawResponseData.message ||
          rawResponseData.content ||
          response.content;

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === loadingMessageId
              ? {
                  ...msg,
                  content: responseContent,
                  rawResponse: rawResponseData,
                  isLoading: false,
                }
              : msg
          )
        );

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (response.error) {
          logger.error("Chat API error:", response.error);
          if (response.error.includes("No session found")) {
            Alert.alert(
              translate("chatbotScreen:errorSesion"),
              translate("chatbotScreen:errorSesionMessage"),
              [{ text: "OK" }]
            );
          }
        }
      } catch (error) {
        logger.error("Error getting chatbot response:", error);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === loadingMessageId
              ? {
                  ...msg,
                  content: translate("chatbotScreen:errorMessage"),
                  isLoading: false,
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    };

    const handleSampleQuestionPress = (question: string) => {
      setInputValue((prev) => prev + " " + question);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    };

    const handleNewChat = () => {
      setMessages([]);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
    };

    useEffect(() => {
      if (messages.length === 0) {
        setShowScrollToEnd(false);
      } else {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }, [messages]);

    const handleScroll = (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const isAtBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
      setShowScrollToEnd(!isAtBottom && messages.length > 0);
    };

    // Space reserved for the input at the bottom so content doesn't hide behind it
    const inputAreaHeight = 70;

    return (
      <KeyboardProvider>
      <Pressable style={[tw`flex-1`, { backgroundColor: theme.background }]} onPress={Keyboard.dismiss}>
        <View style={tw`flex-1`}>
          {messages.length === 0 && !inputValue ? (
            <View style={[tw`flex-1`, { paddingTop: headerHeight, paddingBottom: inputAreaHeight + insets.bottom + 50 }]}>
              <ChatEmpty onSampleQuestionPress={handleSampleQuestionPress} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ChatMessage
                  content={item.content}
                  type={item.type}
                  timestamp={item.timestamp}
                  isLoading={item.isLoading}
                />
              )}
              contentContainerStyle={[
                tw`px-4 pb-4`,
                { paddingTop: headerHeight + 16, paddingBottom: inputAreaHeight + insets.bottom + 50 },
              ]}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              keyboardDismissMode="interactive"
            />
          )}
          {showScrollToEnd && (
            <TouchableOpacity
              style={[
                tw`absolute left-1/2 -translate-x-1/2 bottom-32 justify-center items-center rounded-full p-2 shadow-xs border`,
                {
                  backgroundColor: theme.surface,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            >
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        <KeyboardStickyView
          style={{
            position: "absolute",
            bottom: insets.bottom + 50,
            left: 0,
            right: 0,
          }}
          offset={{ opened: insets.bottom + 50, closed: 0 }}
        >
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            inputValue={inputValue}
            setInputValue={setInputValue}
            inputRef={inputRef}
          />
        </KeyboardStickyView>
      </Pressable>
      </KeyboardProvider>
    );
  }
);
