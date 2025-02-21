import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFAQ } from '../../contexts/FAQContext';
import colors from '../../constants/colors';

const FAQCategoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, title } = route.params;
  const { articles, isLoading, fetchArticlesByCategory } = useFAQ();

  useEffect(() => {
    fetchArticlesByCategory(categoryId);
  }, [categoryId]);

  const categoryArticles = articles[categoryId] || [];

  const screenOptions = {
    windowSize: 3, // Number of items rendered in memory
    removeClippedSubviews: true, // Unmount components when outside of window
    maxToRenderPerBatch: 5, // Reduce number of items rendered per batch
    updateCellsBatchingPeriod: 50, // Increase time between batches
    initialNumToRender: 8, // Reduce initial render amount
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {categoryArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => navigation.navigate('ArticleDetail', { 
                articleId: article.id,
                title: article.title 
              })}
            >
              <Text style={styles.articleTitle}>{article.title}</Text>
              <ChevronRight size={20} color={colors.gray} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  articleTitle: {
    fontSize: 16,
    color: colors.darkGray,
    flex: 1,
    marginRight: 8,
  },
});

export default FAQCategoryScreen;