import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { votesAPI } from '../api';
import BottomNavBar from '../components/BottomNavBar';

export default function LeaderboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contestants, setContestants] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await votesAPI.getStats();
      const list = res.data?.data || [];
      setContestants(list);
      const total = list.reduce((sum, c) => sum + (c.votes || 0), 0);
      setTotalVotes(total);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Leaderboard fetch error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const getSections = () => {
    const map = {};
    contestants.forEach(c => {
      const type = c.talentType || 'Other';
      if (!map[type]) map[type] = [];
      map[type].push(c);
    });
    return Object.keys(map).map(category => ({
      title: category,
      data: map[category].sort((a, b) => b.votes - a.votes)
    })).sort((a, b) => a.title.localeCompare(b.title));
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <View
        style={[
          styles.rankCircle,
          index === 0 && { backgroundColor: '#f1c40f' }, // gold
          index === 1 && { backgroundColor: '#bdc3c7' }, // silver
          index === 2 && { backgroundColor: '#e67e22' }, // bronze
        ]}
      >
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.talent}>{item.talentType || 'Talent'}</Text>
      </View>
      <View style={styles.votesContainer}>
        <Text style={styles.votesLabel}>Votes</Text>
        <Text style={styles.votesValue}>{item.votes}</Text>
        {totalVotes > 0 && (
          <Text style={styles.percentText}>
            {((item.votes / totalVotes) * 100).toFixed(1)}%
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <View style={{ width: 60 }} />
        </View>
        <Text style={styles.headerSubtitle}>Live ranking of approved contestants</Text>
        <Text style={styles.headerStats}>
          {totalVotes > 0 ? `${totalVotes} total votes` : 'Waiting for first votes'}
        </Text>
        {lastUpdated && (
          <Text style={styles.headerUpdated}>
            Last updated {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
        </View>
      ) : (
        <SectionList
          sections={getSections()}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e94560"
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No contestants available yet.</Text>
          }
        />
      )}
      <BottomNavBar navigation={navigation} currentScreen="Leaderboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    color: '#a0a0a0',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    color: '#b2bec3',
    marginTop: 8,
  },
  headerStats: {
    color: '#b2bec3',
    marginTop: 4,
    fontSize: 12,
  },
  headerUpdated: {
    color: '#636e72',
    marginTop: 2,
    fontSize: 11,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankText: {
    color: '#fff',
    fontWeight: '800',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#222',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  talent: {
    color: '#b2bec3',
    fontSize: 12,
    marginTop: 2,
  },
  votesContainer: {
    alignItems: 'flex-end',
  },
  votesLabel: {
    color: '#b2bec3',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  votesValue: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  percentText: {
    color: '#b2bec3',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeaderContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sectionHeaderText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyText: {
    color: '#b2bec3',
    textAlign: 'center',
    marginTop: 40,
  },
});



