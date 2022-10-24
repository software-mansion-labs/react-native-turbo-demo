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
});

interface Props {}

const NumbersScreen: React.FC<Props> = () => {
  return (
    <FlatList
      data={new Array(100)}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ index }) => (
        <View style={styles.row}>
          <Text>Row {index}</Text>
        </View>
      )}
    />
  );
};

export default NumbersScreen;
