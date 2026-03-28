import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { ScreenShell, TAB_COLORS } from "./TabShared";
import SearchInput from "../search/SearchInput";
import SearchResultItem from "../search/SearchResultItem";
import SearchEmptyState from "../search/SearchEmptyState";
import SearchSkeleton from "../search/SearchSkeleton";
import { searchUsers } from "../../services/users/userService";

export default function SearchTab({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search effect
  useEffect(() => {
    let active = true;
    
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const fetchUsers = async () => {
      setIsLoading(true);
      const data = await searchUsers(query.trim());
      if (active) {
        setResults(data || []);
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, 500); // 500ms debounce

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleUserPress = useCallback((user) => {
    navigation.navigate("UserProfile", { username: user.username });
  }, [navigation]);

  return (
    <ScreenShell
      navigation={navigation}
      routeName="Search"
    >
      <View style={styles.container}>
        <SearchInput 
          value={query} 
          onChangeText={setQuery} 
          isSearching={isLoading} 
        />
        
        <View style={styles.resultsContainer}>
          {isLoading ? (
            <SearchSkeleton />
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <SearchResultItem user={item} onPress={handleUserPress} />
              )}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false} // Since we are inside a ScrollView from ScreenShell
            />
          ) : (
            <SearchEmptyState query={query} />
          )}
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
  },
  resultsContainer: {
    backgroundColor: TAB_COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: TAB_COLORS.cardBorder,
    padding: 18,
    minHeight: 200,
  }
});
