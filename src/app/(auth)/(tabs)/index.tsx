import { Redirect } from 'expo-router';
import { useSessionStore } from '@/stores/sessionStore';
import TrackSelectionScreen from '../track-selection';

export default function HomeScreen() {
  const { onboardingComplete } = useSessionStore();

  // If onboarding is not complete, show track selection
  if (!onboardingComplete) {
    return <TrackSelectionScreen />;
  }

  // Onboarding complete — redirect to session check-in
  return <Redirect href="/session/checkin" />;
}