import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StatusBar,
  StyleSheet,
} from 'react-native';

import Button from '../components/Button';

export default function Welcome({ onEnter, onOpenAdmin }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#082347" />

      <View style={styles.header}>
        <Text style={styles.logo}>
          <Text style={styles.logoBold}>Jobs</Text>
          <Text style={styles.logoLight}>Mobile</Text>
        </Text>
      </View>

      <View style={styles.content}>
        <Image
          source={require('../img/jobs.png')}
          resizeMode="contain"
          style={styles.image}
        />

        <Text style={styles.title}>
          Encontre seu{'\n'}próximo trabalho
        </Text>

        <Text style={styles.subtitle}>
          Oportunidades que combinam com você
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Entrar"
          onPress={onEnter}
          style={styles.button}
        />

        {onOpenAdmin ? (
          <Button
            title="Painel administrativo"
            onPress={onOpenAdmin}
            style={[styles.button, styles.adminButton]}
          />
        ) : null}

        <Text style={styles.footerText}>
          Acesso direto, simples e seguro.
        </Text>
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
  },

  image: {
    width: '100%',
    height: 220,
    marginBottom: 20,
  },

  title: {
    color: '#0B2E5C',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
  },

  subtitle: {
    color: '#828C9E',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },


  footer: {
    backgroundColor: '#F2F5F9',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },

  button: {
    backgroundColor: '#082347',
    marginBottom: 10,
  },

  adminButton: {
    backgroundColor: '#1647C5',
  },

  footerText: {
    color: '#828C9E',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 14,
  },
});