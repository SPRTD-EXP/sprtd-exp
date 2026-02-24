import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';
import { DiamondIcon } from '../../components/ui/DiamondIcon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
        },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '800', letterSpacing: 2 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ focused }) => (
            <DiamondIcon icon="home" active={focused} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'EVENTS',
          tabBarIcon: ({ focused }) => (
            <DiamondIcon icon="events" active={focused} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          title: 'LOCATIONS',
          tabBarIcon: ({ focused }) => (
            <DiamondIcon icon="map" active={focused} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ focused }) => (
            <DiamondIcon icon="profile" active={focused} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}
