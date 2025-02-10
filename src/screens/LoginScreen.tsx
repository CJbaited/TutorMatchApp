import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, Image } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import supabase from '../services/supabase';
import { commonStyles, colors } from '../theme/Theme';

export function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;

      // Check tutors table first
      const { data: tutorData } = await supabase
        .from('tutors')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (tutorData) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'TutorDashboard' }]
        });
        return;
      }

      // Check profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (!profileData) {
        // First time user - go to onboarding
        navigation.reset({
          index: 0,
          routes: [{ name: 'RoleSelection' }]
        });
      } else {
        // Existing student - go to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }]
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) Alert.alert('Error', error.message);
  };

  return (
    <View style={commonStyles.container}>
      <Image source={require('../../assets/logo.png')} style={{ width: 120, height: 120, marginBottom: 40 }} />
      <TextInput
        style={commonStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={colors.textTertiary}
      />
      <View style={{ ...commonStyles.input, flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={{ flex: 1, color: colors.textPrimary }}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={colors.textTertiary}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? <EyeOff size={24} color={colors.textTertiary} /> : <Eye size={24} color={colors.textTertiary} />}
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={commonStyles.button} onPress={handleLogin}>
        <Text style={commonStyles.buttonText}>Login</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '50%', marginTop: 20 }}>
        <TouchableOpacity onPress={() => handleOAuthLogin('google')}>
          <Image source={require('../../assets/google.png')} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOAuthLogin('facebook')}>
          <Image source={require('../../assets/facebook.png')} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default LoginScreen;