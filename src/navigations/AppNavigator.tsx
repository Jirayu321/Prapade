import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React,{FC} from 'react';
import AuthNavigator from './AuthNavigator';
import OfficerNavigator from './OfficerNavigator';
import UserNavigator from './UserNavigator';
import {userAuthorization} from '../query/user';
import {View} from '@gluestack-ui/themed';
import {ActivityIndicator} from 'react-native';

const Stack: any = createNativeStackNavigator();

const AppNavigator: FC = () => {
  return (
    <NavigationContainer>
      <ScreenStack />
    </NavigationContainer>
  );
};

const ScreenStack: FC = () => {
  const login = userAuthorization();

  if (login.isPending) {
    return (
      <View
        width={'$full'}
        height={'$full'}
        flex={1}
        justifyContent="center"
        alignContent="center">
        <ActivityIndicator size="large" />
      </View>
    );
  } else {
    return (
      <Stack.Navigator>
        {(!login.data && (
          <Stack.Screen
            name="AuthNavigator"
            component={AuthNavigator}
            options={{
              title: 'AuthNavigator',
              animation: 'fade_from_bottom',
              animationDuration: 300,
              tabBarVisible: false,
              tabBarStyle: {display: 'none'},
              headerShown: false,
            }}
          />
        )) ||
          (login.data && (
            <>
              {(login.data === 1 && (
                <Stack.Screen
                  name="OfficerNavigator"
                  component={OfficerNavigator}
                  options={{
                    title: 'OfficerNavigator',
                    animation: 'fade_from_bottom',
                    animationDuration: 300,
                    tabBarVisible: false,
                    tabBarStyle: {display: 'none'},
                    headerShown: false,
                  }}
                />
              )) ||
                (login.data === 2 && (
                  <Stack.Screen
                    name="UserNavigator"
                    component={UserNavigator}
                    options={{
                      title: 'UserNavigator',
                      animation: 'fade_from_bottom',
                      animationDuration: 300,
                      tabBarVisible: false,
                      tabBarStyle: {display: 'none'},
                      headerShown: false,
                    }}
                  />
                ))}
            </>
          ))}
      </Stack.Navigator>
    );
  }
};

export default AppNavigator;
