import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const opts = { enableVibrateFallback: false, ignoreAndroidSystemSettings: false };

export const hapticLight     = () => ReactNativeHapticFeedback.trigger('impactLight', opts);
export const hapticMedium    = () => ReactNativeHapticFeedback.trigger('impactMedium', opts);
export const hapticSuccess   = () => ReactNativeHapticFeedback.trigger('notificationSuccess', opts);
export const hapticSelection = () => ReactNativeHapticFeedback.trigger('selection', opts);
