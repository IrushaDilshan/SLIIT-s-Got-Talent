import React, { useState } from 'react';
import { View } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import VotingScreen from './screens/VotingScreen';

// Simple manual navigator to bypass strict native navigation crashes
function Main() {
  const { isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Onboarding');

  const navigate = (screenName) => {
    setCurrentScreen(screenName);
  };

  // Mock navigation object
  const navigation = {
    navigate: navigate,
    goBack: () => setCurrentScreen('Onboarding'), // simple fallback
    replace: navigate,
  };

  if (isAuthenticated) {
    return <VotingScreen />;
  }

  switch (currentScreen) {
    case 'Onboarding':
      return <OnboardingScreen navigation={navigation} />;
    case 'Login':
      return <LoginScreen navigation={navigation} />;
    default:
      return <OnboardingScreen navigation={navigation} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
