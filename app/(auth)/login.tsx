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
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';
import { DiamondButton } from '../../components/ui/DiamondButton';
import { SocialButton } from '../../components/ui/SocialButton';

WebBrowser.maybeCompleteAuthSession();

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <Path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Login failed', error.message);
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const redirectTo = AuthSession.makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        Alert.alert('Google sign in failed', error?.message ?? 'Could not start sign in.');
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success') {
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
        if (sessionError) Alert.alert('Google sign in failed', sessionError.message);
      }
    } catch (e: any) {
      Alert.alert('Google sign in failed', e.message);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleAppleLogin() {
    setAppleLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert('Apple sign in failed', 'No identity token returned.');
        return;
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) Alert.alert('Apple sign in failed', error.message);
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple sign in failed', e.message);
      }
    } finally {
      setAppleLoading(false);
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
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.headline}>WELCOME BACK</Text>
        <Text style={styles.sub}>Sign in to continue your journey</Text>

        <View style={styles.form}>
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
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <DiamondButton
            label="SIGN IN"
            onPress={handleLogin}
            loading={loading}
            style={styles.cta}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social */}
          <SocialButton
            label="CONTINUE WITH GOOGLE"
            icon={<GoogleIcon />}
            onPress={handleGoogleLogin}
            loading={googleLoading}
          />

          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={4}
              style={styles.appleBtn}
              onPress={handleAppleLogin}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to SPRTD? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.footerLink}>CREATE ACCOUNT</Text>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  appleBtn: {
    height: 48,
    width: '100%',
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
