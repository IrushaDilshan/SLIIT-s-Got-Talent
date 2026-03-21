import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function BottomNavBar({ navigation, currentScreen }) {
  const go = (screen) => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate(screen);
    }
  };

  const Item = ({ label, icon, screen }) => {
    const isActive = currentScreen === screen;
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => go(screen)}
        activeOpacity={0.8}
      >
        <View style={[styles.pill, isActive && styles.pillActive]}>
          <Text style={[styles.icon, isActive && styles.iconActive]}>{icon}</Text>
          <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.outer}>
      <View style={styles.container}>
        <Item label="Home" icon="⌂" screen="Voting" />
        <Item label="Ranking" icon="★" screen="Leaderboard" />
        <Item label="Settings" icon="⚙" screen="Settings" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 6,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(15, 15, 26, 0.95)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  pillActive: {
    backgroundColor: 'rgba(233, 69, 96, 0.2)',
  },
  icon: {
    color: '#636e72',
    fontSize: 16,
    marginRight: 4,
  },
  iconActive: {
    color: '#e94560',
  },
  label: {
    color: '#b2bec3',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    color: '#fff',
  },
});
