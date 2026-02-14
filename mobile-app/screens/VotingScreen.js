import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
    Dimensions,
    ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { contestantsAPI, votesAPI, timerAPI } from '../api';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Dummy data for fallback if API is empty/down
const DUMMY_CONTESTANTS = [
    { _id: '1', name: 'Araliya Band', talent: 'Band', category: 'Music', description: 'A fusion of traditional and modern beats.', imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800' },
    { _id: '2', name: 'Nethmi Rosara', talent: 'Solo Singer', category: 'Singing', description: 'Soulful melodies that touch the heart.', imageUrl: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800' },
    { _id: '3', name: 'Rhythm Crew', talent: 'Hip Hop Dance', category: 'Dancing', description: 'Energy, precision, and style.', imageUrl: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800' },
    { _id: '4', name: 'Kasun Kalhara', talent: 'Magician', category: 'Magic', description: 'Mind-bending illusions.', imageUrl: 'https://images.unsplash.com/photo-1556648710-857504ba428d?w=800' },
];

const CATEGORIES = ['All', 'Singing', 'Dancing', 'Music', 'Magic'];

export default function VotingScreen() {
    const { user, logout, hasVoted, updateUserVoteStatus } = useAuth();
    const [contestants, setContestants] = useState([]);
    const [eventStatus, setEventStatus] = useState('upcoming');
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [loading, setLoading] = useState(true);
    const [votingLoading, setVotingLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [contestantsRes, statusRes] = await Promise.all([
                contestantsAPI.getAll(),
                timerAPI.getEventStatus()
            ]);

            // If API returns empty, use dummy data for demo purposes
            if (contestantsRes.data && contestantsRes.data.length > 0) {
                setContestants(contestantsRes.data);
            } else {
                setContestants(DUMMY_CONTESTANTS);
            }

            setEventStatus(statusRes.data.status);
            // Mock time left if 0 for demo
            setTimeLeft(statusRes.data.timeLeft || 86400 * 2 + 3600 * 5); // 2 days 5 hours

        } catch (error) {
            // Fallback to dummy data on error
            setContestants(DUMMY_CONTESTANTS);
            setTimeLeft(86400 * 2); // 2 days default
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleVote = async (contestantId, contestantName) => {
        // Allow voting in dummy mode or if active
        // if (eventStatus !== 'active') {
        //     Alert.alert('Voting Closed', 'Voting is not currently active.');
        //     return;
        // }

        if (hasVoted) {
            Alert.alert('Already Voted', 'You have already cast your vote.');
            return;
        }

        Alert.alert(
            'Confirm Vote',
            `Vote for ${contestantName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Vote',
                    onPress: async () => {
                        try {
                            setVotingLoading(true);
                            // Simulate vote API
                            await new Promise(r => setTimeout(r, 1000));
                            // await votesAPI.castVote(contestantId);
                            await updateUserVoteStatus();
                            Alert.alert('Success', 'Your vote has been cast!');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cast vote');
                        } finally {
                            setVotingLoading(false);
                        }
                    },
                },
            ]
        );
    };

    // Format seconds into HH:MM:SS (or Days + HH:MM:SS)
    const formatTime = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        if (d > 0) return `${d}d ${h}h ${m}m`;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const filteredContestants = selectedCategory === 'All'
        ? contestants
        : contestants.filter(c => c.category === selectedCategory || c.talent.includes(selectedCategory));

    const renderContestant = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
                style={styles.cardImage}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.cardOverlay}
            />

            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.categoryTag}>{item.category || 'Talent'}</Text>
                    {hasVoted && <Text style={styles.votedTag}>VOTED</Text>}
                </View>

                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.talent}>{item.talent}</Text>

                <TouchableOpacity
                    style={[
                        styles.voteButton,
                        hasVoted && styles.voteButtonDisabled
                    ]}
                    onPress={() => handleVote(item._id, item.name)}
                    disabled={hasVoted}
                >
                    <Text style={styles.voteButtonText}>
                        {hasVoted ? 'Voted' : 'Vote Now'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header Section */}
            <LinearGradient
                colors={['#1a1a2e', '#16213e']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Live Voting</Text>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                {/* Counter Section */}
                <View style={styles.counterContainer}>
                    <Text style={styles.counterLabel}>VOTING ENDS IN</Text>
                    <Text style={styles.counterValue}>{formatTime(timeLeft)}</Text>
                </View>
            </LinearGradient>

            {/* Category Filter */}
            <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                selectedCategory === cat && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === cat && styles.categoryTextActive
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#e94560" />
                </View>
            ) : (
                <FlatList
                    data={filteredContestants}
                    renderItem={renderContestant}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No contestants in this category.</Text>
                    }
                />
            )}
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
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
    },
    logoutBtn: {
        padding: 5,
    },
    logoutText: {
        color: '#a0a0a0',
        fontSize: 14,
        fontWeight: '600',
    },
    counterContainer: {
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    counterLabel: {
        color: '#e94560', // Accent color
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 5,
    },
    counterValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    categoryContainer: {
        marginVertical: 15,
    },
    categoryScroll: {
        paddingHorizontal: 20,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#1a1a2e',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    categoryChipActive: {
        backgroundColor: '#e94560',
        borderColor: '#e94560',
    },
    categoryText: {
        color: '#888',
        fontWeight: '600',
    },
    categoryTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        height: 250,
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#1a1a2e',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        justifyContent: 'flex-end',
        padding: 20,
    },
    cardContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    categoryTag: {
        color: '#e94560',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    votedTag: {
        backgroundColor: '#2ecc71',
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    talent: {
        fontSize: 16,
        color: '#ccc',
        marginBottom: 15,
    },
    voteButton: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    voteButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    voteButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        marginTop: 50,
    }
});
