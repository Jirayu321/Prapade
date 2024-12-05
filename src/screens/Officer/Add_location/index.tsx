/* eslint-disable react-native/no-inline-styles */
import React, {FC, useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Button,
  ButtonText,
  Input,
  InputField,
  Pressable,
} from '@gluestack-ui/themed';
import fontStyles from '../../../core/styles/fonts';
import {useNavigation} from '@react-navigation/native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {useIsFocused} from '@react-navigation/native';
import {
  reqLocationPermission,
  // getCurrentLocation,
  watchLocation,
} from '../../../helpers/geolocation';
import Geolocation from 'react-native-geolocation-service';
import Footer from '../../../components/footer';
import Header from '../../../components/header';
import {useGetLocation} from '../../../query/location';
import DialogAndroid from 'react-native-dialogs';
import {useRoute} from '@react-navigation/native';
import {Image, Platform} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {launchImageLibrary} from 'react-native-image-picker';
import {PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import appConfig from '../../../assets/app.json';

const AddLocationScreen: FC = () => {
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const isFocused = useIsFocused();
  const [getUserCurrentLocation, setUserCurrentLocation]: any = useState({});
  const [getNewCurrentLocation, setNewCurrentLocation]: any = useState({});
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [getMemberSearch, setMemberSearch] = useState('');
  const findLocation = useGetLocation(getMemberSearch);
  const [getMemberLocationDetail, setMemberLocationDetail]: any =
    useState(undefined);

  let watchId = -1;

  const [getImage1, setImage1]: any = useState(undefined);
  const [getImage2, setImage2]: any = useState(undefined);
  const [getViewImage, setViewImage] = useState(0);
  const [getNewLocation, setNewLocation] = useState(false);
  const [getImage1Data, setImage1Data]: any = useState({});
  const [getImage2Data, setImage2Data]: any = useState({});
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  const getPosition = async () => {
    const reqPermission = await reqLocationPermission();
    if (reqPermission) {
      if (watchId !== -1) {
        Geolocation.clearWatch(watchId);
      }
      watchId = Geolocation.watchPosition(
        position => {
          console.log(position);
        },
        error => {
          console.error(error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 5000, // Fetch every 5 seconds
          fastestInterval: 2000, // Fastest updates every 2 seconds
        },
      );
    } else {
      console.error('Location permission denied');
    }
  };

  const handleSearchMember = (text: string) => {
    setMemberSearch(text);
  };

  useEffect(() => {
    if (isFocused) {
      getPosition();
      if (route.params !== undefined) {
        if (
          route.params.file !== undefined &&
          route.params.item !== undefined
        ) {
          if (route.params.item === 1) {
            setImage1(route.params.file.uri);
            setImage1Data(route.params.file);
          } else if (route.params.item === 2) {
            setImage2(route.params.file.uri);
            setImage2Data(route.params.file);
          }
        }
      }
    }

    if (findLocation?.data && getMemberSearch !== '') {
      setMemberLocationDetail(findLocation?.data[0]);

      if (findLocation?.data[0] === undefined) {
        setMemberLocationDetail([]);
      }

      if (
        findLocation?.data[0]?.meterGPS !== undefined &&
        findLocation?.data[0]?.meterGPS !== ''
      ) {
        const coordinatesString = findLocation?.data[0]?.meterGPS.substring(1);
        const [latitude, longitude] = coordinatesString.split(',');
        setUserCurrentLocation({
          latitude: Number(latitude),
          longitude: Number(longitude),
        });
        setNewLocation(false);
      } else {
        setNewLocation(true);
      }
    }

    return () => {
      if (watchId != -1) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [isFocused, findLocation.data, route.params]);

  const handleActionImageType = (imageSection: number) => {
    handleSelectAddImageType(imageSection);
  };

  const handleSelectAddImageType = async (imageSection: number) => {
    let isEmpty = true;
    if (imageSection === 1) {
      if (getImage1 !== undefined) {
        isEmpty = false;
      }
    } else if (imageSection === 2) {
      if (getImage2 !== undefined) {
        isEmpty = false;
      }
    }

    if (isEmpty) {
      handleSelectTypeImage(imageSection);
    } else {
      const {selectedItem} = await DialogAndroid.showPicker('ตัวเลือก', null, {
        positiveText: 'ปิด',
        items: [
          {label: 'ดูรูปภาพขนาดเต็ม', id: 'view_image'},
          {label: 'เลือก/ถ่าย ภาพใหม่', id: 'new_image'},
        ],
      });

      if (selectedItem) {
        if (selectedItem.id === 'new_image') {
          handleSelectTypeImage(imageSection);
        } else if (selectedItem.id === 'view_image') {
          setViewImage(imageSection);
        }
      }
    }
  };

  const handleSelectTypeImage = async (imageSection: number) => {
    const {selectedItem} = await DialogAndroid.showPicker(
      'เลือกรูปแบบการเพิ่มรูป',
      null,
      {
        positiveText: 'ปิด',
        items: [
          {label: 'กล้องถ่ายรูป', id: 'camera'},
          {label: 'เลือกจากคลังภาพ', id: 'image'},
        ],
      },
    );

    if (selectedItem) {
      if (selectedItem.id === 'camera') {
        navigation.navigate('FindLocationScreenTab', {
          screen: 'CameraLocation',
          params: {item: imageSection},
        });
      } else if (selectedItem?.id === 'image') {
        handleSelectImageFromLibrary(imageSection);
      }
    }
  };

  const handleSelectImageFromLibrary = async (imageSection: number) => {
    const status = await requestLibraryPermission();
    if (!status) {
      return Toast.show({
        type: 'error',
        text1: 'เกิดข้อผิดพลาด',
        text2: 'ไม่สามารถเข้าถึงคลังรูปภาพของคุณได้',
      });
    }

    const options: any = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: false,
      maxFiles: 1,
    };

    launchImageLibrary(options, async (response: any) => {
      if (response.error) {
        return Toast.show({
          type: 'error',
          text1: 'เกิดข้อผิดพลาด',
          text2: 'ไม่สามารถเลือกรูปภาพได้, ลองใหม่อีกครั้ง',
        });
      } else {
        const imageUri = response.assets[0].uri;
        const fileName = response.assets[0].fileName;
        const fileType = response.assets[0].type;

        try {
          if (imageSection === 1) {
            setImage1(imageUri);
            setImage1Data({
              uri: imageUri,
              name: fileName,
              type: fileType,
            });
          } else if (imageSection === 2) {
            setImage2(imageUri);
            setImage2Data({
              uri: imageUri,
              name: fileName,
              type: fileType,
            });
          }
        } catch (error) {
          console.error('Error reading image file:', error);
        }
      }
    });
  };

  const requestLibraryPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);

        if (result !== RESULTS.GRANTED) {
          return false;
        }
        return true;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const sendUpdateLocation = async (formData: any) => {
    await axios
      .post(`${appConfig.apiUrl}/insertmapmember.php`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        if (Number(response.data.status) === 1) {
          Toast.show({
            type: 'success',
            text1: 'สำเร็จ',
            text2: response.data.message,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'เกิดข้อผิดพลาด',
            text2: response.data.message,
          });
        }
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: 'เกิดข้อผิดพลาด',
          text2: 'ไม่สามารถดำเนินการได้ในขณะนี้',
        });
      });

    setIsLoading1(false);
    setIsLoading2(false);
  };

  const handleSubmit = async () => {
    const userId = await AsyncStorage.getItem('userId');
    Toast.show({
      type: 'info',
      text1: 'กำลังอัปเดตข้อมูล',
    });
    if (getImage1 !== undefined) {
      setIsLoading1(true);
      const formData = new FormData();
      formData.append('userID', Number(userId));
      formData.append('memberID', Number(getMemberSearch));
      formData.append('picOrder', 1);
      formData.append(
        'meterGPS',
        !getNewLocation
          ? `@${getUserCurrentLocation.latitude},${getUserCurrentLocation.longitude},17z`
          : `@${getNewCurrentLocation.latitude},${getNewCurrentLocation.longitude},17z`,
      );
      formData.append('photos_upload', getImage1Data);
      await sendUpdateLocation(formData);
    }

    if (getImage2 !== undefined) {
      const formData = new FormData();
      formData.append('userID', Number(userId));
      formData.append('memberID', Number(getMemberSearch));
      formData.append('picOrder', 2);
      formData.append(
        'meterGPS',
        !getNewLocation
          ? `@${getUserCurrentLocation.latitude},${getUserCurrentLocation.longitude},17z`
          : `@${getNewCurrentLocation.latitude},${getNewCurrentLocation.longitude},17z`,
      );
      formData.append('photos_upload', getImage2Data);
      await sendUpdateLocation(formData);
    }
  };

  return (
    <>
      <SafeAreaView flex={1} backgroundColor="#3DA1FF">
        <Header title={'เพิ่มจุดใหม่'} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View
            width={'100%'}
            height={'100%'}
            paddingBottom={14}
            alignItems="center"
            marginTop={16}>
            <View width={'90%'}>
              <View
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                gap={20}>
                <Button
                  onPress={() => {
                    navigation.navigate('FindLocationScreenTab', {
                      screen: 'FindLocation',
                    });
                  }}
                  backgroundColor="white"
                  borderRadius={8}
                  width={'40%'}>
                  <ButtonText
                    color="#065B94"
                    fontSize={14}
                    fontFamily={fontStyles.semibold}>
                    ค้นหาตำแหน่ง
                  </ButtonText>
                </Button>
                <Button
                  backgroundColor="#065B94"
                  borderRadius={8}
                  width={'40%'}>
                  <ButtonText
                    color="white"
                    fontSize={14}
                    fontFamily={fontStyles.semibold}>
                    เพิ่มจุดใหม่
                  </ButtonText>
                </Button>
              </View>
              <View marginTop={18}>
                <Text fontFamily={fontStyles.semibold} color="white">
                  ค้นหาหมายเลขมิเตอร์
                </Text>
                <View marginTop={10}>
                  <Input
                    backgroundColor="white"
                    variant="rounded"
                    borderWidth={2}
                    borderColor="#D6EBFF"
                    size="md">
                    <InputField
                      onChangeText={handleSearchMember}
                      fontFamily={fontStyles.regular}
                      fontSize={14}
                      keyboardType="numeric"
                      placeholder="เลขประจำมิเตอร์"
                      placeholderTextColor="#D4D8DB"
                      padding={4}
                    />
                  </Input>
                </View>
              </View>
              {getMemberLocationDetail !== undefined && (
                <>
                  <View
                    marginTop={20}
                    backgroundColor="#B7DCFF"
                    padding={14}
                    borderRadius={16}>
                    <Text color="#065B94" fontFamily={fontStyles.semibold}>
                      ชื่อสมาชิก
                    </Text>
                    <View marginTop={10} alignItems="center">
                      <Input
                        backgroundColor="white"
                        height={45}
                        width={'100%'}
                        borderRadius={16}>
                        <InputField
                          editable={
                            getMemberLocationDetail?.memberName ? false : true
                          }
                          defaultValue={getMemberLocationDetail?.memberName}
                          placeholder="ระบุชื่อสมาชิก"
                          padding={10}
                          textAlignVertical="top"
                          placeholderTextColor={'#D4D8DB'}
                          fontFamily={fontStyles.regular}
                          numberOfLines={1}
                        />
                      </Input>
                    </View>
                  </View>
                  <View
                    marginTop={20}
                    backgroundColor="#B7DCFF"
                    padding={14}
                    borderRadius={16}>
                    <Text color="#065B94" fontFamily={fontStyles.semibold}>
                      เบอร์โทรศัพท์สมาชิก
                    </Text>
                    <View marginTop={10} alignItems="center">
                      <Input
                        backgroundColor="white"
                        height={45}
                        width={'100%'}
                        borderRadius={16}>
                        <InputField
                          editable={
                            getMemberLocationDetail?.memberTel ? false : true
                          }
                          placeholder="ระบุเบอร์โทรศัพท์สมาชิก"
                          defaultValue={getMemberLocationDetail?.memberTel}
                          padding={10}
                          textAlignVertical="top"
                          placeholderTextColor={'#D4D8DB'}
                          fontFamily={fontStyles.regular}
                          keyboardType="phone-pad"
                          numberOfLines={1}
                        />
                      </Input>
                    </View>
                  </View>
                  <View
                    marginTop={20}
                    backgroundColor="#B7DCFF"
                    padding={14}
                    borderRadius={16}>
                    <Text color="#065B94" fontFamily={fontStyles.semibold}>
                      ที่อยู่
                    </Text>
                    <View marginTop={10} alignItems="center">
                      <Input
                        backgroundColor="white"
                        height={120}
                        width={'100%'}
                        borderRadius={16}>
                        <InputField
                          placeholder="ระบุที่อยู่"
                          editable={
                            getMemberLocationDetail?.memberAddress
                              ? false
                              : true
                          }
                          defaultValue={getMemberLocationDetail?.memberAddress}
                          padding={10}
                          textAlignVertical="top"
                          placeholderTextColor={'#D4D8DB'}
                          fontFamily={fontStyles.regular}
                          numberOfLines={4}
                          multiline
                        />
                      </Input>
                    </View>
                  </View>
                  <View marginTop={20}>
                    <Text color="white" fontFamily={fontStyles.semibold}>
                      เพิ่มรายละเอียดมิเตอร์สมาชิก
                    </Text>
                    <View
                      marginTop={15}
                      backgroundColor="#B7DCFF"
                      padding={16}
                      borderRadius={16}>
                      <Text color="#065B94" fontFamily={fontStyles.semibold}>
                        พิกัดตำแหน่ง GPS
                      </Text>
                      <View
                        width={'100%'}
                        height={200}
                        marginTop={10}
                        overflow="hidden"
                        borderRadius={16}>
                        <MapView
                          mapType={'standard'}
                          provider={PROVIDER_GOOGLE}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: -1,
                          }}
                          loadingEnabled={true}
                          rotateEnabled={true}
                          showsMyLocationButton={!getNewLocation ? false : true}
                          showsUserLocation={!getNewLocation ? false : true}
                          region={{
                            latitude: currentLocation?.latitude || 0,
                            longitude: currentLocation?.longitude || 0,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          }}
                          customMapStyle={[
                            {
                              featureType: 'administrative.land_parcel',
                              elementType: 'labels',
                              stylers: [
                                {
                                  visibility: 'off',
                                },
                              ],
                            },
                            {
                              featureType: 'poi.business',
                              stylers: [
                                {
                                  visibility: 'off',
                                },
                              ],
                            },
                            {
                              featureType: 'poi.park',
                              elementType: 'labels.text',
                              stylers: [
                                {
                                  visibility: 'off',
                                },
                              ],
                            },
                            {
                              featureType: 'road.arterial',
                              elementType: 'labels',
                              stylers: [
                                {
                                  visibility: 'off',
                                },
                              ],
                            },
                            {
                              featureType: 'road.highway',
                              elementType: 'labels',
                              stylers: [
                                {
                                  visibility: 'off',
                                },
                              ],
                            },
                            {
                              featureType: 'road.local',
                              stylers: [
                                {
                                  visibility: 'off',
                                },
                              ],
                            },
                            {
                              featureType: 'road.local',
                              elementType: 'labels',
                              stylers: [
                                {
                                  visibility: 'off',
                                },
                              ],
                            },
                          ]}
                          onPress={e => {
                            const {latitude, longitude} =
                              e.nativeEvent.coordinate;
                            setUserCurrentLocation({latitude, longitude});
                            Toast.show({
                              type: 'success',
                              text1: 'ตำแหน่งใหม่ถูกตั้งค่า',
                              text2: `ละติจูด: ${latitude}, ลองจิจูด: ${longitude}`,
                            });
                          }}>
                          {!getNewLocation && (
                            <Marker
                              coordinate={{
                                latitude: getUserCurrentLocation.latitude || 0,
                                longitude:
                                  getUserCurrentLocation.longitude || 0,
                              }}
                              title={
                                getMemberLocationDetail?.memberAddress ||
                                'Unknown Address'
                              }
                            />
                          )}
                        </MapView>
                      </View>

                      <View
                        marginTop={10}
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="flex-start">
                        <View width={'50%'}>
                          <Text color="#5C656E" fontFamily={fontStyles.medium}>
                            Latitude
                          </Text>

                            <>
                              {getUserCurrentLocation !== undefined && (
                                <Text
                                  color="#087FCF"
                                  fontFamily={fontStyles.medium}
                                  marginTop={10}>
                                  {getUserCurrentLocation?.latitude}
                                </Text>
                              )}
                            </>

                            <>
                              {getNewCurrentLocation !== undefined && (
                                <Text
                                  color="#087FCF"
                                  fontFamily={fontStyles.medium}
                                  marginTop={10}>
                                  {getNewCurrentLocation?.latitude}
                                </Text>
                              )}
                            </>

                        </View>
                        <View width={'50%'}>
                          <Text color="#5C656E" fontFamily={fontStyles.medium}>
                            Longitude
                          </Text>

                          <>
                            {getUserCurrentLocation !== undefined && (
                              <Text
                                color="#087FCF"
                                fontFamily={fontStyles.medium}
                                marginTop={10}>
                                {getUserCurrentLocation?.longitude}
                              </Text>
                            )}
                          </>

                          <>
                            {getNewCurrentLocation !== undefined && (
                              <Text
                                color="#087FCF"
                                fontFamily={fontStyles.medium}
                                marginTop={10}>
                                {getNewCurrentLocation?.longitude}
                              </Text>
                            )}
                          </>
                        </View>
                      </View>

                      {/* {!getNewLocation && ( */}
                      {/* <View marginTop={10}>
                          <Button onPress={() => setNewLocation(true)}>
                            <ButtonText>หาตำแหน่งใหม่</ButtonText>
                          </Button>
                        </View> */}
                      {/* )} */}
                      <View marginTop={20}>
                        <Text color="#065B94" fontFamily={fontStyles.semibold}>
                          เพิ่มรูปภาพประกอบ *
                        </Text>
                        <View
                          backgroundColor="#B7DCFF"
                          padding={15}
                          marginTop={10}
                          borderRadius={16}
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                          gap={20}>
                          <Pressable
                            onPress={() => handleActionImageType(1)}
                            backgroundColor="white"
                            width={'50%'}
                            height={120}
                            borderRadius={8}
                            flexDirection="row"
                            justifyContent="center"
                            alignItems="center"
                            overflow="hidden">
                            {(getImage1 !== undefined && (
                              <>
                                <Image
                                  source={{uri: getImage1}}
                                  style={{width: '100%', height: '100%'}}
                                  resizeMode="cover"
                                />
                              </>
                            )) || <Text fontSize={28}>+</Text>}
                          </Pressable>

                          <Pressable
                            onPress={() => handleActionImageType(2)}
                            backgroundColor="white"
                            width={'50%'}
                            height={120}
                            borderRadius={8}
                            flexDirection="row"
                            justifyContent="center"
                            alignItems="center"
                            overflow="hidden">
                            {(getImage2 !== undefined && (
                              <>
                                <Image
                                  source={{uri: getImage2}}
                                  style={{width: '100%', height: '100%'}}
                                  resizeMode="cover"
                                />
                              </>
                            )) || <Text fontSize={28}>+</Text>}
                          </Pressable>
                        </View>
                        <Text
                          marginTop={10}
                          color="red"
                          textAlign="center"
                          fontFamily={fontStyles.medium}>
                          *แนบรูปภาพอย่างน้อย 2 รูป
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Button
                        onPress={handleSubmit}
                        disabled={isLoading1 || isLoading2}
                        borderRadius={20}
                        marginTop={25}
                        size="md"
                        width={'100%'}
                        backgroundColor="#054977">
                        <ButtonText fontFamily={fontStyles.semibold}>
                          ยืนยันบันทึกข้อมูล
                        </ButtonText>
                      </Button>
                    </View>
                  </View>
                </>
              )}
            </View>
            <Footer />
          </View>
        </ScrollView>
        {getViewImage !== 0 && (
          <View
            position="absolute"
            top={0}
            left={0}
            zIndex={5}
            width={'$full'}
            height={'$full'}
            backgroundColor="rgba(0,0,0,0.8)"
            justifyContent="center"
            alignItems="center"
            padding={4}>
            <Pressable
              onPress={() => {
                setViewImage(0);
              }}
              position="absolute"
              top={10}
              right={10}>
              <FontAwesomeIcon icon={faXmark} color="white" size={30} />
            </Pressable>
            <Image
              source={{uri: getViewImage === 1 ? getImage1 : getImage2}}
              style={{width: '90%', height: '90%'}}
              borderRadius={10}
              resizeMode="cover"
              alt="fullImage"
            />
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default AddLocationScreen;
