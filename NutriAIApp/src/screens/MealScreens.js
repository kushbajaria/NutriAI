import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { getRecipeReviews } from '../services/firestore';
import { Badge, SectionHeader } from '../components/UI';
import Icon from '../components/Icon';

// ── STAR ROW ───────────────────────────────────────────────────────
function StarRow({ value, size = 15, onPress }) {
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
          <Text style={{ fontSize: size, color: n <= Math.round(value) ? C.carbs : C.surface4 }}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── REVIEW CARD ───────────────────────────────────────────────────
function ReviewCard({ review }) {
  return (
    <View style={s.reviewCard}>
      <View style={s.reviewTop}>
        <View style={[s.reviewAvatar, review.isOwn && { backgroundColor: C.accent }]}>
          <Text style={[s.reviewAvatarText, review.isOwn && { color: C.textInverse }]}>
            {review.avatar}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={s.reviewMeta}>
            <Text style={s.reviewUser}>{review.isOwn ? 'You' : review.user}</Text>
            <Text style={s.reviewDate}>{review.date}</Text>
          </View>
          <StarRow value={review.stars} size={12} />
        </View>
      </View>
      {!!review.text && <Text style={s.reviewText}>{review.text}</Text>}
    </View>
  );
}

// ── MACRO BAR ROW ─────────────────────────────────────────────────
function MacroBar({ label, value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <View style={s.macroBarRow}>
      <Text style={s.macroBarLabel}>{label}</Text>
      <View style={s.macroBarTrack}>
        <View style={[s.macroBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[s.macroBarVal, { color }]}>{value}g</Text>
    </View>
  );
}

// ── RECIPE CARD ───────────────────────────────────────────────────
function RecipeCard({ recipe: r, recipeReviews, onPress }) {
  const avgRating = recipeReviews.length
    ? recipeReviews.reduce((a, rv) => a + rv.stars, 0) / recipeReviews.length
    : null;
  const allAvailable = r.missingIngredients?.length === 0;
  const hasMatchData = r.matchScore !== undefined;

  return (
    <TouchableOpacity style={s.recipeCard} onPress={onPress} activeOpacity={0.8}>

      {/* Header row */}
      <View style={s.cardHeader}>
        <View style={s.emojiWrap}>
          <Icon name={r.icon} size={24} color={C.accent} />
        </View>
        <View style={s.cardHeaderRight}>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <Badge label={r.tag} color={C.accent} />
            {hasMatchData && allAvailable && (
              <Badge label="Can Make" color={C.green} />
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {avgRating !== null && (
              <>
                <Text style={{ fontSize: 12, color: C.carbs }}>★</Text>
                <Text style={s.ratingVal}>{avgRating.toFixed(1)}</Text>
                <Text style={s.ratingCount}>({recipeReviews.length})</Text>
              </>
            )}
            <Text style={s.diffText}>{r.diff}</Text>
          </View>
        </View>
      </View>

      {/* Name + meta chips */}
      <Text style={s.recipeName}>{r.name}</Text>
      <View style={s.metaRow}>
        <View style={s.metaChip}><Icon name="flame-outline" size={12} color={C.accent} /><Text style={s.metaChipText}>{r.cal} cal</Text></View>
        <View style={s.metaChip}><Icon name="barbell-outline" size={12} color={C.protein} /><Text style={s.metaChipText}>{r.protein}g protein</Text></View>
        <View style={s.metaChip}><Icon name="time-outline" size={12} color={C.textTertiary} /><Text style={s.metaChipText}>{r.prepTime + r.cookTime}m</Text></View>
      </View>

      {/* Macro bars */}
      <View style={s.macroSection}>
        <MacroBar label="P" value={r.protein} max={60}  color={C.protein} />
        <MacroBar label="C" value={r.carbs}   max={100} color={C.carbs}   />
        <MacroBar label="F" value={r.fat}     max={40}  color={C.fat}     />
      </View>

      {/* Missing ingredients */}
      {hasMatchData && r.missingIngredients?.length > 0 && (
        <View style={s.missingRow}>
          <Text style={s.missingLabel}>Missing: </Text>
          <Text style={s.missingItems} numberOfLines={1}>{r.missingIngredients.join(', ')}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={s.cardFooter}>
        <Text style={s.footerServings}>{r.servings} serving{r.servings !== 1 ? 's' : ''}</Text>
        <Text style={s.viewBtnText}>View Recipe →</Text>
      </View>

    </TouchableOpacity>
  );
}

// ── MEALS SCREEN ──────────────────────────────────────────────────
export function MealsScreen({ navigation }) {
  const { pantryMeals, reviews, goal, pantry } = useApp();

  const canMake  = pantryMeals.filter(r => r.matchScore >= 0.6);
  const discover = pantryMeals.filter(r => r.matchScore <  0.6);

  const GOAL_LABELS = {
    'Lose Weight':  '🔥 Lose Weight',
    'Build Muscle': '💪 Build Muscle',
    'Stay Healthy': '🧘 Stay Healthy',
    'Boost Energy': '⚡ Boost Energy',
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Meal Planner</Text>
        <View style={s.headerBadges}>
          <View style={s.infoBadge}>
            <Text style={s.infoBadgeText}>{pantry.length} items in pantry</Text>
          </View>
          <View style={[s.infoBadge, s.infoBadgeAccent]}>
            <Text style={[s.infoBadgeText, { color: C.accent }]}>
              {GOAL_LABELS[goal] || goal}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* From your pantry */}
        <SectionHeader title={`From Your Pantry · ${canMake.length}`} />
        {canMake.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>🛒</Text>
            <Text style={s.emptyTitle}>Add more to your pantry</Text>
            <Text style={s.emptySub}>
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

        {/* Discover more */}
        {discover.length > 0 && (
          <>
            <SectionHeader title={`Discover More · ${discover.length}`} />
            {discover.map(r => (
              <RecipeCard
                key={r.id}
                recipe={r}
                recipeReviews={reviews[r.id] || []}
                onPress={() => navigation.navigate('Recipe', { recipe: r })}
              />
            ))}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── RECIPE SCREEN ─────────────────────────────────────────────────
export function RecipeScreen({ navigation, route }) {
  const { logMeal, reviews, addReview } = useApp();
  const [userStars,  setUserStars]  = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted,  setSubmitted]  = useState(false);
  const [firestoreReviews, setFirestoreReviews] = useState([]);

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
      <SafeAreaView style={rs.safe} edges={['top']}>
        <View style={rs.errorWrap}>
          <Text style={rs.errorText}>Recipe not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={rs.errorBtn}>
            <Text style={rs.errorBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const r              = route.params.recipe;
  // Merge local reviews with Firestore reviews (dedup by id)
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

  const handleLog = () => { logMeal(r); navigation.navigate('Main'); };

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
    <SafeAreaView style={rs.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      {/* Nav bar */}
      <View style={rs.navbar}>
        <TouchableOpacity style={rs.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={rs.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={rs.navTitle} numberOfLines={1}>{r.name}</Text>
        <View style={{ width: 36 }} />
      </View>

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
          <View style={rs.hero}>
            <View style={rs.heroEmoji}>
              <Icon name={r.icon} size={36} color={C.accent} />
            </View>
            <View style={rs.heroInfo}>
              <Badge label={r.tag} color={C.accent} />
              <Text style={rs.heroTitle}>{r.name}</Text>
              <View style={rs.chipRow}>
                {[
                  { icon: 'time-outline', text: `${r.prepTime}m prep` },
                  { icon: 'flame-outline', text: `${r.cookTime}m cook` },
                  { icon: 'people-outline', text: `${r.servings} srv` },
                  { icon: null, text: r.diff },
                ].map(c => (
                  <View key={c.text} style={rs.chip}>
                    {c.icon && <Icon name={c.icon} size={12} color={C.textSecondary} />}
                    <Text style={rs.chipText}>{c.text}</Text>
                  </View>
                ))}
              </View>
              {avgRating > 0 && (
                <View style={rs.avgRow}>
                  <StarRow value={avgRating} size={14} />
                  <Text style={rs.avgVal}>{avgRating.toFixed(1)}</Text>
                  <Text style={rs.avgCount}>
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
                allHave  ? rs.matchBannerGreen :
                someHave ? rs.matchBannerBlue  : rs.matchBannerOrange,
              ]}>
                <Text style={[
                  rs.matchIcon,
                  { color: allHave ? C.green : someHave ? C.accent : C.fat },
                ]}>
                  {allHave ? '✓' : someHave ? '~' : '!'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={rs.matchTitle}>
                    {allHave
                      ? 'All ingredients in your pantry'
                      : `${r.matchedIngredients?.length ?? 0} of ${r.ingredients.length} ingredients available`}
                  </Text>
                  {r.missingIngredients?.length > 0 && (
                    <Text style={rs.matchMissing}>
                      Need: {r.missingIngredients.join(', ')}
                    </Text>
                  )}
                </View>
                <Text style={[rs.matchPct, { color: allHave ? C.green : someHave ? C.accent : C.fat }]}>
                  {matchPct}%
                </Text>
              </View>
            )}

            {/* Nutrition */}
            <Text style={rs.sectionLabel}>NUTRITION</Text>
            <View style={rs.nutriGrid}>
              {[
                { val: r.cal,     unit: '',  label: 'Calories', color: C.accent    },
                { val: r.protein, unit: 'g', label: 'Protein',  color: C.protein },
                { val: r.carbs,   unit: 'g', label: 'Carbs',    color: C.carbs   },
                { val: r.fat,     unit: 'g', label: 'Fat',      color: C.fat     },
              ].map(n => (
                <View key={n.label} style={[rs.nutriCard, { borderColor: n.color + '30', backgroundColor: n.color + '0C' }]}>
                  <Text style={[rs.nutriVal, { color: n.color }]}>
                    {n.val}<Text style={rs.nutriUnit}>{n.unit}</Text>
                  </Text>
                  <Text style={rs.nutriLabel}>{n.label}</Text>
                </View>
              ))}
            </View>

            {/* Ingredients */}
            <Text style={rs.sectionLabel}>INGREDIENTS</Text>
            <View style={rs.ingRow}>
              {r.ingredients.map(ing => {
                const have = r.matchedIngredients?.includes(ing) ?? true;
                return (
                  <View key={ing} style={[rs.ingChip, !have && rs.ingChipMissing]}>
                    {!have && <Text style={rs.ingMissingDot}>✕</Text>}
                    <Text style={[rs.ingText, !have && rs.ingTextMissing]}>{ing}</Text>
                  </View>
                );
              })}
            </View>

            {/* Instructions */}
            <Text style={rs.sectionLabel}>METHOD</Text>
            <View style={rs.steps}>
              {r.instructions.map((step, i) => (
                <View key={i} style={rs.step}>
                  <View style={rs.stepNum}>
                    <Text style={rs.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={rs.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {/* ── Reviews ── */}
            <View style={rs.reviewsSection}>

              {/* Section header */}
              <View style={rs.reviewsHeaderRow}>
                <Text style={rs.sectionLabel}>REVIEWS</Text>
                {avgRating > 0 && (
                  <View style={rs.avgPill}>
                    <Text style={{ fontSize: 12, color: C.carbs }}>★</Text>
                    <Text style={rs.avgPillText}>{avgRating.toFixed(1)}</Text>
                  </View>
                )}
              </View>

              {/* Existing reviews */}
              {recipeReviews.length === 0 ? (
                <View style={rs.noReviews}>
                  <Text style={rs.noReviewsText}>No reviews yet — be the first!</Text>
                </View>
              ) : (
                recipeReviews.map(rv => <ReviewCard key={rv.id} review={rv} />)
              )}

              {/* Add review form */}
              {!alreadyReviewed && !submitted ? (
                <View style={rs.addReview}>
                  <Text style={rs.addReviewTitle}>Rate this meal</Text>
                  <StarRow value={userStars} size={30} onPress={setUserStars} />
                  {userStars > 0 && (
                    <>
                      <TextInput
                        style={rs.reviewInput}
                        placeholder="Share your experience (optional)…"
                        placeholderTextColor={C.textTertiary}
                        value={reviewText}
                        onChangeText={setReviewText}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                      <TouchableOpacity style={rs.submitBtn} onPress={handleSubmitReview} activeOpacity={0.8}>
                        <Text style={rs.submitBtnText}>Post Review</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ) : (
                <View style={rs.reviewedBanner}>
                  <Text style={rs.reviewedText}>✓  You've reviewed this meal</Text>
                </View>
              )}

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action bar */}
      <View style={rs.actionBar}>
        <TouchableOpacity style={rs.logBtn} onPress={handleLog} activeOpacity={0.85}>
          <Text style={rs.logBtnText}>Log This Meal ✓</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── STYLES: MEALS ─────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.black },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  eyebrowRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  eyebrow:     { fontSize: 9, fontWeight: '700', color: C.accent, letterSpacing: 2 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.5 },

  headerBadges: { gap: 6, alignItems: 'flex-end', marginTop: 4 },
  infoBadge: {
    backgroundColor: C.surface2, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: C.border,
  },
  infoBadgeAccent: { borderColor: C.accent + '40', backgroundColor: C.accentBgSm },
  infoBadgeText:   { fontSize: 11, fontWeight: '600', color: C.textSecondary },

  scroll:        { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },

  // Recipe card
  recipeCard: {
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    padding: SPACING.md, marginBottom: 14,
    borderWidth: 1, borderColor: C.border, gap: 10,
  },
  cardHeader:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  emojiWrap:       { width: 64, height: 64, backgroundColor: C.surface3, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emoji:           { fontSize: 34 },
  cardHeaderRight: { flex: 1, gap: 2, paddingTop: 2 },
  ratingVal:       { fontSize: 12, fontWeight: '700', color: C.textSecondary },
  ratingCount:     { fontSize: 11, color: C.textTertiary },
  diffText:        { fontSize: 11, color: C.textTertiary, fontWeight: '600' },
  recipeName:      { fontSize: 18, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.4 },
  metaRow:         { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaChip:        { backgroundColor: C.surface2, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border },
  metaChipText:    { fontSize: 11, color: C.textSecondary, fontWeight: '600' },
  macroSection:    { gap: 5, paddingTop: 2 },
  macroBarRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  macroBarLabel:   { fontSize: 9, fontWeight: '700', color: C.textTertiary, width: 12 },
  macroBarTrack:   { flex: 1, height: 4, backgroundColor: C.surface3, borderRadius: 2, overflow: 'hidden' },
  macroBarFill:    { height: 4, borderRadius: 2 },
  macroBarVal:     { fontSize: 10, fontWeight: '700', width: 32, textAlign: 'right' },

  missingRow:   { flexDirection: 'row', alignItems: 'center' },
  missingLabel: { fontSize: 11, color: C.textTertiary, fontWeight: '600' },
  missingItems: { fontSize: 11, color: C.fat, fontWeight: '500', flex: 1 },

  cardFooter:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 },
  footerServings: { fontSize: 12, color: C.textTertiary, fontWeight: '500' },
  viewBtnText:    { fontSize: 13, color: C.accent, fontWeight: '700' },

  // Review card
  reviewCard: {
    backgroundColor: C.surface2, borderRadius: RADIUS.md,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: C.border, gap: 8,
  },
  reviewTop:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  reviewAvatar:    { width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface3, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reviewAvatarText:{ fontSize: 13, fontWeight: '800', color: C.textSecondary },
  reviewMeta:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUser:      { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  reviewDate:      { fontSize: 11, color: C.textTertiary },
  reviewText:      { fontSize: 13, color: C.textSecondary, lineHeight: 20 },

  // Empty state
  emptyCard: {
    alignItems: 'center', paddingVertical: SPACING.xxl,
    backgroundColor: C.surface1, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: C.border, marginBottom: SPACING.lg,
  },
  emptyIcon:  { fontSize: 40, marginBottom: SPACING.sm },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textSecondary, marginBottom: 4 },
  emptySub:   { fontSize: 13, color: C.textTertiary, textAlign: 'center', paddingHorizontal: SPACING.lg },
});

// ── STYLES: RECIPE ────────────────────────────────────────────────
const rs = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.black },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 16, color: C.textSecondary },
  errorBtn:  { backgroundColor: C.accent, borderRadius: RADIUS.full, paddingHorizontal: 24, paddingVertical: 12 },
  errorBtnText: { fontSize: 14, fontWeight: '700', color: C.textInverse },

  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: C.accent, marginTop: -1 },
  navTitle:    { fontSize: 16, fontWeight: '700', color: C.textPrimary, flex: 1, textAlign: 'center', marginHorizontal: 8 },

  hero: {
    flexDirection: 'row', gap: 16, padding: SPACING.md,
    backgroundColor: C.surface1,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  heroEmoji:     { width: 88, height: 88, backgroundColor: C.surface3, borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroEmojiText: { fontSize: 46 },
  heroInfo:      { flex: 1, gap: 8, justifyContent: 'center' },
  heroTitle:     { fontSize: 20, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.4 },
  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:          { backgroundColor: C.surface3, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5 },
  chipText:      { fontSize: 11, color: C.textSecondary, fontWeight: '600' },
  avgRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avgVal:        { fontSize: 13, fontWeight: '700', color: C.textSecondary },
  avgCount:      { fontSize: 11, color: C.textTertiary },

  body:         { padding: SPACING.md },
  sectionLabel: { fontSize: 9, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.8, marginBottom: 10, marginTop: 4 },

  // Match banner
  matchBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.md, padding: 14,
    borderWidth: 1, marginBottom: SPACING.lg,
  },
  matchBannerGreen:  { backgroundColor: C.green  + '0D', borderColor: C.green  + '30' },
  matchBannerBlue:   { backgroundColor: C.accentBgSm,    borderColor: C.accent   + '30' },
  matchBannerOrange: { backgroundColor: C.fat    + '0D', borderColor: C.fat    + '30' },
  matchIcon:  { fontSize: 16, fontWeight: '800', width: 20, textAlign: 'center' },
  matchTitle: { fontSize: 13, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  matchMissing:{ fontSize: 11, color: C.textTertiary },
  matchPct:   { fontSize: 16, fontWeight: '900', letterSpacing: -0.5 },

  nutriGrid: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
  nutriCard: { flex: 1, borderRadius: RADIUS.md, padding: 12, alignItems: 'center', borderWidth: 1 },
  nutriVal:  { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  nutriUnit: { fontSize: 12, fontWeight: '700' },
  nutriLabel:{ fontSize: 10, color: C.textTertiary, fontWeight: '600', marginTop: 3 },

  ingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.lg },
  ingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderHi,
    borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8,
  },
  ingChipMissing: { borderColor: C.fat + '50', backgroundColor: C.fat + '0D' },
  ingMissingDot:  { fontSize: 9, color: C.fat, fontWeight: '900' },
  ingText:        { fontSize: 13, color: C.textPrimary, fontWeight: '500' },
  ingTextMissing: { color: C.fat },

  steps:       { gap: 10, marginBottom: SPACING.lg },
  step:        { flexDirection: 'row', gap: 14, backgroundColor: C.surface1, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: C.border },
  stepNum:     { width: 28, height: 28, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...SHADOW.accent },
  stepNumText: { fontSize: 12, fontWeight: '900', color: C.textInverse },
  stepText:    { fontSize: 14, color: C.textSecondary, lineHeight: 22, flex: 1, paddingTop: 3 },

  // Reviews section
  reviewsSection:   { marginTop: SPACING.sm },
  reviewsHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  avgPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.surface2, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: C.border,
  },
  avgPillText: { fontSize: 12, fontWeight: '700', color: C.textSecondary },

  noReviews:     { paddingVertical: SPACING.lg, alignItems: 'center' },
  noReviewsText: { fontSize: 13, color: C.textTertiary },

  addReview: {
    backgroundColor: C.surface1, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: C.border,
    gap: 14, marginTop: 8,
  },
  addReviewTitle: { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  reviewInput: {
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
    borderRadius: RADIUS.md, padding: 14,
    color: C.textPrimary, fontSize: 14, lineHeight: 20,
    minHeight: 80,
  },
  submitBtn: {
    backgroundColor: C.accent, borderRadius: RADIUS.full,
    paddingVertical: 14, alignItems: 'center',
    ...SHADOW.accent,
  },
  submitBtnText: { fontSize: 14, fontWeight: '800', color: C.textInverse },

  reviewedBanner: {
    backgroundColor: C.accentBgSm, borderRadius: RADIUS.md,
    padding: 14, alignItems: 'center', marginTop: 8,
    borderWidth: 1, borderColor: C.accent + '30',
  },
  reviewedText: { fontSize: 13, fontWeight: '600', color: C.accent },

  // Action bar
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    padding: SPACING.md, paddingBottom: 32,
    backgroundColor: C.black, borderTopWidth: 1, borderTopColor: C.border,
  },
  ghostBtn:     { width: 80, height: 52, borderRadius: RADIUS.full, borderWidth: 1, borderColor: C.borderHi, alignItems: 'center', justifyContent: 'center' },
  ghostBtnText: { fontSize: 14, color: C.textSecondary, fontWeight: '600' },
  logBtn:       { flex: 1, height: 52, backgroundColor: C.accent, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', ...SHADOW.accent },
  logBtnText:   { fontSize: 15, fontWeight: '800', color: C.textInverse },
});
