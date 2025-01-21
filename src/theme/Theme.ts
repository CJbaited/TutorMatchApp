import { StyleSheet } from 'react-native';

const colors = {
  primary: '#4CAF50',
  secondary: '#E8F5E9',
  textPrimary: '#333',
  textSecondary: '#666',
  textTertiary: '#999',
  background: '#fff',
  cardBackground: '#E8F5E9',
  buttonBackground: '#4CAF50',
  buttonText: '#fff',
  borderColor: '#4CAF50',
};

const typography = {
  fontSizeSmall: 12,
  fontSizeMedium: 14,
  fontSizeLarge: 16,
  fontSizeXLarge: 24,
  fontWeightBold: 'bold',
};

const spacing = {
  small: 5,
  medium: 10,
  large: 15,
  xLarge: 20,
};

const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.large,
  },
  teachersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    width: 'auto',
    padding: spacing.large,
    backgroundColor: colors.buttonBackground,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  buttonText: {
    color: colors.buttonText,
    fontWeight: typography.fontWeightBold as "bold",
    fontSize: typography.fontSizeLarge,
  },
  input: {
    width: '80%',
    padding: spacing.large,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 25,
    marginBottom: spacing.large,
    backgroundColor: colors.secondary,
    color: colors.textPrimary,
  },
  card: {
    width: '45%',
    padding: spacing.medium,
    marginBottom: spacing.large,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    alignItems: 'center',
  },
  cardText: {
    fontSize: typography.fontSizeMedium,
    color: colors.textPrimary,
  },
  cardTitle: {
    fontSize: typography.fontSizeLarge,
    fontWeight: typography.fontWeightBold as "bold",
    color: colors.textPrimary,
  },
});

export { colors, typography, spacing, commonStyles };
