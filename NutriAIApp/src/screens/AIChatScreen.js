import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { GlassCard, GradientButton, BlurHeader } from '../components';
import Icon from '../components/Icon';
import { SPACING, RADIUS } from '../constants/theme';
import { sendAIChatMessage, subscribeChatMessages } from '../services/ai';
import { hapticMedium } from '../utils/haptics';

const SUGGESTIONS = [
  'What should I eat next?',
  'Rate my day so far',
  'High protein snack ideas',
  'Meal plan for tomorrow',
];

// ── Message Bubble ──────────────────────────────────────────────────

function MessageBubble({ item, palette, accent, gradients }) {
  if (item.role === 'system') {
    return (
      <View style={s.systemRow}>
        <Text style={[s.systemText, { color: accent.red }]}>{item.content}</Text>
      </View>
    );
  }

  const isUser = item.role === 'user';

  if (isUser) {
    return (
      <View style={[s.bubbleRow, s.bubbleRowUser]}>
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.userBubble}>
          <Text style={s.userBubbleText}>{item.content}</Text>
        </LinearGradient>
      </View>
    );
  }

  // AI message
  return (
    <View style={[s.bubbleRow, s.bubbleRowAI]}>
      <View style={[s.aiBubble, { backgroundColor: palette.glass1Bg, borderColor: palette.glass1Border }]}>
        <View style={s.aiLabel}>
          <Icon name="sparkles" size={12} color={accent.premium} />
          <Text style={[s.aiLabelText, { color: accent.premium }]}>AI Coach</Text>
        </View>
        <Text style={[s.aiBubbleText, { color: palette.textPrimary }]}>{item.content}</Text>
      </View>
    </View>
  );
}

// ── Typing Indicator ────────────────────────────────────────────────

