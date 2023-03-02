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
});

interface Props {}

const NumbersScreen: React.FC<Props> = () => {
  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <FlatList
      data={new Array(100)}
      ItemSeparatorComponent={renderSeparator}
      renderItem={({ index }) => (
        <View style={styles.row}>
          <Text style={styles.text}>Row {index}</Text>
        </View>
      )}
    />
  );
};

export default NumbersScreen;
