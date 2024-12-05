/* eslint-disable react-native/no-inline-styles */
import React, {FC, useEffect, useRef} from 'react';
import {
  useCameraPermission,
  useCameraDevice,
  Camera,
  useCameraFormat,
} from 'react-native-vision-camera';
import {
  SafeAreaView,
  View,
  // Text
} from '@gluestack-ui/themed';
import {StyleSheet, TouchableHighlight} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faAngleLeft} from '@fortawesome/free-solid-svg-icons';
import {useNavigation, useRoute} from '@react-navigation/native';

const CameraLocation: FC = () => {
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const camera: any = useRef<Camera>(null);

  const PermissionRequest = async () => {
    const permissionRequest = await requestPermission();
    if (permissionRequest) {
    } else {
    }
  };

  useEffect(() => {
    if (!hasPermission) {
      PermissionRequest();
    }
  }, []);

  const format = useCameraFormat(device, [
    {photoResolution: {width: 1280, height: 720}},
  ]);

  const handleTakePhoto = async () => {
    if (camera !== null) {
      const file = await camera.current.takePhoto();
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      const fileName = `image_${timestamp}.jpg`;
      const payload = {
        uri: `file://${file.path}`,
        name: fileName,
        type: 'image/jpeg',
      };
      navigation.navigate('FindLocationScreenTab', {
        screen: 'AddLocation',
        params: {file: payload, item: route.params.item},
      });
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      {device !== undefined && hasPermission && (
        <Camera
          ref={camera}
          photo={true}
          device={device}
          isActive={true}
          format={format}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View width={'$full'} padding={4} position="absolute" top={20} left={0}>
        <TouchableHighlight
          underlayColor={'none'}
          style={{
            width: '15%',
            paddingHorizontal: 4,
            paddingVertical: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            navigation.goBack();
          }}>
          <FontAwesomeIcon icon={faAngleLeft} color="white" size={25} />
        </TouchableHighlight>
      </View>
      <View
        width={'$full'}
        padding={4}
        position="absolute"
        bottom={10}
        left={0}
        justifyContent="center"
        alignItems="center">
        <TouchableHighlight
          underlayColor={'none'}
          style={{
            width: '15%',
            paddingHorizontal: 4,
            paddingVertical: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            handleTakePhoto();
          }}>
          <View
            borderRadius={50}
            borderWidth={5}
            borderColor="white"
            padding={5}
            width={60}
            height={60} />
        </TouchableHighlight>
      </View>
    </SafeAreaView>
  );
};

export default CameraLocation;
