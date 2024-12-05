import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

// ฟังก์ชันขออนุญาตตำแหน่ง
export const reqLocationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true; // ได้รับอนุญาต
      } else {
        Alert.alert(
          'ไม่ได้รับอนุญาต',
          'คุณจำเป็นจะต้องเปิดการติดตามตำแหน่ง เพื่อให้แอปพลิเคชันทำงานได้',
          [
            {text: 'ปิด'},
            {
              text: 'ตั้งค่า',
              onPress: () => {
                Linking.openSettings(); // เปิดหน้า Settings
              },
            },
          ],
        );
        return false; // ไม่ได้รับอนุญาต
      }
    } else {
      // สำหรับ iOS (ถ้าต้องการเพิ่มในอนาคต)
      return true; // ปัจจุบันถือว่าได้รับอนุญาตใน iOS
    }
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false; // เกิดข้อผิดพลาด
  }
};

// ฟังก์ชันดึงตำแหน่งปัจจุบัน
export const getCurrentLocation = async (): Promise<{
  latitude: number;
  longitude: number;
  heading?: number;
}> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const cords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading || 0, // เผื่อกรณี heading เป็น undefined
        };
        resolve(cords);
      },
      error => {
        reject(error.message); // คืนค่า error message
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
};

// ฟังก์ชันดูตำแหน่งแบบเรียลไทม์ (watch location)
export const watchLocation = (
  onSuccess: (coords: {
    latitude: number;
    longitude: number;
    heading?: number;
  }) => void,
  onError: (error: string) => void,
) => {
  return Geolocation.watchPosition(
    position => {
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        heading: position.coords.heading || 0,
      };
      onSuccess(coords);
    },
    error => {
      onError(error.message);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10, // อัปเดตทุก 10 เมตร
    },
  );
};
