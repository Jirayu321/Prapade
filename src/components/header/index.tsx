import React,{FC} from 'react';
import {View, Text, Button} from '@gluestack-ui/themed';
import fontStyles from '../../core/styles/fonts';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faRightFromBracket} from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';

interface IHeader {
  title: string;
}

const Header: FC<IHeader> = ({title}) => {
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('password');
    await queryClient.invalidateQueries({queryKey: ['userAuth']});
  };

  return (
    <View
      backgroundColor="#065B94"
      position="relative"
      width={'100%'}
      padding={4}
      height={48}
      flexDirection="row"
      justifyContent="center"
      alignItems="center">
      <View>
        <Text fontFamily={fontStyles.semibold} color="white" fontSize={16}>
          {title}
        </Text>
      </View>
      <Button
        onPress={() => {
          handleLogout();
        }}
        position="absolute"
        right={5}
        size="xs"
        action="default">
        <FontAwesomeIcon icon={faRightFromBracket} color="white" />
      </Button>
    </View>
  );
};

export default Header;
