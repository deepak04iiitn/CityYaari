import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TAB_COLORS } from '../tabs/TabShared';

export default function SearchInput({ value, onChangeText, isSearching }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      <MaterialIcons
        name={isSearching ? 'hourglass-top' : 'search'}
        size={20}
        color={focused ? TAB_COLORS.blue : TAB_COLORS.inkFaint}
      />
      <TextInput
        style={styles.input}
        placeholder="Search by name or @handle..."
        placeholderTextColor={TAB_COLORS.inkFaint}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="cancel" size={18} color={TAB_COLORS.inkFaint} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F7FAFF',
    borderWidth: 1.5,
    borderColor: '#DEE8F8',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  containerFocused: {
    borderColor: TAB_COLORS.blue,
    backgroundColor: '#FAFCFF',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: TAB_COLORS.ink,
    fontWeight: '500',
  },
});
