import React, { useRef } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ReminderDetailScreen } from '../screens/ReminderDetailScreen';
import { ReminderFormScreen } from '../screens/ReminderFormScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { useNotifications } from '../hooks/useNotifications';
import { Colors } from '../constants/colors';

export type RootStackParamList = {
  Home: undefined;
  ReminderDetail: { reminderId: string };
  ReminderForm: { reminderId?: string };
  Categories: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.primary,
  headerTitleStyle: { fontWeight: '700', color: Colors.text },
  contentStyle: { backgroundColor: Colors.background },
};

export function RootNavigator() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList> | null>(null);
  useNotifications(navigationRef);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'Mis Recordatorios',
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 15 }}>
                  Categorías
                </Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="ReminderDetail"
          component={ReminderDetailScreen}
          options={{ title: 'Detalle' }}
        />
        <Stack.Screen
          name="ReminderForm"
          component={ReminderFormScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{ title: 'Categorías' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
