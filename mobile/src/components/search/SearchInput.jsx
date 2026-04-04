import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const C = {
  ink: "#0a0a0a",
  muted: "#888888",
  border: "#e0dbd4",
  bg: "#f8f6f2",
  blue: "#004ac6",
  white: "#ffffff",
};

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
        color={focused ? C.blue : C.muted}
      />
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder || "Search by name or @handle..."}
        placeholderTextColor={C.muted}
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
          <MaterialIcons name="close" size={20} color={C.muted} />
        </TouchableOpacity>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 12,
    backgroundColor: C.bg,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  containerFocused: {
    borderColor: C.blue,
    backgroundColor: C.white,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: C.ink,
    fontWeight: '600',
    height: '100%',
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0ece5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
