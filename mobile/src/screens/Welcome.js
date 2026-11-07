import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Welcome({ onLogin, onRegister, loading, error }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    document.title = "HubJobs | Entrar e Registrar";
  }, []);

  function handleSubmit() {
    const action = mode === 'login' ? onLogin : onRegister;
    if (action) {
      action({ username, password, mode });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#082347" />

      <View style={styles.header}>
        <Text style={styles.logo}>
          <Text style={styles.logoBold}>Hub</Text>
          <Text style={styles.logoLight}>Jobs</Text>
        </Text>
      </View>

      <View style={styles.content}>
        <Image
          source={require('../img/jobs.png')}
          resizeMode="contain"
          style={styles.image}
        />

        <Text style={styles.title}>Bem-vindo</Text>
        <Text style={styles.subtitle}>Entre para acessar as vagas e recursos do app.</Text>

        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setMode('login')}
            style={[styles.tab, mode === 'login' && styles.tabActive]}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode('register')}
            style={[styles.tab, mode === 'register' && styles.tabActive]}
          >
            <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Cadastrar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Usuário"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            secureTextEntry
            style={styles.input}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Entrar' : 'Criar conta'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Acesso para usuários e administradores da plataforma.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 70,
    backgroundColor: '#082347',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  logo: {
    fontSize: 24,
  },

  logoBold: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  logoLight: {
    color: '#D0D8E8',
    fontWeight: '300',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 20,
  },

  image: {
    width: '100%',
    height: 180,
    marginBottom: 18,
  },

  title: {
    color: '#0B2E5C',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },

  subtitle: {
    color: '#828C9E',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
  },

  tabRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#EEF2F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },

  tabActive: {
    backgroundColor: '#FFFFFF',
  },

  tabText: {
    color: '#60708A',
    fontWeight: '600',
  },

  tabTextActive: {
    color: '#082347',
  },

  form: {
    width: '100%',
    maxWidth: 360,
  },

  input: {
    backgroundColor: '#F7F9FC',
    borderColor: '#D9E1EE',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: '#1D3C75',
  },

  primaryButton: {
    backgroundColor: '#082347',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  errorText: {
    color: '#C23616',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },

  footerText: {
    color: '#828C9E',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 16,
  },
});
