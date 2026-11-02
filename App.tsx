import { StatusBar } from 'expo-status-bar';
import { CategoriesProvider } from './src/context/CategoriesContext';
import { RemindersProvider } from './src/context/RemindersContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { DemoShell } from './src/demo/DemoShell';

export default function App() {
  return (
    <CategoriesProvider>
      <RemindersProvider>
        <DemoShell>
          <RootNavigator />
        </DemoShell>
        <StatusBar style="auto" />
      </RemindersProvider>
    </CategoriesProvider>
  );
}
