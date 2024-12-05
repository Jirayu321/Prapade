import React,{FC} from 'react';
import {View, Text} from '@gluestack-ui/themed';
import fontStyles from '../../core/styles/fonts';

const Footer: FC = () => {
  return (
    <View width={'100%'} paddingVertical={10} marginTop={30}>
      <Text
        style={{
          color: 'white',
          textAlign: 'center',
          fontFamily: fontStyles.regular,
          fontSize: 13
        }}>
        Copyright @ 2022 by Yimlamai Bizz Co. Ltd{'\n'}All right reserved v.003
      </Text>
    </View>
  );
};

export default Footer;
