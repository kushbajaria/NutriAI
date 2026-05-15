import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, TextInput,
  KeyboardAvoidingView, Platform, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { getRecipeReviews } from '../services/firestore';
import { GlassCard, GradientButton, BlurHeader, GlassBottomSheet, Badge } from '../components';
import { SectionHeader, FadeIn } from '../components/UI';
import Icon from '../components/Icon';

// ── STAR ROW ───────────────────────────────────────────────────────
function StarRow({ value, size = 15, onPress }) {
  const { accent, palette } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 3 }} accessible accessibilityLabel={`${Math.round(value)} out of 5 stars`} accessibilityRole={onPress ? 'adjustable' : 'text'}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity
          key={n}
          onPress={() => onPress?.(n)}
          disabled={!onPress}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 3, right: 3 }}
        >
          <Text style={{ fontSize: size, color: n <= Math.round(value) ? accent.carbs : palette.bg3 }}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── REVIEW CARD ───────────────────────────────────────────────────
function ReviewCard({ review }) {
  const { palette, accent } = useTheme();
  return (
    <View style={[s.reviewCard, { backgroundColor: palette.bg2, borderColor: palette.border }]}>
      <View style={s.reviewTop}>
        <View style={[s.reviewAvatar, { backgroundColor: palette.bg3 }, review.isOwn && { backgroundColor: accent.primary }]}>
          <Text style={[s.reviewAvatarText, { color: palette.textSecondary }, review.isOwn && { color: palette.textInverse }]}>
            {review.avatar}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={s.reviewMeta}>
            <Text style={[s.reviewUser, { color: palette.textPrimary }]}>{review.isOwn ? 'You' : review.user}</Text>
            <Text style={[s.reviewDate, { color: palette.textTertiary }]}>{review.date}</Text>
          </View>
          <StarRow value={review.stars} size={12} />
        </View>
      </View>
      {!!review.text && <Text style={[s.reviewText, { color: palette.textSecondary }]}>{review.text}</Text>}
    </View>
  );
}

