
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import JobCard from '../components/JobCard';
import BottomTabs from '../components/BottomTabs';
import Button from '../components/Button';

export default function Favorites({
  vagas,
  ehFavorita,
  alternarFavorito,
  abrirDetalhes,
  voltar,
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F6FC' }}>
      <View style={{ flex: 1, padding: 14 }}>
        <Text style={{ color: '#263249', fontSize: 21, marginTop: 14 }}>
          Suas favoritas
        </Text>

        <Text style={{ color: '#8792A6', fontSize: 11, marginTop: 5 }}>
          Oportunidades salvas para você comparar e se candidatar quando estiver pronta.
        </Text>

        <View
          style={{
            backgroundColor: '#EAF2FF',
            borderRadius: 7,
            padding: 12,
            marginTop: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ color: '#45516A', fontSize: 11 }}>
            {vagas.length} vagas salvas
          </Text>

          <Text style={{ color: '#1647C5', fontSize: 11 }}>
            Mais recentes
          </Text>
        </View>

        {vagas.length === 0 ? (
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 13,
              marginTop: 12,
              marginBottom: 12,
              padding: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: '#EAF2FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="heart-outline" size={25} color="#1647C5" />
            </View>

            <Text style={{ color: '#263249', fontWeight: '700', marginTop: 13 }}>
              Ainda não há favoritos
            </Text>

            <Text
              style={{
                color: '#8792A6',
                fontSize: 11,
                textAlign: 'center',
                lineHeight: 17,
                marginTop: 8,
              }}
            >
              Quando você curtir uma vaga, ela aparecerá aqui para você comparar e se candidatar depois.
            </Text>

            <Button
              title="Explorar vagas"
              onPress={voltar}
              style={{ width: '100%', marginTop: 18 }}
            />
          </View>
        ) : (
          <ScrollView style={{ marginTop: 12 }}>
            {vagas.map(vaga => (
              <JobCard
                key={vaga.id}
                vaga={vaga}
                favorita={ehFavorita(vaga)}
                onPress={() => abrirDetalhes(vaga)}
                onFavorite={() => alternarFavorito(vaga)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <BottomTabs
        active="Favorites"
        onSearch={voltar}
        onFavorites={() => {}}
      />
    </SafeAreaView>
  );
}
