import React, { createContext, useContext, useState } from 'react';
import { FAQArticle, FAQCategory, faqService } from '../services/faqService';

interface FAQContextType {
  categories: FAQCategory[];
  articles: Record<string, FAQArticle[]>;
  searchResults: FAQArticle[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  fetchArticlesByCategory: (categoryId: string) => Promise<void>;
  searchArticles: (query: string) => Promise<void>;
  getArticleById: (articleId: string) => Promise<{ data: FAQArticle | null; error: any }>;
  submitArticleFeedback: (articleId: string, isHelpful: boolean, comment?: string) => Promise<void>;
}

export const FAQContext = createContext<FAQContextType | undefined>(undefined);

export const FAQProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [articles, setArticles] = useState<Record<string, FAQArticle[]>>({});
  const [searchResults, setSearchResults] = useState<FAQArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await faqService.getCategories();
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching FAQ categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticlesByCategory = async (categoryId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await faqService.getArticlesByCategory(categoryId);
      if (error) throw error;
      setArticles(prev => ({
        ...prev,
        [categoryId]: data || []
      }));
    } catch (error) {
      console.error('Error fetching FAQ articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchArticles = async (query: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await faqService.searchArticles(query);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching FAQ articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async (articleId: string, isHelpful: boolean, comment?: string) => {
    try {
      const { error } = await faqService.submitArticleFeedback({
        article_id: articleId,
        is_helpful: isHelpful,
        comment
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error submitting article feedback:', error);
      throw error;
    }
  };

  const submitArticleFeedback = async (articleId: string, isHelpful: boolean, comment?: string) => {
    try {
      const { error } = await faqService.submitArticleFeedback({
        article_id: articleId,
        is_helpful: isHelpful,
        comment
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };


  const getArticleById = async (articleId: string) => {
    try {
      const { data, error } = await faqService.getArticleById(articleId);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching article:', error);
      return { data: null, error };
    }
  };
  return (
    <FAQContext.Provider
      value={{
        categories,
        articles,
        searchResults,
        isLoading,
        fetchCategories,
        fetchArticlesByCategory,
        searchArticles,
        getArticleById,
        submitArticleFeedback
      }}
    >
      {children}
    </FAQContext.Provider>
  );
};

export const useFAQ = () => {
  const context = useContext(FAQContext);
  if (context === undefined) {
    throw new Error('useFAQ must be used within a FAQProvider');
  }
  return context;
};