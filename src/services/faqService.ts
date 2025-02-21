import { PostgrestError } from '@supabase/supabase-js';
import supabase from './supabase';

export interface FAQCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  position: number;
  is_active: boolean;
}

export interface FAQArticle {
  id: string;
  category_id: string;
  title: string;
  content: string;
  keywords: string[];
  position: number;
  is_active: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ArticleFeedback {
  article_id: string;
  is_helpful: boolean;
  comment?: string;
}

class FAQService {
  async getCategories() {
    return await supabase
      .from('faq_categories')
      .select('*')
      .eq('is_active', true)
      .order('position');
  }

  async getArticlesByCategory(categoryId: string) {
    return await supabase
      .from('faq_articles')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('position');
  }

  async getArticleById(articleId: string) {
    return await supabase
      .from('faq_articles')
      .select(`
        *,
        faq_categories (
          title,
          description
        )
      `)
      .eq('id', articleId)
      .single();
  }

  async searchArticles(query: string) {
    return await supabase
      .from('faq_articles')
      .select(`
        *,
        faq_categories (
          title
        )
      `)
      .textSearch('title', query)
      .eq('is_active', true)
      .order('view_count', { ascending: false });
  }

  async submitArticleFeedback(feedback: ArticleFeedback) {
    const { article_id, is_helpful, comment } = feedback;
    
    // Start a transaction to update both tables
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error: feedbackError } = await supabase
      .from('faq_article_feedback')
      .insert({
        article_id,
        user_id: user.id,
        is_helpful,
        comment
      });

    if (feedbackError) throw feedbackError;

    // Update article counts
    const { error: updateError } = await supabase
      .from('faq_articles')
      .update({
        helpful_count: is_helpful ? supabase.raw('helpful_count + 1') : supabase.raw('helpful_count'),
        not_helpful_count: !is_helpful ? supabase.raw('not_helpful_count + 1') : supabase.raw('not_helpful_count')
      })
      .eq('id', article_id);

    if (updateError) throw updateError;

    return { error: null };
  }
}

export const faqService = new FAQService();