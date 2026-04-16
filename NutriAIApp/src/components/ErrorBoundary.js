import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C, RADIUS, SPACING } from '../constants/theme';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={s.container}>
          <View style={s.card}>
            <Text style={s.icon}>!</Text>
            <Text style={s.title}>Something went wrong</Text>
            <Text style={s.subtitle}>
              The app encountered an unexpected error. Please try again.
            </Text>
            <TouchableOpacity
              style={s.button}
              onPress={this.handleReset}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Try Again"
            >
              <Text style={s.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.black,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: C.surface1,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    width: '100%',
    maxWidth: 340,
  },
  icon: {
    fontSize: 40,
    fontWeight: '900',
    color: C.red || '#FF6B6B',
    marginBottom: SPACING.md,
    width: 64,
    height: 64,
    lineHeight: 64,
    textAlign: 'center',
    borderRadius: 32,
    backgroundColor: (C.red || '#FF6B6B') + '15',
    overflow: 'hidden',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: C.accent,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    color: C.textInverse,
  },
});
