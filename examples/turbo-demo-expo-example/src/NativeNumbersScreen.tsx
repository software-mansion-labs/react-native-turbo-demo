import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';

const styles = StyleSheet.create({
  row: {
    justifyContent: 'center',
    padding: 16,
  },
  separator: {
    height: 2,
    marginHorizontal: 16,
    backgroundColor: 'lightgray',
  },
  text: {
    color: '#00094a',
  },
  header: {
    padding: 16,
    color: '#00094a',
    fontWeight: '500',
  },
});

interface Props {}

const NativeNumbersScreen: React.FC<Props> = () => {
  const renderSeparator = () => <View style={styles.separator} />;

  const headerComponent = () => (
    <Text style={styles.header}>This is a React Native component</Text>
  );

  return (
    <FlatList
      data={new Array(50)}
      ItemSeparatorComponent={renderSeparator}
      ListHeaderComponent={headerComponent}
      renderItem={({ index }) => (
        <View style={styles.row}>
          <Text style={styles.text}>Row {index}</Text>
        </View>
      )}
    />
  );
};

export default NativeNumbersScreen;
