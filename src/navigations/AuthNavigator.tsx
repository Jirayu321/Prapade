import React,{FC} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/login';

const Stack: any = createNativeStackNavigator();

const AuthNavigator: FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Login',
          tabBarVisible: false,
          tabBarStyle: {display: 'none'},
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
