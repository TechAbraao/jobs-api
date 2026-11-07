import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
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

import {
  addFavoriteJob,
  listFavoriteJobs,
  listJobs,
  loginUser,
  registerUser,
  removeFavoriteJob,
} from './src/services/jobsApi';

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

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
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
    if (session) {
      pesquisarNaGupy();
    }
  }, [session]);

  async function carregarFavoritos(username, role = session?.role) {
    if (!username || role === 'admin') {
      setFavoritos([]);
      return;
    }

    try {
      const favoriteJobs = await listFavoriteJobs(username);
      setFavoritos(normalizeJobs(favoriteJobs));
    } catch (error) {
      console.warn('Não foi possível carregar favoritos:', error.message);
      setFavoritos([]);
    }
  }

  async function handleAuth({ username, password, mode = 'login' }) {
    const trimmedUsername = (username || '').trim();

    if (!trimmedUsername || !(password || '').trim()) {
      setAuthError('Informe usuário e senha para continuar.');
      return;
    }

    try {
      setAuthLoading(true);
      setAuthError('');

      const response = mode === 'register'
        ? await registerUser({ username: trimmedUsername, password, role: 'user' })
        : await loginUser({ username: trimmedUsername, password });

      const user = response?.user ?? response;
      const nextSession = {
        username: user.username,
        role: user.role || 'user',
        user,
      };

      setSession(nextSession);
      await carregarFavoritos(user.username, nextSession.role);
      setTela('Home');
    } catch (error) {
      setAuthError(error.message || 'Não foi possível autenticar o usuário.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function pesquisarNaGupy(termo = busca) {
    if (!session) {
      return;
    }

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

  async function alternarFavorito(vaga) {
    if (session?.role === 'admin' || !session?.username || !vaga?.id) {
      return;
    }

    const jaFavorita = favoritos.some(item => item.id === vaga.id);

    try {
      if (jaFavorita) {
        await removeFavoriteJob(session.username, vaga.id);
        setFavoritos(atual => atual.filter(item => item.id !== vaga.id));
        return;
      }

      await addFavoriteJob(session.username, vaga.id);
      setFavoritos(atual => {
        if (atual.some(item => item.id === vaga.id)) {
          return atual;
        }
        return [...atual, normalizeJob(vaga)];
      });
    } catch (error) {
      console.warn('Não foi possível atualizar favorito:', error.message);
    }
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

  function handleLogout() {
    setSession(null);
    setAuthError('');
    setTela('Welcome');
    setVagas([]);
    setFavoritos([]);
    setVagaSelecionada(null);
  }

  function renderizarTela() {
    if (!session) {
      return (
        <Welcome
          onLogin={handleAuth}
          onRegister={handleAuth}
          loading={authLoading}
          error={authError}
        />
      );
    }

    const canManageFavorites = session.role !== 'admin';

    switch (tela) {
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
            alternarFavorito={canManageFavorites ? alternarFavorito : () => {}}
            abrirDetalhes={abrirDetalhes}
            abrirFiltros={() => setTela('Filters')}
            abrirFavoritos={canManageFavorites ? () => setTela('Favorites') : undefined}
            onOpenAdmin={session.role === 'admin' ? abrirAdmin : null}
            pesquisarNaGupy={pesquisarNaGupy}
            filtros={filtros}
            session={session}
            onLogout={handleLogout}
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
            favorita={canManageFavorites ? ehFavorita(vagaSelecionada) : false}
            onFavorite={canManageFavorites ? () => alternarFavorito(vagaSelecionada) : undefined}
            onBack={voltarParaHome}
          />
        ) : null;

      case 'Favorites':
        if (!canManageFavorites) {
          return (
            <Home
              vagas={vagas}
              busca={busca}
              setBusca={setBusca}
              categoria={categoria}
              setCategoria={setCategoria}
              favoritos={favoritos}
              ehFavorita={ehFavorita}
              alternarFavorito={() => {}}
              abrirDetalhes={abrirDetalhes}
              abrirFiltros={() => setTela('Filters')}
              abrirFavoritos={undefined}
              onOpenAdmin={session.role === 'admin' ? abrirAdmin : null}
              pesquisarNaGupy={pesquisarNaGupy}
              filtros={filtros}
              session={session}
              onLogout={handleLogout}
            />
          );
        }

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
        return session.role === 'admin' ? (
          <AdminJobs onBack={voltarParaHome} />
        ) : (
          <Home
            vagas={vagas}
            busca={busca}
            setBusca={setBusca}
            categoria={categoria}
            setCategoria={setCategoria}
            favoritos={favoritos}
            ehFavorita={ehFavorita}
            alternarFavorito={canManageFavorites ? alternarFavorito : () => {}}
            abrirDetalhes={abrirDetalhes}
            abrirFiltros={() => setTela('Filters')}
            abrirFavoritos={canManageFavorites ? () => setTela('Favorites') : undefined}
            onOpenAdmin={null}
            pesquisarNaGupy={pesquisarNaGupy}
            filtros={filtros}
            session={session}
            onLogout={handleLogout}
          />
        );

      default:
        return (
          <Welcome
            onLogin={handleAuth}
            onRegister={handleAuth}
            loading={authLoading}
            error={authError}
          />
        );
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
