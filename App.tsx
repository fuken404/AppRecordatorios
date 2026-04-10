import { StatusBar } from 'expo-status-bar';
import { CategoriesProvider } from './src/context/CategoriesContext';
import { RemindersProvider } from './src/context/RemindersContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <CategoriesProvider>
      <RemindersProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </RemindersProvider>
    </CategoriesProvider>
  );
}
