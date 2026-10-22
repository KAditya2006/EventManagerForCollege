import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  RefreshControl 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getEvents, Event } from '../../api/events';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { colors, radii, spacing, typography } from '../../theme';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop'];

const EventsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params: any = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (activeCategory !== 'All') {
        params.category = activeCategory;
      }
      
      const response = await getEvents(params);
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to load events', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 250); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, fetchEvents]);

  const onRefresh = () => {
    fetchEvents(true);
  };

  const renderEventCard = ({ item }: { item: Event }) => {
    const eventDate = new Date(item.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const isCancelled = item.status === 'CANCELLED';

    return (
      <Card
        onPress={() => navigation.navigate('EventDetails', { eventId: item._id })}
        accessibilityLabel={`Event: ${item.title}`}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          {isCancelled ? (
            <Badge label="CANCELLED" variant="danger" size="sm" />
          ) : item.category ? (
            <Badge label={item.category} variant="primary" size="sm" />
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📅</Text>
          <Text style={styles.metaText}>{eventDate} • {item.startTime}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText} numberOfLines={1}>{item.venue}</Text>
        </View>

        {item.organizer && (
          <View style={styles.footerRow}>
            <Text style={styles.organizerText}>Organized by {item.organizer}</Text>
          </View>
        )}
      </Card>
    );
  };

  const renderCategoryPill = (category: string) => {
    const isActive = activeCategory === category;
    return (
      <TouchableOpacity
        key={category}
        style={[styles.categoryPill, isActive && styles.categoryPillActive]}
        onPress={() => setActiveCategory(category)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${category}`}
      >
        <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events by title or venue..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search events"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={item => item}
            renderItem={({ item }) => renderCategoryPill(item)}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      </View>

      {loading && !refreshing && events.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching events...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={renderEventCard}
          ListEmptyComponent={
            <EmptyState
              icon="🔍"
              title="No Events Found"
              message={
                searchQuery
                  ? `No events match "${searchQuery}". Try a different keyword.`
                  : `No published events found in the "${activeCategory}" category.`
              }
              actionTitle={searchQuery || activeCategory !== 'All' ? 'Reset Filters' : undefined}
              onAction={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
            />
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[colors.primary]} 
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    height: 46,
    marginBottom: spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoriesContainer: {
    height: 42,
  },
  categoriesList: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: spacing.lg,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSubtle,
    marginHorizontal: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: colors.textInverse,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metaIcon: {
    fontSize: 13,
    marginRight: spacing.xs + 2,
  },
  metaText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    flex: 1,
  },
  footerRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  organizerText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});

export default EventsScreen;
