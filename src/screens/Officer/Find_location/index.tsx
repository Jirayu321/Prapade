/* eslint-disable react/self-closing-comp */
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
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Footer from '../../../components/footer';
import Header from '../../../components/header';
import {useGetLocation} from '../../../query/location';
import {Image} from 'react-native';
import appConfig from '../../../assets/app.json';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {
  useRoute,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

const FindLocationScreen: FC = () => {
  const route = useRoute();
  const navigation: any = useNavigation();
  const [getUserCurrentLocation, setUserCurrentLocation]: any = useState({});
  const [getMemberSearch, setMemberSearch] = useState('');
  const [getMemberLocationDetail, setMemberLocationDetail]: any = useState({});
  const [getViewImage, setViewImage]: any = useState(undefined);

  const findLocation = useGetLocation(getMemberSearch);
  const handleSearchMember = (text: string) => {
    setMemberSearch(text);
  };

  useEffect(() => {
    if (findLocation?.data) {
      setMemberLocationDetail(findLocation?.data[0]);

      const meterGPS = findLocation?.data[0]?.meterGPS;

      if (meterGPS && typeof meterGPS === 'string') {
        const coordinatesString = meterGPS.substring(1);
        const [latitude, longitude] = coordinatesString.split(',');

        setUserCurrentLocation({
          latitude: Number(latitude),
          longitude: Number(longitude),
        });
      } else {
        setUserCurrentLocation({});
      }
    }
  }, [findLocation.data]);
  useFocusEffect(
    React.useCallback(() => {
      setUserCurrentLocation({});
      setMemberSearch('');
      setMemberLocationDetail({});
      setViewImage(undefined);

      return () => {};
    }, [route.name]),
  );

  return (
    <SafeAreaView flex={1} backgroundColor="#3DA1FF">
      <Header title={'ค้นหาตำแหน่ง'} />
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
              <Button backgroundColor="#065B94" borderRadius={8} width={'40%'}>
                <ButtonText
                  color="white"
                  fontSize={14}
                  fontFamily={fontStyles.semibold}>
                  ค้นหาตำแหน่ง
                </ButtonText>
              </Button>
              <Button
                onPress={() => {
                  navigation.navigate('FindLocationScreenTab', {
                    screen: 'AddLocation',
                  });
                }}
                backgroundColor="white"
                borderRadius={8}
                width={'40%'}>
                <ButtonText
                  color="#065B94"
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
                    value={getMemberSearch}
                    onChangeText={handleSearchMember}
                    fontFamily={fontStyles.regular}
                    keyboardType="numeric"
                    fontSize={14}
                    placeholder="เลขประจำมิเตอร์"
                    placeholderTextColor="#D4D8DB"
                    padding={4}
                  />
                </Input>
              </View>
            </View>
          </View>
          {getMemberLocationDetail !== undefined &&
            Object.keys(getMemberLocationDetail)?.length > 0 && (
              <>
                {getUserCurrentLocation?.latitude &&
                getUserCurrentLocation?.longitude ? (
                  <View
                    marginTop={24}
                    padding={16}
                    backgroundColor="#B7DCFF"
                    width={'100%'}>
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
                          // position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: -1,
                        }}
                        loadingEnabled={true}
                        rotateEnabled={true}
                        showsMyLocationButton={false}
                        showsUserLocation={false}
                        region={{
                          latitude: getUserCurrentLocation?.latitude || 0,
                          longitude: getUserCurrentLocation?.longitude || 0,
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
                        ]}>
                        <Marker
                          coordinate={{
                            latitude: getUserCurrentLocation.latitude || 0,
                            longitude: getUserCurrentLocation.longitude || 0,
                          }}
                          title={
                            getMemberLocationDetail?.memberAddress ||
                            'Unknown Address'
                          }
                        />
                      </MapView>
                    </View>
                  </View>
                ) : (
                  <View
                    marginTop={24}
                    padding={16}
                    backgroundColor="#B7DCFF"
                    width={'100%'}>
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
                          // position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: -1,
                        }}
                        loadingEnabled={true}
                        rotateEnabled={true}
                        showsMyLocationButton={false}
                        showsUserLocation={false}
                        region={{
                          latitude: getUserCurrentLocation?.latitude || 0,
                          longitude: getUserCurrentLocation?.longitude || 0,
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
                        ]}>
                        <Marker
                          coordinate={{
                            latitude: getUserCurrentLocation.latitude || 0,
                            longitude: getUserCurrentLocation.longitude || 0,
                          }}
                          title={
                            getMemberLocationDetail?.memberAddress ||
                            'Unknown Address'
                          }
                        />
                      </MapView>
                    </View>
                  </View>
                )}

                <View width={'90%'} marginTop={20}>
                  <View
                    backgroundColor="#B7DCFF"
                    padding={15}
                    borderRadius={16}>
                    {getMemberLocationDetail !== undefined && (
                      <Text color="#087FCF" fontFamily={fontStyles.medium}>
                        {getMemberLocationDetail?.memberAddress}
                      </Text>
                    )}
                  </View>
                  <View marginTop={20}>
                    <Text fontFamily={fontStyles.semibold} color="white">
                      รูปภาพที่เกี่ยวข้องเพิ่มเติม
                    </Text>
                    <View marginTop={10}>
                      <View
                        backgroundColor="#B7DCFF"
                        padding={15}
                        marginTop={10}
                        borderRadius={16}
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                        gap={28}>
                        <Pressable
                          onPress={() => {
                            if (getMemberLocationDetail.pic1 !== null) {
                              setViewImage(
                                `${appConfig?.domainName}${getMemberLocationDetail?.pic1}`,
                              );
                            }
                          }}>
                          {(getMemberLocationDetail.pic1 === null && (
                            <View
                              backgroundColor="white"
                              width={120}
                              height={120}
                              borderRadius={10}
                              flex={1}
                              justifyContent="center"
                              alignItems="center">
                              <Text fontFamily={fontStyles.medium}>
                                ไม่มีข้อมูล
                              </Text>
                            </View>
                          )) || (
                            <Image
                              source={{
                                uri: `${appConfig?.domainName}${getMemberLocationDetail?.pic1}`,
                              }}
                              width={120}
                              height={120}
                              borderRadius={10}
                            />
                          )}
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            if (getMemberLocationDetail.pic2 !== null) {
                              setViewImage(
                                `${appConfig?.domainName}${getMemberLocationDetail?.pic2}`,
                              );
                            }
                          }}>
                          {(getMemberLocationDetail?.pic2 === null && (
                            <View
                              backgroundColor="white"
                              width={120}
                              height={120}
                              borderRadius={10}
                              flex={1}
                              justifyContent="center"
                              alignItems="center">
                              <Text fontFamily={fontStyles.medium}>
                                ไม่มีข้อมูล
                              </Text>
                            </View>
                          )) || (
                            <Image
                              source={{
                                uri: `${appConfig?.domainName}${getMemberLocationDetail?.pic2}`,
                              }}
                              width={120}
                              height={120}
                              borderRadius={10}
                            />
                          )}
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              </>
            )}

          <Footer />
        </View>
      </ScrollView>
      {getViewImage !== undefined && getViewImage !== '' && (
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
              setViewImage(undefined);
            }}
            position="absolute"
            top={10}
            right={10}>
            <FontAwesomeIcon icon={faXmark} color="white" size={30} />
          </Pressable>
          <Image
            source={{uri: getViewImage}}
            style={{width: '90%', height: '90%'}}
            borderRadius={10}
            resizeMode="cover"
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default FindLocationScreen;
