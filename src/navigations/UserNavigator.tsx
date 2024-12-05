import React,{FC} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import SVG from '../constants/svgs';

const Stack: any = createNativeStackNavigator();
const Tab: any = createBottomTabNavigator();

import {Pressable, Text, View} from 'react-native';
import fontStyles from '../core/styles/fonts';
import MemberScreen from '../screens/User/Member';
import ReportScreen from '../screens/User/Report';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface NavigationIconProps {
  name: string;
  isFocused: boolean;
}

const NavigationIcon: FC<NavigationIconProps> = ({name, isFocused}) => {
  if (name === 'MemberTab') {
    return isFocused ? (
      <SVG.Bottom_Member_Focus_Icon />
    ) : (
      <SVG.Bottom_Member_Icon />
    );
  } else if (name === 'ReportTab') {
    return isFocused ? (
      <SVG.Bottom_Report_Focus_Icon />
    ) : (
      <SVG.Bottom_Report_Icon />
    );
  }
};

const TabBar: FC<TabBarProps> = ({state, descriptors, navigation}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 45,
        backgroundColor: 'white',
        height: 60,
      }}>
      {state.routes.map((route: any, idx: number) => {
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === idx;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View key={idx} style={{width: '50%'}}>
            <Pressable onPress={onPress}>
              <View style={{alignItems: 'center', marginBottom: 6}}>
                <NavigationIcon name={route.name} isFocused={isFocused} />
              </View>
              <Text
                style={{
                  fontFamily: fontStyles.bold,
                  color: isFocused ? '#065B94' : '#A2AAB1',
                  textAlign: 'center',
                  fontSize: 12,
                }}>
                {label}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const UserNavigator: FC = () => {
  return (
    <>
      <Tab.Navigator
        initialRouteName={'MemberTab'}
        screenOptions={{headerShown: false}}
        tabBar={(props: any) => <TabBar {...props} />}>
        <Tab.Screen
          name={'MemberTab'}
          component={MemberTab}
          options={{
            tabBarLabel: 'สมาชิก',
          }}
        />
        <Tab.Screen
          name={'ReportTab'}
          component={ReportTab}
          options={{
            tabBarLabel: 'แจ้งเหตุ',
          }}
        />
      </Tab.Navigator>
    </>
  );
};

const MemberTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Member"
        component={MemberScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const ReportTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Report"
        component={ReportScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default UserNavigator;
