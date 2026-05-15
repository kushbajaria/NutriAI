import AsyncStorage from '@react-native-async-storage/async-storage';

// Bump this when recipe schema changes to invalidate stale caches
const CACHE_SCHEMA_VERSION = 2;

const KEYS = {
  RECIPES: '@nutrismart_recipes',
  RECIPES_TIMESTAMP: '@nutrismart_recipes_ts',
  RECIPES_SCHEMA: '@nutrismart_recipes_schema',
  PANTRY: '@nutrismart_pantry',
  MEALS: '@nutrismart_meals',
  STREAK: '@nutrismart_streak',
  WORKOUTS: '@nutrismart_workouts',
  PROFILE: '@nutrismart_profile',
};

// ── Recipes (cached with 24h TTL + schema version) ───────────────

export async function cacheRecipes(recipes) {
  await AsyncStorage.setItem(KEYS.RECIPES, JSON.stringify(recipes));
  await AsyncStorage.setItem(KEYS.RECIPES_TIMESTAMP, Date.now().toString());
  await AsyncStorage.setItem(KEYS.RECIPES_SCHEMA, String(CACHE_SCHEMA_VERSION));
}

export async function getCachedRecipes() {
  const version = await AsyncStorage.getItem(KEYS.RECIPES_SCHEMA);
  if (!version || parseInt(version, 10) !== CACHE_SCHEMA_VERSION) return null;

  const ts = await AsyncStorage.getItem(KEYS.RECIPES_TIMESTAMP);
  if (!ts) return null;

  const age = Date.now() - parseInt(ts, 10);
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  if (age > TWENTY_FOUR_HOURS) return null; // stale

  const data = await AsyncStorage.getItem(KEYS.RECIPES);
  return data ? JSON.parse(data) : null;
}

// ── Generic user data cache ──────────────────────────────────────

export async function cacheUserData(key, data) {
  const cacheKey = `@nutrismart_${key}`;
  await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
}

export async function getCachedUserData(key) {
  const cacheKey = `@nutrismart_${key}`;
  const data = await AsyncStorage.getItem(cacheKey);
  return data ? JSON.parse(data) : null;
}

// ── Clear all ────────────────────────────────────────────────────

export async function clearAllCache() {
  const keys = Object.values(KEYS);
  await AsyncStorage.multiRemove(keys);
}
