import { Redirect } from 'expo-router';

export default function TabsIndex() {
  // Redirect to the feed tab by default
  return <Redirect href="/(tabs)/feed" />;
}