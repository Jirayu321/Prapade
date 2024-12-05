/* eslint-disable react-native/no-inline-styles */
import React,{FC} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import SVG from '../constants/svgs';

const Stack: any = createNativeStackNavigator();
const Tab: any = createBottomTabNavigator();

import OfficerScreen from '../screens/Officer/Officer';
import {Pressable, Text, View} from 'react-native';
import MeterMonitorScreen from '../screens/Officer/Meter_monitor';
import PaymentScreen from '../screens/Officer/Payment';
import FindLocationScreen from '../screens/Officer/Find_location';
import fontStyles from '../core/styles/fonts';
import AddLocationScreen from '../screens/Officer/Add_location';
import CameraLocation from '../screens/Officer/Camera';
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
  if (name === 'OfficerTab') {
    return isFocused ? (
      <SVG.Bottom_Officer_Focus_Icon />
    ) : (
      <SVG.Bottom_Officer_Icon />
    );
  } else if (name === 'MeterMonitorTab') {
    return isFocused ? (
      <SVG.Bottom_MeterMonitor_Focus_Icon />
    ) : (
      <SVG.Bottom_MeterMonitor_Icon />
    );
  } else if (name === 'PaymentScreenTab') {
    return isFocused ? (
      <SVG.Bottom_Payment_Focus_Icon />
    ) : (
      <SVG.Bottom_Payment_Icon />
    );
  } else if (name === 'FindLocationScreenTab') {
    return isFocused ? (
      <SVG.Bottom_FindLocation_Focus_Icon />
    ) : (
      <SVG.Bottom_FindLocation_Icon />
    );
  }else if (name === 'ReportTab') {
    return isFocused ? (
      <SVG.Bottom_Report_Focus_Icon />
    ) : (
      <SVG.Bottom_Report_Icon />
    );
  }
};

const TabBar: FC<TabBarProps> = ({state, descriptors, navigation}) => {
  // console.log("TabBar state:", state);
  // console.log("TabBar descriptors:", descriptors);
  // console.log("TabBar navigation:", navigation);
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
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
          <View key={idx}>
            <Pressable onPress={onPress}>
              <View style={{alignItems: 'center', marginBottom: 6}}>
                <NavigationIcon name={route.name} isFocused={isFocused} />
              </View>
              <Text
                style={{
                  fontFamily: fontStyles.bold,
                  color: isFocused ? '#065B94' : '#A2AAB1',
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

const OfficerNavigator: FC = () => {
  return (
    <>
      <Tab.Navigator
        initialRouteName={'OfficerTab'}
        screenOptions={{headerShown: false}}
        tabBar={(props: any) => <TabBar {...props} />}>
          
        <Tab.Screen
          name={'OfficerTab'}
          component={OfficerScreenTab}
          options={{
            tabBarLabel: 'เจ้าหน้าที่',
          }}
        />
        <Tab.Screen
          name={'MeterMonitorTab'}
          component={MeterScreenTab}
          options={{
            tabBarLabel: 'จอมิเตอร์',
          }}
        />
        <Tab.Screen
          name={'PaymentScreenTab'}
          component={PaymentScreenTab}
          options={{
            tabBarLabel: 'ชำระเงิน',
          }}
        />
        <Tab.Screen
          name={'FindLocationScreenTab'}
          component={FindLocationScreenTab}
          options={{
            tabBarLabel: 'ค้นหาตำแหน่ง',
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

const OfficerScreenTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Officer"
        component={OfficerScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const MeterScreenTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MeterMonitor"
        component={MeterMonitorScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const PaymentScreenTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const FindLocationScreenTab = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FindLocation"
        component={FindLocationScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddLocation"
        component={AddLocationScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CameraLocation"
        component={CameraLocation}
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


export default OfficerNavigator;
