
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import Chip from '../components/Chip';
import Button from '../components/Button';

export default function Filters({ filtros, onBack, onApply }) {
  const [modalidade, setModalidade] = useState(filtros.modalidade);
  const [localizacao, setLocalizacao] = useState(filtros.localizacao);
  const [contrato, setContrato] = useState(filtros.contrato);
  const [nivel, setNivel] = useState(filtros.nivel);
  const [data, setData] = useState(filtros.data);

  function limpar() {
    setModalidade('');
    setLocalizacao('');
    setContrato('');
    setNivel('');
    setData('');
  }

  function grupo(titulo, opcoes, valor, alterar) {
    return (
      <View style={{ marginTop: 17 }}>
        <Text style={{ color: '#344159', fontSize: 12, marginBottom: 9 }}>
          {titulo}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {opcoes.map(opcao => (
            <Chip
              key={opcao}
              label={opcao}
              selected={valor === opcao}
              onPress={() => alterar(valor === opcao ? '' : opcao)}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F6FC' }}>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginVertical: 12,
          }}
        >
          <TouchableOpacity onPress={onBack}>
            <Text style={{ color: '#64718A' }}>Cancelar</Text>
          </TouchableOpacity>

          <Text style={{ color: '#263249', fontWeight: '700', fontSize: 16 }}>
            Filtrar vagas
          </Text>

          <TouchableOpacity onPress={limpar}>
            <Text style={{ color: '#1647C5', fontSize: 12 }}>Limpar</Text>
          </TouchableOpacity>
        </View>

        {grupo(
          'Modalidade',
          ['Remoto', 'Híbrido', 'Presencial'],
          modalidade,
          setModalidade
        )}

        <Text style={{ color: '#344159', fontSize: 12, marginTop: 17, marginBottom: 8 }}>
          Localização
        </Text>

        <TextInput
          value={localizacao}
          onChangeText={setLocalizacao}
          placeholder="Cidade, estado ou país"
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E4E9F2',
            borderRadius: 7,
            paddingHorizontal: 11,
            height: 43,
            fontSize: 12,
          }}
        />

        {grupo(
          'Tipo de contrato',
          ['CLT', 'PJ', 'Produto', 'Estágio', 'Jovem Aprendiz'],
          contrato,
          setContrato
        )}

        {grupo(
          'Nível de experiência',
          ['Júnior', 'Pleno', 'Sênior', 'Liderança'],
          nivel,
          setNivel
        )}

        {grupo(
          'Data de publicação',
          ['24 horas', '7 dias', '30 dias', 'Antigos'],
          data,
          setData
        )}
      </ScrollView>

      <View style={{ padding: 14, backgroundColor: '#F3F6FC' }}>
        <Button
          title="Aplicar filtros"
          onPress={() =>
            onApply({
              modalidade,
              localizacao,
              contrato,
              nivel,
              data,
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}
