import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/colors';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
          headerBackTitle: '',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="events/[id]"
          options={{ title: 'EVENT', headerShown: true }}
        />
        <Stack.Screen
          name="locations/[id]"
          options={{ title: 'LOCATION', headerShown: true }}
        />
        <Stack.Screen
          name="roster/index"
          options={{ title: 'ROSTER', headerShown: true }}
        />
        <Stack.Screen
          name="roster/[niche]"
          options={{ title: 'ROSTER', headerShown: true }}
        />
        <Stack.Screen
          name="haybah/index"
          options={{ title: 'HAYBAH', headerShown: true }}
        />
        <Stack.Screen
          name="haybah/[id]"
          options={{ title: 'HAYBAH', headerShown: true }}
        />
      </Stack>
    </>
  );
}
