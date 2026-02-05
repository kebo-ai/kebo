import logger from "@/utils/logger";
import { observer } from "mobx-react-lite";
import React, { FC, useState, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  TextInput,
  TouchableOpacity,
  InteractionManager,
  PanResponder,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "expo-router";
import tw from "twrnc";
import moment from "moment";
import * as Haptics from "expo-haptics";

// Components
import { ChatHeader } from "@/components/common/ChatHeader";
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

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: string;
  isLoading?: boolean;
  rawResponse?: any; // Add rawResponse field to store raw API data
}

interface ChatbotScreenProps {}

export const ChatbotScreen: FC<ChatbotScreenProps> = observer(
  function ChatbotScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ initialQuestion?: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<TextInput | null>(null);

    // Default tab bar height (fixed value since we're not using useBottomTabBarHeight)
    const tabBarHeight = 60;

    // Calculate bottom padding for content
    const contentBottomPadding = tabBarHeight + 60;

    const [showScrollToEnd, setShowScrollToEnd] = useState(false);

    // Keyboard listeners
    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        () => {
          setKeyboardVisible(true);
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }
      );
      const keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        () => {
          setKeyboardVisible(false);
        }
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }, [messages.length]);

    // Process initialQuestion from route params, if present
    useEffect(() => {
      if (params.initialQuestion) {
        handleSendMessage(params.initialQuestion);
      }
    }, [params.initialQuestion]);

    // Auto-focus on mount if there are no messages or text in input
    useEffect(() => {
      if (messages.length === 0 && !inputValue) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 400);
      }
    }, []);

    useFocusEffect(
      React.useCallback(() => {
        const task = InteractionManager.runAfterInteractions(() => {
          // Small delay to ensure the screen is ready
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 500);
        });

        return () => task.cancel();
      }, [])
    );

    // Add an additional effect for the first mount
    useEffect(() => {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }, []);

    // Configure PanResponder for swipe gesture
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 10;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx > 0) {
            // Optional: you can add an animation here
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 100) {
            router.back();
          }
        },
      })
    ).current;

    // Optimize keyboard behavior
    useEffect(() => {
      const showKeyboard = () => {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      };

      showKeyboard();
    }, []);

    // Handle sending a message
    const handleSendMessage = async (content: string) => {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        type: "user",
        timestamp: moment().format("HH:mm"),
      };

      // Create loading message placeholder
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
        // Get response from backend API
        const response = await ChatService.sendMessage(content);

        // Get the raw response data
        const rawResponseData = response.rawResponse || {};

        // Display the raw response from the API directly (could be response, message, or any field)
        // If rawResponse exists and has a response property, use that directly
        const responseContent =
          rawResponseData.response ||
          rawResponseData.message ||
          rawResponseData.content ||
          response.content;

        // Update messages by replacing the loading message with the actual response
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

        // Vibrate to give feedback when bot response arrives
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Handle API errors
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

        // Update messages by replacing the loading message with the error message
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

    // Handle pressing a sample question
    const handleSampleQuestionPress = (question: string) => {
      setInputValue((prev) => prev + " " + question);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    };

    const handleNewChat = () => {
      setMessages([]);
      // Ensure keyboard opens after clearing messages
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

    return (
      <SafeAreaView style={tw`flex-1 bg-[#FAFAFA]`} {...panResponder.panHandlers}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={tw`flex-1`}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={tw`flex-1`}>
            <ChatHeader
              onNewChat={messages.length > 0 ? handleNewChat : undefined}
            />

            <View style={[tw`flex-1 mb-3`]}>
              {messages.length === 0 && !inputValue ? (
                <ChatEmpty onSampleQuestionPress={handleSampleQuestionPress} />
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
                  contentContainerStyle={tw`p-4 pb-4`}
                  showsVerticalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                />
              )}
              {showScrollToEnd && (
                <TouchableOpacity
                  style={tw`absolute left-1/2 -translate-x-1/2 bottom-20 justify-center items-center rounded-full p-2 shadow-xs bg-[#E7DFF7] border border-[${colors.primary}]`}
                  onPress={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                >
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={colors.primary}
                    style={tw`items-center justify-center`}
                  />
                </TouchableOpacity>
              )}
              <View style={tw`mt-4`}>
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  inputRef={inputRef}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
);
