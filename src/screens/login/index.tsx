/* eslint-disable react-native/no-inline-styles */
import React, {FC, useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import Images from '../../constants/images';
import fontStyles from '../../core/styles/fonts';
import SVG from '../../constants/svgs';
import {userLogin} from '../../query/user';
import {useGetAgency} from '../../query/Agency';

const styles = StyleSheet.create({
  mainBackground: {
    backgroundColor: '#3DA1FF',
    flex: 1,
  },
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleFont: {
    fontFamily: fontStyles.bold,
    color: 'white',
    fontSize: 28,
  },
  textInput: {
    fontFamily: fontStyles.medium,
    color: '#5C656E',
    backgroundColor: '#99CDFF',
    width: '90%',
    paddingVertical: 8,
    paddingLeft: 65,
    paddingRight: 16,
    fontSize: 16,
    borderRadius: 16,
    borderColor: '#A2AAB1',
    borderWidth: 1,
  },
});

const LoginScreen: FC = () => {
  const [keyboardIsVisible, setKeyboardIsVisible] = useState(false);
  const useLogin = userLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const useAgency = useGetAgency();
  console.log('seAgency?.data?.[0]', useAgency?.data?.[0]);
  const divisionName =
    useAgency?.data?.[0]?.divisionName.split('เทศบาลตำบล') || '';
  const organizeName = useAgency?.data?.[0]?.organizeName || '';

  const firstPart = divisionName[0] || ''; // กองการประปา
const secondPart = divisionName[1] ? `เทศบาลตำบล${divisionName[1]}` : '';

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardIsVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardIsVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    await useLogin.mutateAsync({username, password});
  };

  return (
    <SafeAreaView style={styles.mainBackground}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}>
        <KeyboardAvoidingView style={{...styles.container, flex: 1}} enabled>
          <View
            style={{
              alignItems: 'center',
            }}>
            <Image
              source={Images.Logo}
              style={{
                width: 120,
                height: 120,
              }}
              alt="Logo"
            />
          </View>
          <View
            style={{
              alignItems: 'center',
              marginTop: 16,
            }}>
            <Text style={styles.titleFont}>{firstPart}</Text>
            <Text style={styles.titleFont}>{secondPart}</Text>
          </View>
          <View style={{marginTop: 24, width: '100%'}}>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                position: 'relative',
              }}>
              <View
                style={{position: 'absolute', zIndex: 1, left: 38, top: 10}}>
                <SVG.UserIcon />
              </View>
              <TextInput
                style={styles.textInput}
                onChangeText={setUsername}
                placeholder="Username"
              />
            </View>
            <View
              style={{
                marginTop: 16,
                width: '100%',
                alignItems: 'center',
                position: 'relative',
              }}>
              <View
                style={{position: 'absolute', zIndex: 1, left: 38, top: 10}}>
                <SVG.PasswordIcon />
              </View>
              <TextInput
                style={styles.textInput}
                onChangeText={setPassword}
                placeholder="Password"
              />
            </View>
            <View style={{marginTop: 42, alignItems: 'center'}}>
              <TouchableHighlight
                underlayColor={'none'}
                onPress={() => {
                  handleLogin();
                }}
                style={{
                  backgroundColor: '#EDEFF0',
                  width: '90%',
                  borderRadius: 16,
                  padding: 10,
                }}>
                <Text
                  style={{
                    fontFamily: fontStyles.semibold,
                    color: '#3DA1FF',
                    fontSize: 18,
                    textAlign: 'center',
                  }}>
                  SIGN IN
                </Text>
              </TouchableHighlight>
            </View>
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: keyboardIsVisible ? -100 : 30,
            }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontFamily: fontStyles.regular,
              }}>
              Copyright @ 2022 by Yimlamai Bizz Co. Ltd{'\n'}All right reserved
            </Text>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default LoginScreen;
