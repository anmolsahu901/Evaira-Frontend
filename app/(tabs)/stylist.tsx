import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AIStylistCart() {
  return (
    
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header from Wishlist Design */}
        <View style={styles.pageHeader}>
          <View style={styles.headerSide}>
            <Image
              source={require('../../assets/circle_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.pageTitle}>AI STYLIST</Text>
          <View style={styles.headerSide}>
            <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
              <Ionicons name="ellipsis-vertical" size={20} color="#1d2c4f" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content Area */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          bounces={true}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Center Introduction */}
          <View style={styles.centerSection}>
            <MaterialCommunityIcons name="star-four-points-outline" size={42} color="#1d2c4f" style={styles.magicIcon} />
            <Text style={styles.mainHeading}>Meet Your Evaira Stylist</Text>
            <Text style={styles.subHeading}>
              Personalized fashion advice{'\n'}powered by your style profile.
            </Text>
          </View>

          {/* AI Chat Bubble */}
          <View style={styles.chatSection}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250&auto=format&fit=crop' }} 
                style={styles.avatar} 
              />
              <View style={styles.statusDot} />
            </View>
            <View style={styles.chatBubble}>
              <Text style={styles.chatText}>
                Hey! <Text style={{fontSize: 16}}>👋</Text> I'm Evaira, your AI personal stylist.
              </Text>
              <Text style={[styles.chatText, styles.chatParagraph]}>
                Share your outfit or describe it—I'll suggest perfect matches and products for you.
              </Text>
              <Text style={[styles.chatText, styles.chatParagraph]}>
                🚧 Currently in development...{'\n'}coming soon! <Text style={{fontSize: 16}}>✨</Text>
              </Text>
            </View>
          </View>

          {/* Extra bottom padding to ensure user can scroll content past input area */}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Bottom Sticky Area: Suggestions & Input */}
        <View style={styles.bottomArea}>
          <View style={styles.suggestionsWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.suggestionsContainer}
            >
              {[
                'Suggest date outfit', 
                'Office look under ₹2000', 
                'Show oversized tees'
              ].map((text, i) => (
                <TouchableOpacity key={i} style={styles.suggestionChip}>
                  <Text style={styles.suggestionText}>{text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="attach-outline" size={24} color="#888" />
              </TouchableOpacity>
              
              <TextInput 
                style={styles.inputField}
                placeholder="Message your stylist..."
                placeholderTextColor="#999"
              />
              
              <TouchableOpacity style={styles.sendButton}>
                <Ionicons name="paper-plane-outline" size={18} color="#777" style={{ transform: [{ rotate: '45deg' }], marginLeft: -2 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
   
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // Ensures the safe area header overlaps perfectly
  },
  container: { 
    flex: 1, 
    backgroundColor: '#ffffffff',
  },

  /* ----------- HEADER (copied from wishlist) ----------- */
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomColor: '#f0f0f5',
    borderBottomWidth: 1,
  },
  headerSide: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  pageTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#33415c',
    letterSpacing: 1.5,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  /* ----------- SCROLL CONTENT ----------- */
  scrollContent: {
    paddingBottom: 140, // Avoid overlap with bottomArea
  },

  /* ----------- CENTER SECTION ----------- */
  centerSection: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 30,
  },
  magicIcon: {
    marginBottom: 16,
  },
  mainHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },

  /* ----------- CHAT BUBBLE ----------- */
  chatSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 60,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
    bottom: -6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6e6e6',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00cc44',
    borderWidth: 2,
    borderColor: '#f9f9fb',
  },
  chatBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingTop: 16,
    paddingBottom: 22,
    paddingHorizontal: 16,
    width: '78%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chatText: {
    fontSize: 14.5,
    color: '#333',
    lineHeight: 22,
    fontWeight: '500',
  },
  chatParagraph: {
    marginTop: 18,
  },

  /* ----------- BOTTOM AREA ----------- */
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffffff',
    paddingTop: 10,
    paddingBottom: 24, // Bottom safe padding
  },
  suggestionsWrapper: {
    marginBottom: 10,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  suggestionChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  suggestionText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },

  /* ----------- INPUT ----------- */
  inputWrapper: {
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f2f2f2',
  },
  attachButton: {
    padding: 6,
    marginRight: 4,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '400',
    paddingVertical: 8,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f2f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
});