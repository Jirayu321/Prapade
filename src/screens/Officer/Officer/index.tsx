import React, {FC, useState,useEffect} from 'react';
import fontStyles from '../../../core/styles/fonts';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Button,
  ButtonText,
  Box,
  Input,
  InputField,
  Pressable,
} from '@gluestack-ui/themed';
import {
  // Alert,
  Linking,
  Platform,
  TouchableHighlight,
  PermissionsAndroid,
} from 'react-native';

import SVG from '../../../constants/svgs';
import Footer from '../../../components/footer';
import CalendarComponent from '../../../components/actionsheets/datepicker';
import moment from 'moment';
import Header from '../../../components/header';
import {useOfficerDetail, userChangePassword} from '../../../query/user';
import {useQueryReportCollectUser} from '../../../query/report';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import {} from 'react-native';
// import {getCurrentLocation} from '../../../helpers/geolocation';

// @ts-ignore
import DialogAndroid from 'react-native-dialogs';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';
import Toast from 'react-native-toast-message';
import {useRoute, useFocusEffect} from '@react-navigation/native';


const OfficerScreen: FC = () => {
  const route = useRoute();
  const officerDetail = useOfficerDetail();
  const changePassword = userChangePassword();
  const [isChangingPassword, setChangingPassword] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [currentSelectDate, setCurrentSelectDate] = useState({
    key: `${moment().format('YYYY')}-${moment().format('MM')}-${moment().format(
      'DD',
    )}`,
    text: `${moment().format('DD')}/${moment().format('MM')}/${
      Number(moment().format('YYYY')) + 543
    }`,
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentPrinter, setCurrentPrinter] = useState({});
  const [mode, setMode] = useState("officer");

  useFocusEffect(
    React.useCallback(() => {
      setChangingPassword(false);
      setCalendarOpen(false);
      setNewPassword('');
      setConfirmNewPassword('');
      useReportCollectUser.refetch();
      return () => {};
    }, [route.name,useReportCollectUser]),
  );

  const useReportCollectUser = useQueryReportCollectUser(
    currentSelectDate.text,
  );


  useEffect(() => {
    useReportCollectUser.refetch();
  }, [currentSelectDate.text, useReportCollectUser]);

  const handleCalendarCloseCallback = () => {
    setCalendarOpen(false);
  };

  const handleCalendarCallback = (data: string) => {
    const dateKey = `${moment(new Date(data)).format('YYYY')}-${moment(
      new Date(data),
    ).format('MM')}-${moment(new Date(data)).format('DD')}`;
    const dateText = `${moment(data).format('DD')}/${moment(data).format(
      'MM',
    )}/${Number(moment(data).format('YYYY')) + 543}`;
    setCurrentSelectDate({
      key: dateKey,
      text: dateText,
    });
  };

  const handleOpenReport = async () => {
    Linking.canOpenURL(
      `https://prapade.com/prapa/api/reportcollectbyuserpdf.php?userID=${officerDetail.data[0].userID}`,
    ).then(supported => {
      if (supported) {
        Linking.openURL(
          `https://prapade.com/prapa/api/reportcollectbyuserpdf.php?userID=${officerDetail.data[0].userID}`,
        );
      }
    });
  };

  const handleChangeNewPassword = (text: string) => {
    setNewPassword(text);
  };

  const handleChangeConfirmNewPassword = (text: string) => {
    setConfirmNewPassword(text);
  };

  const handleCloseChangingPassword = () => {
    setChangingPassword(false);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const submitChangePassword = async () => {
    if (newPassword === '' || confirmNewPassword === '') {
      return;
    }

    if (newPassword !== confirmNewPassword) {
      return Toast.show({
        type: 'error',
        text1: 'เกิดข้อผิดพลาด',
        text2: 'รหัสทั้งสองช่องไม่ตรงกัน',
      });
    }

    const status = await changePassword.mutateAsync(newPassword);
    if (status === 'SUCCESS') {
      handleCloseChangingPassword();
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 31) {
          // สำหรับ Android 12+ (API Level 31+)
          const bluetoothScan = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
              title: 'Permission Required',
              message: 'This app needs Bluetooth scan permission.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          const bluetoothConnect = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
              title: 'Permission Required',
              message: 'This app needs Bluetooth connect permission.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          const location = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Permission Required',
              message:
                'This app needs location access to scan for Bluetooth devices.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (
            bluetoothScan === PermissionsAndroid.RESULTS.GRANTED &&
            bluetoothConnect === PermissionsAndroid.RESULTS.GRANTED &&
            location === PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.log('All required permissions granted.');
            return true;
          }
        } else {
          // สำหรับ Android 10-11 (API Level 29-30)
          const location = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Permission Required',
              message:
                'This app needs location access to scan for Bluetooth devices.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (location === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission granted.');
            return true;
          }
        }
        console.warn('Permission denied.');
        return false;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true; // สำหรับ iOS หรือแพลตฟอร์มอื่น
  };

  const handleRequestConnectPrinter = async () => {
    const hasLocationPermission = await requestLocationPermission();

    if (hasLocationPermission) {
      try {
        // เริ่มต้น Bluetooth Printer
        await BLEPrinter.init();

        // ดึงรายการอุปกรณ์ Bluetooth ที่สามารถเชื่อมต่อได้
        const devices = await BLEPrinter.getDeviceList();

        if (devices.length > 0) {
          const printers = devices.map(item => ({
            label: item.device_name,
            id: item.inner_mac_address,
          }));

          // แสดง Dialog ให้เลือกเครื่องพิมพ์
          const {selectedItem} = await DialogAndroid.showPicker(
            'เลือกเครื่องพิมพ์',
            null,
            {
              positiveText: 'ปิด',
              items: printers,
            },
          );

          if (selectedItem) {
            // เชื่อมต่อกับเครื่องพิมพ์
            const printer = await BLEPrinter.connectPrinter(selectedItem.id);
            setCurrentPrinter(printer);
            Toast.show({
              type: 'success',
              text1: 'เชื่อมต่อสำเร็จ',
              text2: 'เชื่อมต่อเครื่องพิมพ์เรียบร้อยแล้ว',
            });
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'ไม่พบเครื่องพิมพ์',
            text2: 'ไม่มีเครื่องพิมพ์ Bluetooth ที่พบ.',
          });
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'ข้อผิดพลาด',
          text2: error.message,
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'ต้องการสิทธิ์',
        text2: 'กรุณาอนุญาตการเข้าถึงตำแหน่งเพื่อค้นหาเครื่องพิมพ์ Bluetooth.',
      });
    }
  };

  return (
    <>
    <CalendarComponent
        isOpen={calendarOpen}
        type="full"
        showTitle={true}
        title={'เลือกวันที่'}
        dateInit={currentSelectDate.key}
        closeCallback={handleCalendarCloseCallback}
        callback={handleCalendarCallback}
      />
      <SafeAreaView flex={1} backgroundColor="#3DA1FF">
        <Header title={'เจ้าหน้าที่'} />
        <ScrollView>
          <View
            width={'100%'}
            height={'100%'}
            paddingBottom={14}
            alignItems="center">
            <View
              backgroundColor="#99CDFF"
              marginTop={16}
              padding={14}
              borderRadius={16}
              width={'90%'}>
              <View
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
                gap={20}>
                <SVG.UserProfile_Icon />
                {officerDetail.data && (
                  <View>
                    <Text
                      fontFamily={fontStyles.medium}
                      color="white"
                      fontSize={14}
                      marginVertical={2}>
                      {officerDetail.data[0].userName}
                    </Text>
                    <Text
                      fontFamily={fontStyles.medium}
                      color="white"
                      fontSize={14}
                      marginVertical={2}>
                      ระดับเจ้าหน้าที่ : {officerDetail.data[0].userID}
                    </Text>
                    <Text
                      fontFamily={fontStyles.medium}
                      color="white"
                      fontSize={14}
                      marginVertical={2}>
                      ตำแหน่ง : {officerDetail.data[0].userGroup}
                    </Text>
                  </View>
                )}
              </View>
              <View marginTop={10} alignItems="center">
                <Button
                  onPress={() => {
                    setChangingPassword(true);
                  }}
                  size="sm"
                  borderRadius={8}
                  width={'50%'}
                  borderWidth={1}
                  borderColor="white">
                  <ButtonText fontFamily={fontStyles.medium} fontSize={12}>
                    เปลี่ยนรหัสผ่าน
                  </ButtonText>
                </Button>
              </View>
            </View>
            <View
              backgroundColor="#99CDFF"
              marginTop={16}
              padding={14}
              borderRadius={16}
              width={'90%'}
              alignItems="center">
              <View>
                <Text
                  fontFamily={fontStyles.semibold}
                  color="#065B94"
                  fontSize={17}>
                  รายงานการเก็บเงิน
                </Text>
              </View>
              <View marginTop={8}>
                <TouchableHighlight
                  style={{width: '100%'}}
                  underlayColor={'none'}
                  onPress={() => {
                    setCalendarOpen(true);
                  }}>
                  <View
                    width={'50%'}
                    backgroundColor="white"
                    borderRadius={4}
                    paddingVertical={2}
                    paddingHorizontal={6}
                    borderWidth={1}
                    borderColor="rgba(0,0,0,0.4)">
                    <View
                      width={'100%'}
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                      gap={10}>
                      <View
                        borderRightWidth={1}
                        borderColor="rgba(0,0,0,0.4)"
                        width={'20%'}
                        height={'100%'}
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center">
                        <SVG.Calendar_Icon />
                      </View>
                      <View width={'80%'}>
                        <Text
                          textAlign="center"
                          fontFamily={fontStyles.medium}
                          color="#5C656E"
                          fontSize={14}>
                          {currentSelectDate.text}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableHighlight>
              </View>
              <View marginTop={16} width={'100%'} alignItems="center">
                <View
                  backgroundColor="white"
                  width={'95%'}
                  paddingHorizontal={4}
                  paddingVertical={10}
                  borderRadius={8}>
                  <View width={'100%'}>
                    {useReportCollectUser.data && (
                      <>
                        <View
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                          paddingHorizontal={8}
                          marginVertical={5}>
                          <View>
                            <Text
                              color="#087FCF"
                              fontFamily={fontStyles.regular}>
                              ข้อมูลเวลาล่าสุด
                            </Text>
                          </View>
                          <View>
                            <Text
                              color="#087FCF"
                              fontFamily={fontStyles.regular}>
                              {useReportCollectUser.data?.lastTime}
                            </Text>
                          </View>
                        </View>
                        <View
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                          paddingHorizontal={8}
                          marginVertical={5}>
                          <View>
                            <Text
                              color="#087FCF"
                              fontFamily={fontStyles.regular}>
                              เก็บค่าน้ำได้
                            </Text>
                          </View>
                          <View>
                            <Text
                              color="#087FCF"
                              fontFamily={fontStyles.regular}>
                              {useReportCollectUser.data?.collectedNum} ราย
                            </Text>
                          </View>
                        </View>
                        <View
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                          paddingHorizontal={8}
                          marginVertical={5}>
                          <View>
                            <Text
                              color="#087FCF"
                              fontFamily={fontStyles.regular}>
                              เงินสด
                            </Text>
                          </View>
                          <View>
                            <Text
                              color="#087FCF"
                              fontFamily={fontStyles.regular}>
                              {useReportCollectUser.data?.spareCollectedCash}{' '}
                              บาท
                            </Text>
                          </View>
                        </View>
                        <View
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                          paddingHorizontal={8}
                          marginVertical={5}>
                          <View>
                            <Text
                              color="#087FCF"
                              fontFamily={fontStyles.regular}>
                              โอนชำระ
                            </Text>
                          </View>
                          <View>
                            <Text
                              color="#087FCF"
                              fontFamily={fontStyles.regular}>
                              {useReportCollectUser.data?.collectedTransfer} บาท
                            </Text>
                          </View>
                        </View>
                        <View
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                          paddingHorizontal={8}
                          marginVertical={5}>
                          <View>
                            <Text
                              color="#087FCF"
                              fontFamily={fontStyles.regular}>
                              รวมเป็นเงิน
                            </Text>
                          </View>
                          <View>
                            <Text
                              color="#087FCF"
                              fontFamily={fontStyles.regular}>
                              {useReportCollectUser.data?.totalPaid} บาท
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                  <View width={'100%'} marginVertical={10} alignItems="center">
                    <Box width={'95%'} backgroundColor="#1F9FF6" height={2} />
                  </View>
                  <View width={'100%'}>
                    <View
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      paddingHorizontal={8}
                      marginVertical={5}>
                      <View>
                        <Text color="#087FCF" fontFamily={fontStyles.regular}>
                          จดมิเตอร์ได้
                        </Text>
                      </View>
                      <View>
                        <Text color="#087FCF" fontFamily={fontStyles.regular}>
                          {useReportCollectUser.data?.countCollected} ราย
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View marginTop={18} width={'100%'} alignItems="center">
                <Button
                  borderRadius={20}
                  size="md"
                  width={'95%'}
                  backgroundColor="#0279FD">
                  <ButtonText fontFamily={fontStyles.semibold}>
                    ปิดวันสรุปยอด
                  </ButtonText>
                </Button>
                <Button
                  onPress={() => handleOpenReport()}
                  borderRadius={20}
                  backgroundColor="#0279FD"
                  size="md"
                  width={'95%'}
                  marginTop={10}>
                  <ButtonText fontFamily={fontStyles.semibold}>
                    รายงานจัดเก็บเงิน ป.32
                  </ButtonText>
                </Button>
                <Button
                  onPress={() => handleRequestConnectPrinter()}
                  borderRadius={20}
                  backgroundColor={
                    Object.keys(currentPrinter).length > 0
                      ? '#00AFB9'
                      : '#FF4444'
                  }
                  size="md"
                  width={'95%'}
                  marginTop={22}>
                  <ButtonText fontSize={12} fontFamily={fontStyles.semibold}>
                    {(Object.keys(currentPrinter).length > 0 && (
                      <>เชื่อมต่อเครื่องพิมพ์แล้ว</>
                    )) || <>ไม่ได้เชื่อมต่อเครื่องพิมพ์</>}
                  </ButtonText>
                </Button>
              </View>
            </View>
            <Footer />
          </View>
        </ScrollView>
        {isChangingPassword && (
          <View
            position="absolute"
            width={'$full'}
            height={'$full'}
            top={0}
            left={0}
            backgroundColor="rgba(0,0,0, 0.7)"
            justifyContent="center"
            alignItems="center"
            padding={4}>
            <View
              backgroundColor="white"
              paddingVertical={24}
              paddingHorizontal={15}
              width={'90%'}
              borderRadius={10}>
              <View
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center">
                <Text fontFamily={fontStyles.semibold}>เปลี่ยนรหัสผ่าน</Text>
                <Pressable
                  padding={5}
                  onPress={() => {
                    handleCloseChangingPassword();
                  }}>
                  <FontAwesomeIcon icon={faXmark} color="red" size={20} />
                </Pressable>
              </View>
              <View marginTop={18}>
                <Input
                  backgroundColor="white"
                  variant="rounded"
                  borderWidth={2}
                  borderColor="#D6EBFF"
                  size="md">
                  <InputField
                    onChangeText={handleChangeNewPassword}
                    fontFamily={fontStyles.regular}
                    fontSize={14}
                    placeholder="รหัสผ่านใหม่"
                    placeholderTextColor="#D4D8DB"
                    padding={4}
                  />
                </Input>
                <Input
                  backgroundColor="white"
                  marginTop={10}
                  variant="rounded"
                  borderWidth={2}
                  borderColor="#D6EBFF"
                  size="md">
                  <InputField
                    onChangeText={handleChangeConfirmNewPassword}
                    fontFamily={fontStyles.regular}
                    fontSize={14}
                    placeholder="ยืนยันรหัสผ่านใหม่"
                    placeholderTextColor="#D4D8DB"
                    padding={4}
                  />
                </Input>
                <View marginTop={16}>
                  <Button onPress={submitChangePassword} borderRadius={20}>
                    <ButtonText>ยืนยัน</ButtonText>
                  </Button>
                </View>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default OfficerScreen;
