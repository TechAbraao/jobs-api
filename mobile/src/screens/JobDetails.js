
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button';

export default function JobDetails({
  vaga,
  favorita,
  onFavorite,
  onBack,
}) {
  const requisitos = Array.isArray(vaga?.requisitos) && vaga.requisitos.length > 0 ? vaga.requisitos : ['N/A'];
  const beneficios = vaga?.beneficios || 'N/A';
  const salario = vaga?.salario || 'N/A';
  const local = vaga?.local || 'N/A';
  const empresa = vaga?.empresa || 'N/A';
  const cargo = vaga?.cargo || 'N/A';
  const modalidade = vaga?.modalidade || 'N/A';
  const categoria = vaga?.categoria || 'N/A';
  const contrato = vaga?.contrato || 'N/A';

  async function abrirVaga() {
    if (!vaga.link) {
      Alert.alert(
        'Link indisponível',
        'Este cadastro não possui um link de candidatura disponível.'
      );
      return;
    }

    try {
      await Linking.openURL(vaga.link);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o link da vaga.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F6FC' }}>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 25 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginVertical: 8,
          }}
        >
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={23} color="#64718A" />
          </TouchableOpacity>

          <Text style={{ color: '#263249', fontWeight: '600' }}>
            Detalhes da vaga
          </Text>

          <TouchableOpacity onPress={onFavorite}>
            <Ionicons
              name={favorita ? 'heart' : 'heart-outline'}
              size={23}
              color="#1647C5"
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            backgroundColor: '#1647C5',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 12,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 18 }}>
            {empresa.charAt(0)}
          </Text>
        </View>

        <Text style={{ color: '#303A50', fontSize: 21, marginTop: 10 }}>
          {cargo}
        </Text>

        <Text style={{ color: '#8792A6', fontSize: 12, marginTop: 4 }}>
          {empresa} - {local}
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          {[modalidade, categoria, contrato].filter(item => item && item !== 'N/A').map(item => (
            <View
              key={item}
              style={{
                backgroundColor: '#1647C5',
                borderRadius: 15,
                paddingHorizontal: 10,
                paddingVertical: 6,
                marginRight: 6,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10 }}>{item}</Text>
            </View>
          ))}
        </View>

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 14,
            marginTop: 17,
          }}
        >
          <Text style={{ color: '#8792A6', fontSize: 11 }}>
            Faixa salarial
          </Text>
          <Text style={{ color: '#263249', fontWeight: '700', marginTop: 5 }}>
            {salario}
          </Text>
        </View>

        <Text style={{ color: '#263249', fontSize: 14, marginTop: 18 }}>
          Sobre a vaga
        </Text>

        <Text style={{ color: '#8792A6', fontSize: 12, lineHeight: 19, marginTop: 6 }}>
          {vaga?.descricao || 'N/A'}
        </Text>

        <Text style={{ color: '#263249', fontSize: 14, marginTop: 18 }}>
          Requisitos
        </Text>

        {requisitos.map((item, index) => (
          <Text
            key={index}
            style={{ color: '#8792A6', fontSize: 12, lineHeight: 19, marginTop: 4 }}
          >
            • {item}
          </Text>
        ))}

        <Text style={{ color: '#263249', fontSize: 14, marginTop: 18 }}>
          Benefícios
        </Text>

        <Text style={{ color: '#8792A6', fontSize: 12, lineHeight: 19, marginTop: 6 }}>
          {beneficios}
        </Text>
      </ScrollView>

      <View style={{ padding: 14, backgroundColor: '#FFFFFF' }}>
        <Button title="Ir para a página da vaga" onPress={abrirVaga} />
      </View>
    </SafeAreaView>
  );
}
