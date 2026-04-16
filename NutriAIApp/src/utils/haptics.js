let RNHaptic = null;
try {
  RNHaptic = require('react-native-haptic-feedback').default;
} catch {}

const opts = { enableVibrateFallback: false, ignoreAndroidSystemSettings: false };

const safe = (type) => () => {
  try { RNHaptic?.trigger(type, opts); } catch {}
};

export const hapticLight     = safe('impactLight');
export const hapticMedium    = safe('impactMedium');
export const hapticSuccess   = safe('notificationSuccess');
export const hapticSelection = safe('selection');
