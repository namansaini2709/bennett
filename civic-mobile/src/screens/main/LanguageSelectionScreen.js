import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCard } from '../../components/ui/AnimatedComponents';
import * as Animatable from 'react-native-animatable';

const LanguageSelectionScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  // Available languages
  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      description: 'English (United States)'
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      description: 'Hindi (भारत)'
    },
    {
      code: 'bho',
      name: 'Bhojpuri',
      nativeName: 'भोजपुरी',
      flag: '🇮🇳',
      description: 'Bhojpuri (Bihar/Jharkhand)'
    },
    {
      code: 'mag',
      name: 'Magahi',
      nativeName: 'मगही',
      flag: '🇮🇳',
      description: 'Magahi (Bihar/Jharkhand)'
    },
    {
      code: 'mai',
      name: 'Maithili',
      nativeName: 'मैथिली',
      flag: '🇮🇳',
      description: 'Maithili (Bihar/Jharkhand)'
    },
    {
      code: 'sa',
      name: 'Santali',
      nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
      flag: '🇮🇳',
      description: 'Santali (Jharkhand)'
    },
    {
      code: 'ho',
      name: 'Ho',
      nativeName: 'हो',
      flag: '🇮🇳',
      description: 'Ho (Jharkhand)'
    },
    {
      code: 'kha',
      name: 'Kharia',
      nativeName: 'खड़िया',
      flag: '🇮🇳',
      description: 'Kharia (Jharkhand)'
    },
    {
      code: 'kur',
      name: 'Kurukh',
      nativeName: 'कुड़ुख़',
      flag: '🇮🇳',
      description: 'Kurukh/Oraon (Jharkhand)'
    },
    {
      code: 'mun',
      name: 'Mundari',
      nativeName: 'मुंडारी',
      flag: '🇮🇳',
      description: 'Mundari (Jharkhand)'
    }
  ];

  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default to English

  const selectLanguage = (languageCode) => {
    setSelectedLanguage(languageCode);
  };

  const saveLanguage = () => {
    const language = languages.find(lang => lang.code === selectedLanguage);

    // Here you would typically save to AsyncStorage and update the app context
    Alert.alert(
      'Language Changed',
      `Language has been changed to ${language.name}. The app will restart to apply changes.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Here you would typically restart the app or update the language context
            navigation.goBack();
          }
        }
      ]
    );
  };

  const LanguageItem = ({ language, isSelected, onSelect }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        {
          backgroundColor: isSelected
            ? theme.colors.primary.main + '15'
            : theme.colors.surface.primary,
          borderColor: isSelected
            ? theme.colors.primary.main
            : theme.colors.border.primary,
          borderWidth: isSelected ? 2 : 1
        }
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.languageLeft}>
        <Text style={styles.flag}>{language.flag}</Text>
        <View style={styles.languageText}>
          <Text style={[
            styles.languageName,
            {
              color: isSelected
                ? theme.colors.primary.main
                : theme.colors.text.primary,
              fontWeight: isSelected ? 'bold' : '500'
            }
          ]}>
            {language.name}
          </Text>
          <Text style={[styles.nativeName, { color: theme.colors.text.secondary }]}>
            {language.nativeName}
          </Text>
          <Text style={[styles.description, { color: theme.colors.text.tertiary }]}>
            {language.description}
          </Text>
        </View>
      </View>
      <View style={styles.languageRight}>
        {isSelected && (
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={theme.colors.primary.main}
          />
        )}
        {!isSelected && (
          <View style={[
            styles.radioCircle,
            { borderColor: theme.colors.border.primary }
          ]} />
        )}
      </View>
    </TouchableOpacity>
  );

  const LanguageSection = ({ title, languages: sectionLanguages }) => (
    <Animatable.View animation="fadeInUp" duration={600}>
      <AnimatedCard style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        {sectionLanguages.map((language) => (
          <LanguageItem
            key={language.code}
            language={language}
            isSelected={selectedLanguage === language.code}
            onSelect={() => selectLanguage(language.code)}
          />
        ))}
      </AnimatedCard>
    </Animatable.View>
  );

  // Group languages
  const primaryLanguages = languages.filter(lang => ['en', 'hi'].includes(lang.code));
  const regionalLanguages = languages.filter(lang => !['en', 'hi'].includes(lang.code));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      <LinearGradient
        colors={theme.colors.gradient.primary}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.text.contrast}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Language</Text>
          <TouchableOpacity
            onPress={saveLanguage}
            style={styles.saveButton}
          >
            <MaterialCommunityIcons
              name="check"
              size={24}
              color={theme.colors.text.contrast}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <Animatable.View animation="fadeInUp" duration={600}>
          <AnimatedCard style={[styles.infoCard, { backgroundColor: theme.colors.primary.main + '10' }]}>
            <MaterialCommunityIcons
              name="information"
              size={24}
              color={theme.colors.primary.main}
              style={styles.infoIcon}
            />
            <Text style={[styles.infoText, { color: theme.colors.text.primary }]}>
              Select your preferred language. This will change the language for all app content including menus, buttons, and messages.
            </Text>
          </AnimatedCard>
        </Animatable.View>

        {/* Primary Languages */}
        <LanguageSection
          title="Primary Languages"
          languages={primaryLanguages}
        />

        {/* Regional Languages */}
        <LanguageSection
          title="Regional Languages (Jharkhand)"
          languages={regionalLanguages}
        />

        {/* Note */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300}>
          <View style={[styles.noteCard, { backgroundColor: theme.colors.surface.secondary }]}>
            <MaterialCommunityIcons
              name="translate"
              size={20}
              color={theme.colors.text.secondary}
              style={styles.noteIcon}
            />
            <Text style={[styles.noteText, { color: theme.colors.text.secondary }]}>
              Note: Some regional languages are currently in development.
              If your preferred language isn't available, we're working to add it soon!
            </Text>
          </View>
        </Animatable.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  saveButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 14,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
  },
  languageRight: {
    marginLeft: 12,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  noteCard: {
    flexDirection: 'row',
    padding: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  noteIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default LanguageSelectionScreen;