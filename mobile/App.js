
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  View,
  Platform,
} from 'react-native';

import Welcome from './src/screens/Welcome';
import Home from './src/screens/Home';
import Filters from './src/screens/Filters';
import JobDetails from './src/screens/JobDetails';
import Favorites from './src/screens/Favorites';
import AdminJobs from './src/screens/AdminJobs';

import { listJobs } from './src/services/jobsApi';

function normalizeJob(job) {
  const title = job?.title || job?.cargo || 'N/A';
  const company = job?.company || job?.empresa || 'N/A';
  const location = job?.location || job?.local || 'N/A';
  const modality = job?.modality || job?.modalidade || 'N/A';
  const category = job?.category || job?.categoria || 'N/A';
  const contract = job?.contract || job?.contrato || 'N/A';
  const level = job?.level || job?.nivel || 'N/A';

  return {
    id: String(job?.id ?? `${company}-${title}`),
    cargo: title,
    empresa: company,
    local: location,
    modalidade: modality,
    categoria: category,
    contrato: contract,
    nivel: level,
    salario: job?.salary ?? job?.salario ?? 'N/A',
    tempo: job?.tempo || 'N/A',
    descricao: job?.description || job?.descricao || 'N/A',
    requisitos: Array.isArray(job?.requirements) && job.requirements.length > 0
      ? job.requirements
      : Array.isArray(job?.requisitos) && job.requisitos.length > 0
        ? job.requisitos
        : ['N/A'],
    beneficios: job?.benefits || job?.beneficios || 'N/A',
    link: job?.url || job?.link || '',
    company: job?.company || company,
    title: job?.title || title,
    location: job?.location || location,
    description: job?.description || job?.descricao || 'N/A',
    platform: job?.platform || 'N/A',
    salary: job?.salary ?? job?.salario ?? null,
  };
}

function normalizeJobs(jobs) {
  return (Array.isArray(jobs) ? jobs : []).map(normalizeJob);
}

export default function App() {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  const [tela, setTela] = useState('Welcome');
  const [vagas, setVagas] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todas');

  const [filtros, setFiltros] = useState({
    modalidade: '',
    localizacao: '',
    contrato: '',
    nivel: '',
    data: '',
  });

  useEffect(() => {
    pesquisarNaGupy();
  }, []);

  async function pesquisarNaGupy(termo = busca) {
    try {
      const params = { q: termo || undefined };

      if (filtros?.localizacao) {
        params.location = filtros.localizacao;
      }

      const response = await listJobs(params);

      setVagas(normalizeJobs(response.jobs || []));
    } catch (error) {
      console.log('Erro na busca:', error.message);
      setVagas([]);
    }
  }

  function alternarFavorito(vaga) {
    setFavoritos(atual =>
      atual.some(item => item.id === vaga.id)
        ? atual.filter(item => item.id !== vaga.id)
        : [...atual, vaga]
    );
  }

  function ehFavorita(vaga) {
    return favoritos.some(item => item.id === vaga.id);
  }

  function abrirDetalhes(vaga) {
    setVagaSelecionada(vaga);
    setTela('JobDetails');
  }

  function voltarParaHome() {
    setTela('Home');
  }

  function abrirAdmin() {
    setTela('AdminJobs');
  }

  function renderizarTela() {
    switch (tela) {
      case 'Welcome':
        return <Welcome onEnter={() => setTela('Home')} onOpenAdmin={abrirAdmin} />;

      case 'Home':
        return (
          <Home
            vagas={vagas}
            busca={busca}
            setBusca={setBusca}
            categoria={categoria}
            setCategoria={setCategoria}
            favoritos={favoritos}
            ehFavorita={ehFavorita}
            alternarFavorito={alternarFavorito}
            abrirDetalhes={abrirDetalhes}
            abrirFiltros={() => setTela('Filters')}
            abrirFavoritos={() => setTela('Favorites')}
            onOpenAdmin={abrirAdmin}
            pesquisarNaGupy={pesquisarNaGupy}
            filtros={filtros}
          />
        );

      case 'Filters':
        return (
          <Filters
            filtros={filtros}
            onBack={voltarParaHome}
            onApply={novosFiltros => {
              setFiltros(novosFiltros);
              setTela('Home');
            }}
          />
        );

      case 'JobDetails':
        return vagaSelecionada ? (
          <JobDetails
            vaga={vagaSelecionada}
            favorita={ehFavorita(vagaSelecionada)}
            onFavorite={() => alternarFavorito(vagaSelecionada)}
            onBack={voltarParaHome}
          />
        ) : null;

      case 'Favorites':
        return (
          <Favorites
            vagas={favoritos}
            ehFavorita={ehFavorita}
            alternarFavorito={alternarFavorito}
            abrirDetalhes={abrirDetalhes}
            voltar={voltarParaHome}
          />
        );

      case 'AdminJobs':
        return <AdminJobs onBack={voltarParaHome} />;

      default:
        return <Welcome onEnter={() => setTela('Home')} onOpenAdmin={abrirAdmin} />;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View
        style={[
          styles.content,
          isTablet && styles.tabletContent,
        ]}
      >
        {renderizarTela()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },

  content: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },

  tabletContent: {
    maxWidth: 900,
  },
});

