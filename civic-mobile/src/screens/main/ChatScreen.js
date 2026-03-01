import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://10.55.135.151:5000/api';

const ChatScreen = ({ route, navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();

  // chatId can be passed directly OR we create one via otherUserId
  const { chatId: initialChatId, otherUserId, otherUserName, reportTitle } = route.params || {};

  const [chatId, setChatId] = useState(initialChatId || null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  // Create or fetch the chat
  const initChat = useCallback(async () => {
    try {
      const headers = authHeaders();

      if (!chatId && otherUserId) {
        // Create chat with specific admin
        const res = await fetch(`${API_BASE}/chat/create`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ otherUserId }),
        });
        const data = await res.json();
        if (data.chatId) {
          setChatId(data.chatId);
          return data.chatId;
        }
      } else if (!chatId && !otherUserId) {
        // No specific admin — fetch existing chats and use the first one
        const res = await fetch(`${API_BASE}/chat/my-chats`, { headers });
        const chats = await res.json();
        if (Array.isArray(chats) && chats.length > 0) {
          setChatId(chats[0].chat_id);
          return chats[0].chat_id;
        }
      }
      return chatId;
    } catch (err) {
      console.error('Chat init error:', err);
    } finally {
      setLoading(false);
    }
  }, [chatId, otherUserId]);

  // Fetch messages for the chat
  const fetchMessages = useCallback(async (cId) => {
    if (!cId) return;
    try {
      const headers = authHeaders();
      const res = await fetch(`${API_BASE}/chat/${cId}/messages`, { headers });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const id = await initChat();
      if (id) {
        await fetchMessages(id);
        // Poll every 3 seconds for new messages
        pollIntervalRef.current = setInterval(() => fetchMessages(id), 3000);
      }
    };
    init();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || !chatId) return;
    const content = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const headers = authHeaders();
      await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ chatId, content }),
      });
      await fetchMessages(chatId);
    } catch (err) {
      console.error('Send message error:', err);
      Alert.alert('Error', 'Failed to send message.');
      setInputText(content); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && (
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary.main }]}>
            <Text style={styles.avatarText}>
              {(item.sender_name || 'A')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[
          styles.bubble,
          isMe
            ? [styles.bubbleMe, { backgroundColor: theme.colors.primary.main }]
            : [styles.bubbleThem, { backgroundColor: theme.colors.surface.secondary }]
        ]}>
          {!isMe && (
            <Text style={[styles.senderName, { color: theme.colors.primary.main }]}>
              {item.sender_name}
            </Text>
          )}
          <Text style={[
            styles.messageText,
            { color: isMe ? '#fff' : theme.colors.text.primary }
          ]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, { color: isMe ? 'rgba(255,255,255,0.7)' : theme.colors.text.tertiary }]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient
        colors={theme.colors.gradient.primary}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={[styles.adminAvatar, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
            <MaterialCommunityIcons name="shield-account" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerName}>{otherUserName || 'Civic Setu Support'}</Text>
            {reportTitle && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Re: {reportTitle}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading conversation...
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="chat-outline"
                size={56}
                color={theme.colors.text.tertiary}
              />
              <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
                Start the conversation
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
                Ask questions or get updates about your report
              </Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface.primary,
            borderTopColor: theme.colors.border.primary,
            paddingBottom: insets.bottom + 8,
          }
        ]}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.text.tertiary}
            style={[styles.input, {
              backgroundColor: theme.colors.surface.secondary,
              color: theme.colors.text.primary,
              borderColor: theme.colors.border.primary,
            }]}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}
            style={[
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? theme.colors.primary.main : theme.colors.border.primary }
            ]}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <MaterialCommunityIcons name="send" size={20} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  adminAvatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  headerName: { color: '#fff', fontWeight: '700', fontSize: 16 },
  headerSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12, maxWidth: 220 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },

  messagesList: { padding: 16, gap: 12, flexGrow: 1 },

  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  messageRowMe: { flexDirection: 'row-reverse' },

  avatar: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleThem: { borderBottomLeftRadius: 4 },

  senderName: { fontSize: 11, fontWeight: '700', marginBottom: 3 },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },

  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 80, gap: 10,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', maxWidth: 240 },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
});

export default ChatScreen;
