import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TAB_COLORS } from '../tabs/TabShared';

export default function SearchInput({ value, onChangeText, isSearching, placeholder }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  return (
    <Pressable 
      style={[styles.container, focused && styles.containerFocused]}
      onPress={() => inputRef.current?.focus()}
    >
      <MaterialIcons
        name="search"
        size={22}
        color={focused ? TAB_COLORS.blue : TAB_COLORS.inkFaint}
      />
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder || "Search by name or @handle..."}
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
        <TouchableOpacity 
          onPress={() => onChangeText('')} 
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.clearBtn}
        >
          <MaterialIcons name="close" size={20} color={TAB_COLORS.inkFaint} />
        </TouchableOpacity>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#F7FAFF',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  containerFocused: {
    borderColor: TAB_COLORS.blue,
    backgroundColor: '#FFFFFF',
    shadowColor: TAB_COLORS.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: TAB_COLORS.ink,
    fontWeight: '500',
    height: '100%',
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
