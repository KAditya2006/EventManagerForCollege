import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { getAppUsers } from '../../api/adminEvents';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing } from '../../theme';
import { SearchIcon, UserIcon } from '../../components/FormIcons';

interface AppUser {
  _id: string;
  name?: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  rollNumber?: string;
  phone?: string;
  course?: string;
  branch?: string;
  year?: string;
  semester?: string;
  profileCompleted: boolean;
  registrationsCount?: number;
  createdAt: string;
}

const AdminUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAppUsers({ search: searchQuery.trim(), limit: 100 });
      if (res.success && res.data) {
        setUsers(res.data.users);
        setTotalUsers(res.data.totalUsers);
        setTotalStudents(res.data.totalStudents);
      }
    } catch (error) {
      console.error('Failed to fetch app users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

  const onRefresh = () => fetchUsers(true);

  const renderUserItem = ({ item }: { item: AppUser }) => {
    const isAdmin = item.role === 'ADMIN';
    const displayName = item.name || (isAdmin ? 'Administrator' : 'Student (Profile Pending)');
    const initial = displayName.charAt(0).toUpperCase();

    const academicDetails = [
      item.rollNumber ? `ID: ${item.rollNumber}` : null,
      item.course,
      item.branch,
      item.year,
    ].filter(Boolean).join(' • ');

    return (
      <View style={styles.userCard}>
        <View style={styles.userCardHeader}>
          <View style={[styles.avatar, isAdmin && { backgroundColor: '#7C3AED' }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.userMainInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
              <View style={[styles.roleBadge, isAdmin ? styles.adminBadge : styles.studentBadge]}>
                <Text style={[styles.roleBadgeText, isAdmin ? styles.adminBadgeText : styles.studentBadgeText]}>
                  {item.role}
                </Text>
              </View>
            </View>

            <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
          </View>
        </View>

        {academicDetails ? (
          <View style={styles.academicRow}>
            <Text style={styles.academicText} numberOfLines={1}>{academicDetails}</Text>
          </View>
        ) : null}

        <View style={styles.userCardFooter}>
          <View style={styles.footerCol}>
            <Text style={styles.footerLabel}>Registrations</Text>
            <Text style={styles.footerValue}>{item.registrationsCount || 0} events</Text>
          </View>

          {item.phone ? (
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Phone</Text>
              <Text style={styles.footerValue}>{item.phone}</Text>
            </View>
          ) : null}

          <View style={styles.footerCol}>
            <Text style={styles.footerLabel}>Profile Status</Text>
            <Text style={[styles.footerValue, { color: item.profileCompleted ? '#16A34A' : '#D97706' }]}>
              {item.profileCompleted ? 'Verified ✓' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header Stats */}
        <View style={styles.statsDeck}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalUsers}</Text>
            <Text style={styles.statLabel}>Total App Users</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{totalStudents}</Text>
            <Text style={styles.statLabel}>Verified Students</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <SearchIcon size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search student by Name, Roll No, Branch..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Users List */}
        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading registered users...</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            renderItem={renderUserItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                title="No Users Found"
                message={
                  searchQuery.trim()
                    ? `No students matching "${searchQuery}".`
                    : 'No users have registered in the portal yet.'
                }
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  statsDeck: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '65%',
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13.5,
    color: '#0F172A',
    height: '100%',
  },
  clearSearch: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  listContent: {
    paddingBottom: 24,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0E526B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadge: {
    backgroundColor: '#F3E8FF',
  },
  studentBadge: {
    backgroundColor: '#E0F2FE',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  adminBadgeText: {
    color: '#7C3AED',
  },
  studentBadgeText: {
    color: '#0284C7',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  academicRow: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  academicText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0E526B',
  },
  userCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerCol: {
    alignItems: 'flex-start',
  },
  footerLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footerValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
});

export default AdminUsersScreen;
