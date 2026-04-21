import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'not-started' | 'in-progress' | 'resolved';
  reportedBy: string;
  unitNumber: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

export default function ReportsScreen() {
  const { theme, isDark } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'not-started' | 'in-progress' | 'resolved'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock reports data
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'Street Lamp Out',
      description: 'Street lamp near Unit 15 has been out for 3 days. Area is very dark at night.',
      category: 'Lighting',
      status: 'not-started',
      reportedBy: 'Sarah Johnson',
      unitNumber: 'Unit 15',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      priority: 'high'
    },
    {
      id: '2',
      title: 'Broken Gate Motor',
      description: 'Main entrance gate motor making unusual noises and opening slowly.',
      category: 'Security',
      status: 'in-progress',
      reportedBy: 'Michael Chen',
      unitNumber: 'Unit 8',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      priority: 'high'
    },
    {
      id: '3',
      title: 'Pool Filter Issue',
      description: 'Pool water appears cloudy. Filter system may need maintenance.',
      category: 'Maintenance',
      status: 'resolved',
      reportedBy: 'Emma Wilson',
      unitNumber: 'Unit 23',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Damaged Playground Equipment',
      description: 'Swing set chain is broken. Safety concern for children.',
      category: 'Safety',
      status: 'in-progress',
      reportedBy: 'David Miller',
      unitNumber: 'Unit 31',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      priority: 'high'
    },
    {
      id: '5',
      title: 'Garden Sprinkler Malfunction',
      description: 'Sprinkler system in common area garden not working properly.',
      category: 'Landscaping',
      status: 'not-started',
      reportedBy: 'Lisa Anderson',
      unitNumber: 'Unit 7',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      priority: 'low'
    },
    {
      id: '6',
      title: 'Parking Area Pothole',
      description: 'Large pothole in visitor parking area causing vehicle damage.',
      category: 'Infrastructure',
      status: 'resolved',
      reportedBy: 'Robert Brown',
      unitNumber: 'Unit 19',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      priority: 'medium'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return theme.error; // Red
      case 'in-progress': return theme.warning; // Yellow
      case 'resolved': return theme.success; // Green
      default: return theme.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not-started': return 'Not Started';
      case 'in-progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return 'Unknown';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.success;
      default: return theme.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lighting': return 'bulb';
      case 'Security': return 'shield-checkmark';
      case 'Maintenance': return 'construct';
      case 'Safety': return 'warning';
      case 'Landscaping': return 'leaf';
      case 'Infrastructure': return 'business';
      default: return 'document-text';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const filteredReports = selectedFilter === 'all' 
    ? reports 
    : reports.filter(report => report.status === selectedFilter);

  const handleNewReport = () => {
    Alert.alert(
      'Submit New Report',
      'Report submission feature coming soon! You will be able to report maintenance issues, safety concerns, and other estate matters.',
      [{ text: 'OK' }]
    );
  };

  return (
    <Screen>
      <LinearGradient
        colors={isDark ? ['#0a0a0b', '#1a1a1b'] : ['#f8f9fb', '#ffffff']}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Header */}
          <GlassCard intensity="light" style={styles.headerCard}>
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>
                  Estate Reports
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Track maintenance & issues
                </Text>
              </View>
              <TouchableOpacity 
                onPress={handleNewReport}
                style={[styles.newReportButton, { backgroundColor: theme.primary }]}
              >
                <Ionicons name="add" size={24} color={theme.textInverse} />
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Filter Buttons */}
          <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {[
                  { key: 'all', label: 'All Reports', count: reports.length },
                  { key: 'not-started', label: 'Not Started', count: reports.filter(r => r.status === 'not-started').length },
                  { key: 'in-progress', label: 'In Progress', count: reports.filter(r => r.status === 'in-progress').length },
                  { key: 'resolved', label: 'Resolved', count: reports.filter(r => r.status === 'resolved').length }
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    onPress={() => setSelectedFilter(filter.key as any)}
                    style={styles.filterButton}
                  >
                    <LinearGradient
                      colors={selectedFilter === filter.key 
                        ? theme.gradientPrimary 
                        : isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.01)']
                      }
                      style={styles.filterButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        { color: selectedFilter === filter.key ? theme.textInverse : theme.text }
                      ]}>
                        {filter.label}
                      </Text>
                      <View style={[
                        styles.filterBadge,
                        { backgroundColor: selectedFilter === filter.key ? 'rgba(255,255,255,0.3)' : theme.primary + '20' }
                      ]}>
                        <Text style={[
                          styles.filterBadgeText,
                          { color: selectedFilter === filter.key ? theme.textInverse : theme.primary }
                        ]}>
                          {filter.count}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Reports List */}
          <View style={styles.reportsSection}>
            {filteredReports.length === 0 ? (
              <GlassCard intensity="light" style={styles.emptyCard}>
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color={theme.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    No Reports Found
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    No reports match the selected filter
                  </Text>
                </View>
              </GlassCard>
            ) : (
              filteredReports.map((report) => (
                <GlassCard key={report.id} intensity="medium" style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportIconContainer}>
                      <View style={[styles.categoryIcon, { backgroundColor: theme.primary + '20' }]}>
                        <Ionicons
                          name={getCategoryIcon(report.category)}
                          size={20}
                          color={theme.primary}
                        />
                      </View>
                      <View style={styles.reportTitleContainer}>
                        <Text style={[styles.reportTitle, { color: theme.text }]}>
                          {report.title}
                        </Text>
                        <Text style={[styles.reportCategory, { color: theme.textSecondary }]}>
                          {report.category} • {report.unitNumber}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Status Light */}
                    <View style={styles.statusContainer}>
                      <View style={[
                        styles.statusLight,
                        { backgroundColor: getStatusColor(report.status) }
                      ]} />
                      <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                        {getStatusText(report.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.reportDescription, { color: theme.textSecondary }]}>
                    {report.description}
                  </Text>

                  <View style={styles.reportFooter}>
                    <View style={styles.reportMeta}>
                      <Text style={[styles.reportBy, { color: theme.textTertiary }]}>
                        Reported by {report.reportedBy}
                      </Text>
                      <Text style={[styles.reportDate, { color: theme.textTertiary }]}>
                        {formatDate(report.timestamp)}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(report.priority) + '20' }
                    ]}>
                      <Text style={[
                        styles.priorityText,
                        { color: getPriorityColor(report.priority) }
                      ]}>
                        {report.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              ))
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerCard: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  newReportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  filterButton: {
    minWidth: 120,
  },
  filterButtonGradient: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  filterBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reportsSection: {
    gap: 16,
    paddingBottom: 20,
  },
  reportCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportTitleContainer: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  reportCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'center',
    gap: 4,
  },
  statusLight: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  reportMeta: {
    flex: 1,
  },
  reportBy: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
    fontWeight: '400',
  },
  priorityBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyCard: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 