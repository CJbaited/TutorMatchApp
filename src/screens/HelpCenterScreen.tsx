import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Search, 
  Mail, 
  HelpCircle, 
  AlertTriangle, 
  Book, 
  Clock, 
  DollarSign, 
  Shield 
} from 'lucide-react-native';
import { getCategoryIcon } from '../utils/iconMapping';
import supabase from '../services/supabase';
import { useFAQ } from '../contexts/FAQContext';
import colors from '../constants/colors';

const HelpCenterScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [disputes, setDisputes] = useState([]);
  const [greeting, setGreeting] = useState('');
  const {
    categories,
    searchResults,
    isLoading,
    fetchCategories,
    searchArticles
  } = useFAQ();

  useEffect(() => {
    fetchUserData();
    fetchDisputes();
    fetchCategories();
    setDayGreeting();
  }, []);

  const setDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  };

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUsername(profile.name);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchDisputes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('Dispute')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setDisputes(data);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
    }
  };

  const quickHelpButtons = [
    { icon: Book, label: 'Booking Help', screen: 'BookingHelp' },
    { icon: Clock, label: 'Session Issues', screen: 'SessionHelp' },
    { icon: DollarSign, label: 'Payment Help', screen: 'PaymentHelp' },
    { icon: Shield, label: 'Account Help', screen: 'AccountHelp' },
  ];

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@tutormatch.com?subject=Support Request');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchArticles(query);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>
          {greeting}, {username}
        </Text>
        <Text style={styles.title}>How can we help?</Text>

        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help articles..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#666"
          />
        </View>

        {searchQuery ? (
          <View style={styles.searchResults}>
            {searchResults.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.searchResultItem}
                onPress={() => navigation.navigate('ArticleDetail', { 
                  articleId: article.id,
                  title: article.title 
                })}
              >
                <Text style={styles.searchResultTitle}>{article.title}</Text>
                <Text style={styles.searchResultCategory}>
                  in {article.faq_categories?.title}
                </Text>
              </TouchableOpacity>
            ))}
            {searchResults.length === 0 && (
              <Text style={styles.noResults}>No articles found</Text>
            )}
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Help</Text>
              <View style={styles.quickHelpGrid}>
                {quickHelpButtons.map((item, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.quickHelpButton}
                    onPress={() => navigation.navigate(item.screen)}
                  >
                    <item.icon size={24} color={colors.primary} />
                    <Text style={styles.quickHelpText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {disputes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Resolutions</Text>
                {disputes.map((dispute, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.disputeCard}
                    onPress={() => navigation.navigate('DisputeDetails', { disputeId: dispute.id })}
                  >
                    <AlertTriangle size={20} color="#FF9800" />
                    <View style={styles.disputeInfo}>
                      <Text style={styles.disputeTitle}>Case #{dispute.id}</Text>
                      <Text style={styles.disputeStatus}>{dispute.status}</Text>
                    </View>
                    <Text style={styles.disputeDate}>
                      {new Date(dispute.created_at).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>FAQ</Text>
              {categories.map((category, index) => {
                const IconComponent = getCategoryIcon(category.icon);
                return (
                  <TouchableOpacity 
                    key={index}
                    style={styles.faqButton}
                    onPress={() => navigation.navigate('FAQCategory', { 
                      categoryId: category.id,
                      title: category.title 
                    })}
                  >
                    <View style={styles.faqInfo}>
                      <IconComponent size={20} color={colors.primary} />
                      <Text style={styles.faqTitle}>{category.title}</Text>
                    </View>
                    <View style={styles.faqCount}>
                      <Text style={styles.faqCountText}>{category.article_count} articles</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              </View>

            <View style={styles.contactSection}>
              <View style={styles.contactHeader}>
                <Text style={styles.contactTitle}>Need more help?</Text>
                <TouchableOpacity 
                  style={styles.emailButton}
                  onPress={handleEmailSupport}
                >
                  <Mail size={20} color="#FFF" />
                  <Text style={styles.emailButtonText}>Contact Support</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  quickHelpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickHelpButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickHelpText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  disputeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  disputeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  disputeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  disputeStatus: {
    fontSize: 14,
    color: '#666',
  },
  disputeDate: {
    fontSize: 14,
    color: '#666',
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  faqInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  faqCount: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  faqCountText: {
    fontSize: 12,
    color: '#666',
  },
  contactSection: {
    marginBottom: 32,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emailButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  searchResults: {
    marginBottom: 24,
  },
  searchResultItem: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  searchResultCategory: {
    fontSize: 14,
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default HelpCenterScreen;