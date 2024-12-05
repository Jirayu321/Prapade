import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  Box,
  ScrollView,
  Text,
  View,
} from '@gluestack-ui/themed';
import React,{FC} from 'react';
import fontStyles from '../../../core/styles/fonts';
import {TouchableHighlight} from 'react-native';

interface ISelectAction {
  isOpen: boolean;
  onClose: () => void;
  onCallback: (data: any) => void;
  listItems: any;
  title?: string;
}

const SelectAction: FC<ISelectAction> = ({
  isOpen,
  onClose,
  onCallback,
  listItems,
  title = 'เลือกรายการ',
}) => {
  const handleClose = () => {
    onClose();
  };

  const handleSelect = (idx: number) => {
    if (idx !== -1) {
      onCallback(listItems[idx]);
    }
    handleClose();
  };

  return (
    <Box>
      <Actionsheet
        isOpen={isOpen}
        onClose={handleClose}
        snapPoints={[85]}
        zIndex={999}>
        <ActionsheetBackdrop />
        <ActionsheetContent padding={'$0'} zIndex={999} maxHeight={'85%'}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View width={'95%'} padding={4}>
            <Text fontFamily={fontStyles.semibold} fontSize={16} color="black">
              {title}
            </Text>
          </View>
          <ScrollView flex={1} width={'95%'} marginBottom={10} padding={4}>
            {listItems?.map((item: any, idx: number) => {
              return (
                <TouchableHighlight
                  key={idx}
                  onPress={() => handleSelect(idx)}
                  underlayColor={'none'}>
                  <View
                    paddingVertical={10}
                    paddingHorizontal={8}
                    backgroundColor="#CACACA"
                    marginVertical={4}
                    borderRadius={5}>
                    <Text fontSize={16} fontFamily={fontStyles.regular}>
                      {item.COLLECT_AREA}
                    </Text>
                  </View>
                </TouchableHighlight>
              );
            })}
          </ScrollView>
        </ActionsheetContent>
      </Actionsheet>
    </Box>
  );
};

export default SelectAction;
