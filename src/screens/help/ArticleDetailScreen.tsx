import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFAQ } from '../../contexts/FAQContext';
import colors from '../../constants/colors';
import Markdown from 'react-native-markdown-display';

const ArticleDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { articleId, title } = route.params;
  const { getArticleById, submitArticleFeedback } = useFAQ();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setError(null);
      setLoading(true);
      const { data, error } = await getArticleById(articleId);
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Article not found');
      }
      
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchArticle}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleFeedback = async (isHelpful: boolean) => {
    try {
      setError(null);
      await submitArticleFeedback(articleId, isHelpful);
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback');
    }
  };

  if (loading) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        >
        {article && (
          <>
            <View style={styles.articleContent}>
              <Markdown style={markdownStyles}>
                {article.content}
              </Markdown>
              <Text style={styles.lastUpdated}>
                Last updated: {new Date(article.updated_at).toLocaleDateString()}
              </Text>
            </View>

            {!feedbackSubmitted && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackTitle}>Was this article helpful?</Text>
                <View style={styles.feedbackButtons}>
                  <TouchableOpacity 
                    style={styles.feedbackButton}
                    onPress={() => handleFeedback(true)}
                  >
                    <ThumbsUp size={20} color={colors.primary} />
                    <Text style={styles.feedbackButtonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.feedbackButton}
                    onPress={() => handleFeedback(false)}
                  >
                    <ThumbsDown size={20} color={colors.gray} />
                    <Text style={styles.feedbackButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
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
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  articleContent: {
    padding: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'right',
    marginTop: 16,
  },
  feedbackContainer: {
    padding: 16,
    backgroundColor: colors.lightGray,
    marginTop: 24,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    gap: 8,
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
  feedbackButtonText: {
    fontSize: 16,
    color: colors.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.darkRed,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

const markdownStyles = {
  body: {
    color: colors.darkGray,
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
    marginTop: 24,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
    marginTop: 20,
  },
  paragraph: {
    marginBottom: 16,
  },
  list: {
    marginBottom: 16,
  },
  listItem: {
    marginBottom: 8,
  },
  link: {
    color: colors.primary,
  },
};

export default ArticleDetailScreen;