function TypingIndicator({ palette, accent }) {
  return (
    <View style={[s.bubbleRow, s.bubbleRowAI]}>
      <View style={[s.aiBubble, s.typingBubble, { backgroundColor: palette.glass1Bg, borderColor: palette.glass1Border }]}>
        <View style={s.aiLabel}>
          <Icon name="sparkles" size={12} color={accent.premium} />
          <Text style={[s.aiLabelText, { color: accent.premium }]}>AI Coach</Text>
        </View>
        <View style={s.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[s.dot, { backgroundColor: palette.textTertiary }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────

export default function AIChatScreen({ navigation }) {
  const { mode, palette, accent, gradients } = useTheme();
  const { isPro } = useSubscription();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  // Subscribe to messages
  useEffect(() => {
    if (!user?.uid || !isPro) return;
    const unsub = subscribeChatMessages(
      user.uid,
      (msgs) => {
        setMessages(msgs);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [user?.uid, isPro]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages.length]);

  const handleSend = useCallback(async (text) => {
    const msg = (text || inputText).trim();
    if (!msg || sending) return;
    setInputText('');
    Keyboard.dismiss();
    hapticMedium();

    // Optimistic user message
    const tempId = `temp_${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: 'user', content: msg }]);
    setSending(true);

    try {
      await sendAIChatMessage(msg);
      // Real messages arrive via subscription — remove temp if still present
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } catch (err) {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        { id: `err_${Date.now()}`, role: 'system', content: err.message || 'Failed to send. Try again.' },
      ]);
    } finally {
      setSending(false);
    }
  }, [inputText, sending]);

  // ── Premium gate ────────────────────────────────────────────────
  if (!isPro) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <BlurHeader title="AI Coach" />
        <View style={s.gateContent}>
          <GlassCard level={2} style={s.gateCard}>
            <View style={[s.iconWrap, { backgroundColor: accent.premium + '15' }]}>
              <Icon name="sparkles" size={32} color={accent.premium} />
            </View>
            <Text style={[s.gateTitle, { color: palette.textPrimary }]}>AI Coach</Text>
            <Text style={[s.gateSub, { color: palette.textSecondary }]}>
              Ask nutrition & fitness questions, get personalized guidance powered by AI.
            </Text>
          </GlassCard>
          <GradientButton
            label="Unlock with Pro"
            gradient={gradients.premium}
            icon="sparkles"
            onPress={() => navigation.navigate('Paywall')}
            style={s.gateCta}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Chat UI ─────────────────────────────────────────────────────

  const isEmpty = messages.length === 0 && !loading;

  const renderItem = useCallback(({ item }) => (
    <MessageBubble item={item} palette={palette} accent={accent} gradients={gradients} />
  ), [palette, accent, gradients]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <BlurHeader title="AI Coach" />

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {isEmpty ? (
          <View style={s.emptyWrap}>
            <GlassCard level={2} style={s.welcomeCard}>
              <View style={[s.iconWrap, { backgroundColor: accent.premium + '15' }]}>
                <Icon name="sparkles" size={28} color={accent.premium} />
              </View>
              <Text style={[s.welcomeTitle, { color: palette.textPrimary }]}>
                Hi! I'm your AI nutrition coach.
              </Text>
              <Text style={[s.welcomeSub, { color: palette.textSecondary }]}>
                Ask me anything about your meals, macros, or fitness goals. I have access to your profile and today's data.
              </Text>
            </GlassCard>

            <Text style={[s.suggestLabel, { color: palette.textTertiary }]}>Try asking</Text>
            <View style={s.suggestWrap}>
              {SUGGESTIONS.map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={[s.chip, { backgroundColor: palette.glass1Bg, borderColor: palette.glass1Border }]}
                  onPress={() => handleSend(chip)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.chipText, { color: accent.premium }]}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={sending ? <TypingIndicator palette={palette} accent={accent} /> : null}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* Input bar */}
        <View style={[s.inputBar, { backgroundColor: palette.glass2Bg, borderColor: palette.glass2Border }]}>
          <TextInput
            style={[s.input, { color: palette.textPrimary }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your AI coach..."
            placeholderTextColor={palette.textTertiary}
            multiline
            maxLength={2000}
            returnKeyType="default"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              s.sendBtn,
              { backgroundColor: inputText.trim() && !sending ? accent.premium : palette.bg3 },
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.7}
          >
            <Icon
              name={sending ? 'hourglass-outline' : 'send'}
              size={18}
              color={inputText.trim() && !sending ? '#fff' : palette.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },

  // Premium gate
  gateContent: { flex: 1, justifyContent: 'center', padding: SPACING.md },
  gateCard: { alignItems: 'center', marginBottom: 20 },
  iconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  gateTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  gateSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  gateCta: { marginTop: 4 },

  // Empty / welcome
  emptyWrap: { flex: 1, justifyContent: 'center', padding: SPACING.md },
  welcomeCard: { alignItems: 'center', marginBottom: SPACING.lg },
  welcomeTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  welcomeSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 },
  suggestLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3 },
  suggestWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },

  // Message list
  listContent: { padding: SPACING.md, paddingBottom: 8 },

  // Bubble rows
  bubbleRow: { marginBottom: 10 },
  bubbleRowUser: { alignItems: 'flex-end' },
  bubbleRowAI: { alignItems: 'flex-start' },

  // User bubble
  userBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderBottomRightRadius: 4,
  },
  userBubbleText: { color: '#fff', fontSize: 15, lineHeight: 21 },

  // AI bubble
  aiBubble: {
    maxWidth: '85%',
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  aiLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  aiLabelText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  aiBubbleText: { fontSize: 15, lineHeight: 22 },

  // Typing indicator
  typingBubble: { paddingVertical: 14 },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, opacity: 0.5 },

  // System / error
  systemRow: { alignItems: 'center', marginBottom: 10 },
  systemText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1,
    minHeight: 56,
  },
  input: { flex: 1, fontSize: 15, maxHeight: 100, paddingVertical: 8 },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
});
