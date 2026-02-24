import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';
import { DiamondButton } from '../../components/ui/DiamondButton';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!username || !email || !password) {
      Alert.alert('Missing fields', 'Username, email, and password are required.');
      return;
    }
    if (username.length < 3) {
      Alert.alert('Username too short', 'Must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Must be at least 6 characters.');
      return;
    }

    setLoading(true);

    // Check username availability
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (existing) {
      setLoading(false);
      Alert.alert('Username taken', 'Choose a different username.');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert('Signup failed', error.message);
    } else {
      Alert.alert(
        'Check your email',
        'We sent a confirmation link. Verify your email to activate your account.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.headline}>JOIN SPRTD</Text>
        <Text style={styles.sub}>Earn your place through competition</Text>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>FULL NAME (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
              value={fullName}
              onChangeText={setFullName}
              autoComplete="name"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>USERNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="yourhandle"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/\s/g, ''))}
              autoCapitalize="none"
              autoComplete="username"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Min 6 characters"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <DiamondButton
            label="CREATE ACCOUNT"
            onPress={handleSignup}
            loading={loading}
            style={styles.cta}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already a member? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
  },
  headline: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 6,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 40,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    color: colors.accentMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 15,
  },
  cta: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  footerLink: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
