import { 
  Book, 
  GraduationCap, 
  Calculator, 
  Languages, 
  TestTube, 
  Brain,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Settings,
  DollarSign,
  Clock,
  Star,
  LifeBuoy,
  Calendar,
  CreditCard,
  Presentation,
  User,
  Shield
} from 'lucide-react-native';

export const getCategoryIcon = (iconName: string | null) => {
  const iconMap = {
    'book': Book,
    'graduation-cap': GraduationCap,
    'calculator': Calculator,
    'languages': Languages,
    'test-tube': TestTube,
    'brain': Brain,
    'help-circle': HelpCircle,
    'book-open': BookOpen,
    'message-circle': MessageCircle,
    'settings': Settings,
    'dollar-sign': DollarSign,
    'clock': Clock,
    'star': Star,
    'life-ring': LifeBuoy,
    'calendar': Calendar,
    'credit-card': CreditCard,
    'chalkboard-teacher': Presentation,
    'user-graduate': User,
    'shield-alt': Shield,
  };

  if (!iconName) return HelpCircle; // default icon
  return iconMap[iconName] || HelpCircle;
};