// ── MACRO BAR ROW ─────────────────────────────────────────────────
function MacroBar({ label, value, max, color }) {
  const { palette } = useTheme();
  const pct = Math.min(100, (value / max) * 100);
  return (
    <View style={s.macroBarRow}>
      <Text style={[s.macroBarLabel, { color: palette.textTertiary }]}>{label}</Text>
      <View style={[s.macroBarTrack, { backgroundColor: palette.bg3 }]}>
        <View style={[s.macroBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[s.macroBarVal, { color }]}>{value}g</Text>
    </View>
  );
}

// ── RECIPE CARD ───────────────────────────────────────────────────
function RecipeCard({ recipe: r, recipeReviews, onPress }) {
  const { palette, accent } = useTheme();
  const avgRating = recipeReviews.length
    ? recipeReviews.reduce((a, rv) => a + rv.stars, 0) / recipeReviews.length
    : null;
  const allAvailable = r.missingIngredients?.length === 0;
  const hasMatchData = r.matchScore !== undefined;

  return (
    <TouchableOpacity style={[s.recipeCard, { backgroundColor: palette.bg1, borderColor: palette.border }]} onPress={onPress} activeOpacity={0.8}>

      {/* Header row */}
      <View style={s.cardHeader}>
        <View style={[s.emojiWrap, { backgroundColor: palette.bg3 }]}>
          <Icon name={r.icon} size={24} color={accent.primary} />
        </View>
        <View style={s.cardHeaderRight}>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <Badge label={r.tag} color={accent.primary} />
            {hasMatchData && allAvailable && (
              <Badge label="Can Make" color={accent.green} />
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {avgRating !== null && (
              <>
                <Text style={{ fontSize: 12, color: accent.carbs }}>★</Text>
                <Text style={[s.ratingVal, { color: palette.textSecondary }]}>{avgRating.toFixed(1)}</Text>
                <Text style={[s.ratingCount, { color: palette.textTertiary }]}>({recipeReviews.length})</Text>
              </>
            )}
            <Text style={[s.diffText, { color: palette.textTertiary }]}>{r.diff}</Text>
          </View>
        </View>
      </View>

      {/* Name + meta chips */}
      <Text style={[s.recipeName, { color: palette.textPrimary }]}>{r.name}</Text>
      <View style={s.metaRow}>
        <View style={[s.metaChip, { backgroundColor: palette.bg2, borderColor: palette.border }]}><Icon name="flame-outline" size={12} color={accent.primary} /><Text style={[s.metaChipText, { color: palette.textSecondary }]}>{r.cal} cal</Text></View>
        <View style={[s.metaChip, { backgroundColor: palette.bg2, borderColor: palette.border }]}><Icon name="barbell-outline" size={12} color={accent.protein} /><Text style={[s.metaChipText, { color: palette.textSecondary }]}>{r.protein}g protein</Text></View>
        <View style={[s.metaChip, { backgroundColor: palette.bg2, borderColor: palette.border }]}><Icon name="time-outline" size={12} color={palette.textTertiary} /><Text style={[s.metaChipText, { color: palette.textSecondary }]}>{r.prepTime + r.cookTime}m</Text></View>
      </View>

      {/* Macro bars */}
      <View style={s.macroSection}>
        <MacroBar label="P" value={r.protein} max={60}  color={accent.protein} />
        <MacroBar label="C" value={r.carbs}   max={100} color={accent.carbs}   />
        <MacroBar label="F" value={r.fat}     max={40}  color={accent.fat}     />
      </View>

      {/* Missing ingredients */}
      {hasMatchData && r.missingIngredients?.length > 0 && (
        <View style={s.missingRow}>
          <Text style={[s.missingLabel, { color: palette.textTertiary }]}>Missing: </Text>
          <Text style={[s.missingItems, { color: accent.fat }]} numberOfLines={1}>{r.missingIngredients.join(', ')}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={[s.cardFooter, { borderTopColor: palette.border }]}>
        <Text style={[s.footerServings, { color: palette.textTertiary }]}>{r.servings} serving{r.servings !== 1 ? 's' : ''}</Text>
        <Text style={[s.viewBtnText, { color: accent.primary }]}>View Recipe</Text>
      </View>

    </TouchableOpacity>
  );
}

// ── MEALS SCREEN ──────────────────────────────────────────────────
export function MealsScreen({ navigation }) {
  const { pantryMeals, reviews, goal, pantry } = useApp();
  const { mode, palette, accent } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }, []);

  const canMake  = pantryMeals.filter(r => r.matchScore >= 0.6);
  const discover = pantryMeals.filter(r => r.matchScore <  0.6);

  const GOAL_LABELS = {
    'Lose Weight':  '🔥 Lose Weight',
    'Build Muscle': '💪 Build Muscle',
    'Stay Healthy': '🧘 Stay Healthy',
    'Boost Energy': '⚡ Boost Energy',
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: palette.border }]}>
        <Text style={[s.headerTitle, { color: palette.textPrimary }]}>Meal Planner</Text>
        <View style={s.headerBadges}>
          <View style={[s.infoBadge, { backgroundColor: palette.bg2, borderColor: palette.border }]}>
            <Text style={[s.infoBadgeText, { color: palette.textSecondary }]}>{pantry.length} items in pantry</Text>
          </View>
          <View style={[s.infoBadge, { borderColor: accent.primary + '40', backgroundColor: accent.primaryBg }]}>
            <Text style={[s.infoBadgeText, { color: accent.primary }]}>
              {GOAL_LABELS[goal] || goal}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent.primary} />}
      >

        {/* From your pantry */}
        <FadeIn delay={0}>
        <SectionHeader title={`From Your Pantry · ${canMake.length}`} />
        {canMake.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: palette.bg1, borderColor: palette.border }]}>
            <Icon name="basket-outline" size={36} color={palette.textTertiary} />
            <Text style={[s.emptyTitle, { color: palette.textSecondary }]}>Add more to your pantry</Text>
            <Text style={[s.emptySub, { color: palette.textTertiary }]}>
              We need at least 60% of a recipe's ingredients to suggest it from your pantry.
            </Text>
          </View>
        ) : (
          canMake.map(r => (
            <RecipeCard
              key={r.id}
              recipe={r}
              recipeReviews={reviews[r.id] || []}
              onPress={() => navigation.navigate('Recipe', { recipe: r })}
            />
          ))
        )}
        </FadeIn>

        {/* Discover more */}
        {discover.length > 0 && (
          <FadeIn delay={120}>
            <SectionHeader title={`Discover More · ${discover.length}`} />
            {discover.map(r => (
              <RecipeCard
                key={r.id}
                recipe={r}
                recipeReviews={reviews[r.id] || []}
                onPress={() => navigation.navigate('Recipe', { recipe: r })}
              />
            ))}
          </FadeIn>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── RECIPE SCREEN ─────────────────────────────────────────────────
export function RecipeScreen({ navigation, route }) {
  const { logMeal, reviews, addReview } = useApp();
  const { mode, palette, accent, gradients } = useTheme();
  const [userStars,  setUserStars]  = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted,  setSubmitted]  = useState(false);
  const [firestoreReviews, setFirestoreReviews] = useState([]);
  const [showMealTimePicker, setShowMealTimePicker] = useState(false);

  const recipeId = route?.params?.recipe?.id;

  // Fetch reviews from Firestore on mount
  useEffect(() => {
    if (!recipeId) return;
    let mounted = true;
    (async () => {
      try {
        const remote = await getRecipeReviews(String(recipeId));
        if (mounted && remote.length > 0) {
          setFirestoreReviews(remote.map(rv => ({
            id: rv.id,
            user: rv.uid?.slice(0, 6) || 'User',
            avatar: (rv.uid?.[0] || 'U').toUpperCase(),
            stars: rv.stars,
            text: rv.text || '',
            date: rv.createdAt?.toDate?.()
              ? rv.createdAt.toDate().toLocaleDateString()
              : 'Recently',
            isOwn: false,
          })));
        }
      } catch (err) {
        console.warn('Failed to fetch reviews:', err.message);
      }
    })();
    return () => { mounted = false; };
  }, [recipeId]);

  if (!route?.params?.recipe) {
    return (
      <SafeAreaView style={[rs.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
        <View style={rs.errorWrap}>
          <Text style={[rs.errorText, { color: palette.textSecondary }]}>Recipe not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[rs.errorBtn, { backgroundColor: accent.primary }]}>
            <Text style={[rs.errorBtnText, { color: palette.textInverse }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const r              = route.params.recipe;
  const localReviews = reviews[r.id] || [];
  const localIds = new Set(localReviews.map(rv => rv.id));
  const recipeReviews = [
    ...localReviews,
    ...firestoreReviews.filter(rv => !localIds.has(rv.id)),
  ];
  const avgRating      = recipeReviews.length
    ? recipeReviews.reduce((a, rv) => a + rv.stars, 0) / recipeReviews.length
    : 0;
  const alreadyReviewed = recipeReviews.some(rv => rv.isOwn);

  const handleLog = () => { setShowMealTimePicker(true); };
  const confirmLog = (mealTime) => {
    setShowMealTimePicker(false);
    logMeal(r, mealTime);
    navigation.popToTop();
  };

  const handleSubmitReview = () => {
    if (userStars === 0) return;
    addReview(r.id, userStars, reviewText.trim());
    setSubmitted(true);
    setUserStars(0);
    setReviewText('');
  };

  // Match banner config
  const matchPct  = r.matchScore !== undefined ? Math.round(r.matchScore * 100) : null;
  const allHave   = r.missingIngredients?.length === 0;
  const someHave  = r.matchScore >= 0.6;

  return (
    <SafeAreaView style={[rs.safe, { backgroundColor: palette.bg0 }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      <BlurHeader title={r.name} onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >

          {/* Hero */}
          <View style={[rs.hero, { backgroundColor: palette.bg1, borderBottomColor: palette.border }]}>
            <View style={[rs.heroEmoji, { backgroundColor: palette.bg3 }]}>
              <Icon name={r.icon} size={36} color={accent.primary} />
            </View>
            <View style={rs.heroInfo}>
              <Badge label={r.tag} color={accent.primary} />
              <Text style={[rs.heroTitle, { color: palette.textPrimary }]}>{r.name}</Text>
              <View style={rs.chipRow}>
                {[
                  { icon: 'time-outline', text: `${r.prepTime}m prep` },
                  { icon: 'flame-outline', text: `${r.cookTime}m cook` },
                  { icon: 'people-outline', text: `${r.servings} srv` },
                  { icon: null, text: r.diff },
                ].map(c => (
                  <View key={c.text} style={[rs.chip, { backgroundColor: palette.bg3 }]}>
                    {c.icon && <Icon name={c.icon} size={12} color={palette.textSecondary} />}
                    <Text style={[rs.chipText, { color: palette.textSecondary }]}>{c.text}</Text>
                  </View>
                ))}
              </View>
              {avgRating > 0 && (
                <View style={rs.avgRow}>
                  <StarRow value={avgRating} size={14} />
                  <Text style={[rs.avgVal, { color: palette.textSecondary }]}>{avgRating.toFixed(1)}</Text>
                  <Text style={[rs.avgCount, { color: palette.textTertiary }]}>
                    {recipeReviews.length} review{recipeReviews.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={rs.body}>

            {/* Pantry match banner */}
            {matchPct !== null && (
              <View style={[
                rs.matchBanner,
                allHave  ? { backgroundColor: accent.green + '0D', borderColor: accent.green + '30' } :
                someHave ? { backgroundColor: accent.primaryBg, borderColor: accent.primary + '30' }  :
                           { backgroundColor: accent.fat + '0D', borderColor: accent.fat + '30' },
              ]}>
                <Text style={[
                  rs.matchIcon,
                  { color: allHave ? accent.green : someHave ? accent.primary : accent.fat },
                ]}>
                  {allHave ? '✓' : someHave ? '~' : '!'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[rs.matchTitle, { color: palette.textPrimary }]}>
                    {allHave
                      ? 'All ingredients in your pantry'
                      : `${r.matchedIngredients?.length ?? 0} of ${r.ingredients.length} ingredients available`}
                  </Text>
                  {r.missingIngredients?.length > 0 && (
                    <Text style={[rs.matchMissing, { color: palette.textTertiary }]}>
                      Need: {r.missingIngredients.join(', ')}
                    </Text>
                  )}
                </View>
                <Text style={[rs.matchPct, { color: allHave ? accent.green : someHave ? accent.primary : accent.fat }]}>
                  {matchPct}%
                </Text>
              </View>
            )}

            {/* Nutrition */}
            <Text style={[rs.sectionLabel, { color: palette.textTertiary }]}>NUTRITION</Text>
            <View style={rs.nutriGrid}>
              {[
                { val: r.cal,     unit: '',  label: 'Calories', color: accent.primary },
                { val: r.protein, unit: 'g', label: 'Protein',  color: accent.protein },
                { val: r.carbs,   unit: 'g', label: 'Carbs',    color: accent.carbs   },
                { val: r.fat,     unit: 'g', label: 'Fat',      color: accent.fat     },
              ].map(n => (
                <View key={n.label} style={[rs.nutriCard, { borderColor: n.color + '30', backgroundColor: n.color + '0C' }]}>
                  <Text style={[rs.nutriVal, { color: n.color }]}>
                    {n.val}<Text style={rs.nutriUnit}>{n.unit}</Text>
                  </Text>
                  <Text style={[rs.nutriLabel, { color: palette.textTertiary }]}>{n.label}</Text>
                </View>
              ))}
            </View>

            {/* Ingredients */}
            <Text style={[rs.sectionLabel, { color: palette.textTertiary }]}>INGREDIENTS</Text>
            <View style={rs.ingRow}>
              {r.ingredients.map(ing => {
                const have = r.matchedIngredients?.includes(ing) ?? true;
                return (
                  <View key={ing} style={[
                    rs.ingChip,
                    { backgroundColor: palette.bg2, borderColor: palette.borderHi },
                    !have && { borderColor: accent.fat + '50', backgroundColor: accent.fat + '0D' },
                  ]}>
                    {!have && <Text style={[rs.ingMissingDot, { color: accent.fat }]}>✕</Text>}
                    <Text style={[rs.ingText, { color: palette.textPrimary }, !have && { color: accent.fat }]}>{ing}</Text>
                  </View>
                );
              })}
            </View>

            {/* Instructions */}
            <Text style={[rs.sectionLabel, { color: palette.textTertiary }]}>METHOD</Text>
            <View style={rs.steps}>
              {r.instructions.map((step, i) => (
                <View key={i} style={[rs.step, { backgroundColor: palette.bg1, borderColor: palette.border }]}>
                  <View style={[rs.stepNum, { backgroundColor: accent.primary }]}>
                    <Text style={[rs.stepNumText, { color: palette.textInverse }]}>{i + 1}</Text>
                  </View>
                  <Text style={[rs.stepText, { color: palette.textSecondary }]}>{step}</Text>
                </View>
              ))}
            </View>

            {/* ── Reviews ── */}
            <View style={rs.reviewsSection}>

              {/* Section header */}
              <View style={rs.reviewsHeaderRow}>
                <Text style={[rs.sectionLabel, { color: palette.textTertiary }]}>REVIEWS</Text>
                {avgRating > 0 && (
                  <View style={[rs.avgPill, { backgroundColor: palette.bg2, borderColor: palette.border }]}>
                    <Text style={{ fontSize: 12, color: accent.carbs }}>★</Text>
                    <Text style={[rs.avgPillText, { color: palette.textSecondary }]}>{avgRating.toFixed(1)}</Text>
                  </View>
                )}
              </View>

              {/* Existing reviews */}
              {recipeReviews.length === 0 ? (
                <View style={rs.noReviews}>
                  <Text style={[rs.noReviewsText, { color: palette.textTertiary }]}>No reviews yet — be the first!</Text>
                </View>
              ) : (
                recipeReviews.map(rv => <ReviewCard key={rv.id} review={rv} />)
              )}

              {/* Add review form */}
              {!alreadyReviewed && !submitted ? (
                <View style={[rs.addReview, { backgroundColor: palette.bg1, borderColor: palette.border }]}>
                  <Text style={[rs.addReviewTitle, { color: palette.textPrimary }]}>Rate this meal</Text>
                  <StarRow value={userStars} size={30} onPress={setUserStars} />
                  {userStars > 0 && (
                    <>
                      <TextInput
                        style={[rs.reviewInput, { backgroundColor: palette.bg2, borderColor: palette.border, color: palette.textPrimary }]}
                        placeholder="Share your experience (optional)…"
                        placeholderTextColor={palette.textTertiary}
                        value={reviewText}
                        onChangeText={setReviewText}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                      <GradientButton
                        label="Post Review"
                        onPress={handleSubmitReview}
                        gradient={gradients.primary}
                      />
                    </>
                  )}
                </View>
              ) : (
                <View style={[rs.reviewedBanner, { backgroundColor: accent.primaryBg, borderColor: accent.primary + '30' }]}>
                  <Text style={[rs.reviewedText, { color: accent.primary }]}>✓  You've reviewed this meal</Text>
                </View>
              )}

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action bar */}
      <View style={[rs.actionBar, { backgroundColor: palette.bg0, borderTopColor: palette.border }]}>
        <GradientButton
          label="Log This Meal"
          onPress={handleLog}
          gradient={gradients.primary}
          style={{ flex: 1 }}
        />
      </View>

      {/* Meal time picker */}
      <GlassBottomSheet visible={showMealTimePicker} onClose={() => setShowMealTimePicker(false)} height={300}>
        <Text style={[rs.mtTitle, { color: palette.textPrimary }]}>When did you eat this?</Text>
        {[
          { key: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
          { key: 'lunch', label: 'Lunch', icon: 'restaurant-outline' },
          { key: 'dinner', label: 'Dinner', icon: 'moon-outline' },
          { key: 'snack', label: 'Snack', icon: 'cafe-outline' },
        ].map(opt => (
          <TouchableOpacity key={opt.key} style={[rs.mtOption, { borderBottomColor: palette.border }]} onPress={() => confirmLog(opt.key)} activeOpacity={0.7}>
            <Icon name={opt.icon} size={20} color={accent.primary} />
            <Text style={[rs.mtOptionText, { color: palette.textPrimary }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </GlassBottomSheet>
    </SafeAreaView>
  );
}

// ── STYLES: MEALS ─────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },

  headerBadges: { gap: 6, alignItems: 'flex-end', marginTop: 4 },
  infoBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
  infoBadgeText: { fontSize: 11, fontWeight: '600' },

  scroll:        { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Recipe card
  recipeCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md, marginBottom: 14,
    borderWidth: 1, gap: 10,
  },
  cardHeader:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  emojiWrap:       { width: 64, height: 64, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardHeaderRight: { flex: 1, gap: 2, paddingTop: 2 },
  ratingVal:       { fontSize: 12, fontWeight: '700' },
  ratingCount:     { fontSize: 11 },
  diffText:        { fontSize: 11, fontWeight: '600' },
  recipeName:      { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  metaRow:         { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaChip:        { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  metaChipText:    { fontSize: 11, fontWeight: '600' },
  macroSection:    { gap: 5, paddingTop: 2 },
  macroBarRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  macroBarLabel:   { fontSize: 9, fontWeight: '700', width: 12 },
  macroBarTrack:   { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  macroBarFill:    { height: 4, borderRadius: 2 },
  macroBarVal:     { fontSize: 10, fontWeight: '700', width: 32, textAlign: 'right' },

  missingRow:   { flexDirection: 'row', alignItems: 'center' },
  missingLabel: { fontSize: 11, fontWeight: '600' },
  missingItems: { fontSize: 11, fontWeight: '500', flex: 1 },

  cardFooter:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 10 },
  footerServings: { fontSize: 12, fontWeight: '500' },
  viewBtnText:    { fontSize: 13, fontWeight: '700' },

  // Review card
  reviewCard: {
    borderRadius: RADIUS.md,
    padding: 14, marginBottom: 8,
    borderWidth: 1, gap: 8,
  },
  reviewTop:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  reviewAvatar:    { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reviewAvatarText:{ fontSize: 13, fontWeight: '800' },
  reviewMeta:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUser:      { fontSize: 13, fontWeight: '700' },
  reviewDate:      { fontSize: 11 },
  reviewText:      { fontSize: 13, lineHeight: 20 },

  // Empty state
  emptyCard: {
    alignItems: 'center', paddingVertical: SPACING.xxl,
    borderRadius: RADIUS.xl,
    borderWidth: 1, marginBottom: SPACING.lg,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySub:   { fontSize: 13, textAlign: 'center', paddingHorizontal: SPACING.lg },
});

// ── STYLES: RECIPE ────────────────────────────────────────────────
const rs = StyleSheet.create({
  safe:      { flex: 1 },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 16 },
  errorBtn:  { borderRadius: RADIUS.full, paddingHorizontal: 24, paddingVertical: 12 },
  errorBtnText: { fontSize: 14, fontWeight: '700' },

  hero: {
    flexDirection: 'row', gap: 16, padding: SPACING.md,
    borderBottomWidth: 1,
  },
  heroEmoji:     { width: 88, height: 88, borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroInfo:      { flex: 1, gap: 8, justifyContent: 'center' },
  heroTitle:     { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:          { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5 },
  chipText:      { fontSize: 11, fontWeight: '600' },
  avgRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avgVal:        { fontSize: 13, fontWeight: '700' },
  avgCount:      { fontSize: 11 },

  body:         { padding: SPACING.md },
  sectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.8, marginBottom: 10, marginTop: 4 },

  // Match banner
  matchBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.md, padding: 14,
    borderWidth: 1, marginBottom: SPACING.lg,
  },
  matchIcon:  { fontSize: 16, fontWeight: '800', width: 20, textAlign: 'center' },
  matchTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  matchMissing:{ fontSize: 11 },
  matchPct:   { fontSize: 16, fontWeight: '900', letterSpacing: -0.5 },

  nutriGrid: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
  nutriCard: { flex: 1, borderRadius: RADIUS.md, padding: 12, alignItems: 'center', borderWidth: 1 },
  nutriVal:  { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  nutriUnit: { fontSize: 12, fontWeight: '700' },
  nutriLabel:{ fontSize: 10, fontWeight: '600', marginTop: 3 },

  ingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.lg },
  ingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1,
    borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8,
  },
  ingMissingDot:  { fontSize: 9, fontWeight: '900' },
  ingText:        { fontSize: 13, fontWeight: '500' },

  steps:       { gap: 10, marginBottom: SPACING.lg },
  step:        { flexDirection: 'row', gap: 14, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1 },
  stepNum:     { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText: { fontSize: 12, fontWeight: '900' },
  stepText:    { fontSize: 14, lineHeight: 22, flex: 1, paddingTop: 3 },

  // Reviews section
  reviewsSection:   { marginTop: SPACING.sm },
  reviewsHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  avgPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
  avgPillText: { fontSize: 12, fontWeight: '700' },

  noReviews:     { paddingVertical: SPACING.lg, alignItems: 'center' },
  noReviewsText: { fontSize: 13 },

  addReview: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1,
    gap: 14, marginTop: 8,
  },
  addReviewTitle: { fontSize: 14, fontWeight: '700' },
  reviewInput: {
    borderWidth: 1,
    borderRadius: RADIUS.md, padding: 14,
    fontSize: 14, lineHeight: 20,
    minHeight: 80,
  },

  reviewedBanner: {
    borderRadius: RADIUS.md,
    padding: 14, alignItems: 'center', marginTop: 8,
    borderWidth: 1,
  },
  reviewedText: { fontSize: 13, fontWeight: '600' },

  // Action bar
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    padding: SPACING.md, paddingBottom: 32,
    borderTopWidth: 1,
  },

  // Meal time picker
  mtTitle: { fontSize: 17, fontWeight: '800', marginBottom: SPACING.md, textAlign: 'center' },
  mtOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1,
  },
  mtOptionText: { fontSize: 16, fontWeight: '600' },
});
