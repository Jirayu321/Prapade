/* eslint-disable react-native/no-inline-styles */
import React, {FC, useEffect, useState} from 'react';
import {View, Text, Pressable} from '@gluestack-ui/themed';
import fontStyles from '../../core/styles/fonts';
import {TouchableHighlight} from 'react-native';

interface IMeterCard {
  type?: string;
  listItems: any;
  onSelect: (data: any) => void;
  resetTrigger: any;
}

const MeterCard: FC<IMeterCard> = ({
  type = 'officer',
  listItems,
  onSelect,
  resetTrigger,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalItems = listItems.length;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const currentMeterLists = listItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIndex(null);
  };

  useEffect(() => {
    if (listItems) {
      setCurrentPage(1);
    }
  }, [listItems]);

  useEffect(() => {
    setSelectedIndex(null);
  }, [resetTrigger]);

  return (
    <View marginTop={15} position="relative">
      <View
        backgroundColor="#D6EBFF"
        width={'100%'}
        minHeight={220}
        borderRadius={16}
        alignItems="center"
        paddingHorizontal={10}
        paddingVertical={15}>
        <View
          width={'92%'}
          borderBottomWidth={2}
          borderBottomColor="#3CACF7"
          paddingBottom={10}>
          <View
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center">
            <View width={'50%'}>
              <Text color="#087FCF" fontFamily={fontStyles.semibold}>
                เลขมิเตอร์
              </Text>
            </View>
            <View width={'50%'}>
              <Text color="#087FCF" fontFamily={fontStyles.semibold}>
                ชื่อ-สกุล
              </Text>
            </View>
          </View>
        </View>
        {currentMeterLists.map((item: any, idx: number) => {
          return (
            <TouchableHighlight
              key={idx}
              underlayColor={'none'}
              onPress={() => {
                onSelect(item);
                setSelectedIndex(idx);
              }}>
              <View
                width={'92%'}
                paddingVertical={8}
                borderBottomWidth={idx === listItems.length - 1 ? 0 : 1}
                borderBottomColor="#7ABFFF"
                backgroundColor={
                  selectedIndex === idx ? '#FFFF' : 'transparent'
                }>
                <View
                  flexDirection="row"
                  justifyContent="flex-start"
                  alignItems="center">
                  <View width={'50%'}>
                    {(type === 'officer' && (
                      <Text
                        color="#087FCF"
                        fontFamily={fontStyles.regular}
                        fontSize={15}>
                        {item.METER_NUMBER}
                      </Text>
                    )) ||
                      (type === 'user' && (
                        <Text
                          color="#087FCF"
                          fontFamily={fontStyles.regular}
                          fontSize={15}>
                          {item.meterNumber}
                        </Text>
                      ))}
                  </View>
                  <View width={'50%'}>
                    {(type === 'officer' && (
                      <Text
                        color="#087FCF"
                        fontFamily={fontStyles.regular}
                        fontSize={15}>
                        {item.NAME} {item.SURNAME}
                      </Text>
                    )) ||
                      (type === 'user' && (
                        <Text
                          color="#087FCF"
                          fontFamily={fontStyles.regular}
                          fontSize={15}>
                          {item.memberName}
                        </Text>
                      ))}
                  </View>
                </View>
              </View>
            </TouchableHighlight>
          );
        })}
        <View
          position="absolute"
          bottom={10}
          flexDirection="row"
          justifyContent="center"
          gap={18}
          marginTop={10}>
          {[...Array(Math.ceil(totalItems / itemsPerPage)).keys()].map(page => (
            // <View
            //   key={page}
            //   backgroundColor={
            //     currentPage === page + 1 ? '#FFFF' : 'transparent'
            //   }
            //   width={30}
            //   height={30}
            //   borderRadius={15}
            //   justifyContent="center"
            //   alignItems="center"
            //   padding={currentPage === page + 1 ? 2 : 0}
            //   // onPress={() => handlePageChange(page + 1)}
            //   >
            //   <Text
            //     color={currentPage === page + 1 ? '#087FCF' : '#5C656E'}
            //     fontSize={14}
            //     fontFamily={fontStyles.medium}>
            //     {page + 1}
            //   </Text>
            // </View>
            <Pressable
              key={page}
              style={{
                backgroundColor:
                  currentPage === page + 1 ? '#FFFF' : 'transparent',
                width: 30,
                height: 30,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
                padding: currentPage === page + 1 ? 2 : 0,
              }}
              onPress={() => handlePageChange(page + 1)}>
              <Text
                style={{
                  color: currentPage === page + 1 ? '#087FCF' : '#5C656E',
                  fontSize: 14,
                  fontFamily: fontStyles.medium,
                }}>
                {page + 1}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};

export default MeterCard;
