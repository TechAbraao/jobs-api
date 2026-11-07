
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import JobCard from '../components/JobCard';
import BottomTabs from '../components/BottomTabs';
import Chip from '../components/Chip';

const BLUE = '#1647C5';

export default function Home({
  vagas,
  busca,
  setBusca,
  categoria,
  setCategoria,
  ehFavorita,
  alternarFavorito,
  abrirDetalhes,
  abrirFiltros,
  abrirFavoritos,
  onOpenAdmin,
  pesquisarNaGupy,
  filtros,
  session,
  onLogout,
}) {
  const canManageFavorites = session?.role !== 'admin';
  const filtradas = vagas.filter(vaga => {
    const termo = busca.toLowerCase();

    useEffect(() => {
      document.title = "HubJobs | Vagas";
    }, []);

    const correspondeBusca =
      vaga.cargo.toLowerCase().includes(termo) ||
      vaga.empresa.toLowerCase().includes(termo);

    const correspondeCategoria =
      categoria === 'Todas' || vaga.categoria === categoria;

    const correspondeModalidade =
      !filtros.modalidade || vaga.modalidade === filtros.modalidade;

    const correspondeLocal =
      !filtros.localizacao ||
      vaga.local.toLowerCase().includes(filtros.localizacao.toLowerCase()) ||
      vaga.local === 'Brasil';

    const correspondeContrato =
      !filtros.contrato || vaga.contrato === filtros.contrato;

    const correspondeNivel =
      !filtros.nivel || vaga.nivel === filtros.nivel;

    return (
      correspondeBusca &&
      correspondeCategoria &&
      correspondeModalidade &&
      correspondeLocal &&
      correspondeContrato &&
      correspondeNivel
    );
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F6FC' }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12,
          }}
        >
          <View>
            <Text style={{ color: '#8792A6', fontSize: 14 }}>
              {session?.role === 'admin' ? 'Administrador' : 'Usuário'}
            </Text>
            <Text style={{ color: '#1D3C75', fontSize: 18 }}>
              Olá, {session?.username || 'Usuário'}
            </Text>
          </View>

          {onLogout ? (
            <TouchableOpacity onPress={onLogout} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#E8ECF5' }}>
              <Text style={{ color: '#082347', fontSize: 11, fontWeight: '700' }}>Sair</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={{ color: '#1D3C75', fontSize: 18, marginTop: 6 }}>
          Encontre sua vaga
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TextInput
            value={busca}
            onChangeText={setBusca}
            onSubmitEditing={() => pesquisarNaGupy(busca)}
            placeholder="Cargo, habilidade ou empresa"
            returnKeyType="search"
            style={{
              flex: 1,
              height: 42,
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 11,
              fontSize: 11,
              marginRight: 6,
            }}
          />

          <TouchableOpacity
            onPress={abrirFiltros}
            style={{
              width: 42,
              backgroundColor: BLUE,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="options-outline" size={21} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {session?.role === 'admin' && onOpenAdmin ? (
          <TouchableOpacity
            onPress={onOpenAdmin}
            style={{
              backgroundColor: '#EAF1FF',
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              marginTop: 12,
              borderWidth: 1,
              borderColor: '#CFE0FF',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="briefcase-outline" size={18} color={BLUE} />
              <Text style={{ color: '#0D2347', fontWeight: '700', marginLeft: 8 }}>
                Cadastrar vagas
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={BLUE} />
          </TouchableOpacity>
        ) : null}

        <View style={{ flexDirection: 'row', marginTop: 12, flexWrap: 'wrap' }}>
          {['Todas', 'Produto', 'Engenharia', 'Dados'].map(item => (
            <Chip
              key={item}
              label={item}
              selected={categoria === item}
              onPress={() => setCategoria(item)}
            />
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 7,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#243C68', fontSize: 13 }}>
            Vagas recomendadas
          </Text>
          <Text style={{ color: '#8792A6', fontSize: 10 }}>
            {filtradas.length} vagas
          </Text>
        </View>

        {filtradas.map(vaga => (
          <JobCard
            key={vaga.id}
            vaga={vaga}
            favorita={canManageFavorites ? ehFavorita(vaga) : false}
            onPress={() => abrirDetalhes(vaga)}
            onFavorite={canManageFavorites ? () => alternarFavorito(vaga) : undefined}
          />
        ))}

        {filtradas.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#8792A6', marginTop: 30 }}>
            Nenhuma vaga encontrada com esses critérios.
          </Text>
        )}
      </ScrollView>

      <BottomTabs
        active="Home"
        onSearch={() => { }}
        onFavorites={abrirFavoritos}
        onAdmin={onOpenAdmin}
      />
    </SafeAreaView>
  );
}
