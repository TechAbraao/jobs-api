import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { createJob, deleteJob, listJobs, updateJob } from '../services/jobsApi';

const EMPTY_FORM = {
  title: '',
  description: '',
  company: '',
  location: '',
  url: '',
  platform: '',
  salary: '',
};

export default function AdminJobs({ onBack }) {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  async function loadJobs(term = '') {
    try {
      setLoading(true);
      const response = await listJobs({ page: 1, per_page: 50, q: term || undefined });
      setJobs(response.jobs || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Não foi possível carregar as vagas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  function updateField(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  async function handleSubmit() {
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      url: form.url.trim(),
      platform: form.platform.trim(),
      salary: form.salary === '' ? null : Number(form.salary),
    };

    if (!payload.title || !payload.description || !payload.company || !payload.location || !payload.url || !payload.platform) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (Number.isNaN(payload.salary)) {
      setError('O salário deve ser um número válido.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      if (editingId) {
        await updateJob(editingId, payload);
        setSuccess('Vaga atualizada com sucesso.');
      } else {
        await createJob(payload);
        setSuccess('Vaga criada com sucesso.');
      }
      await loadJobs(search);
      resetForm();
    } catch (err) {
      setError(err.message || 'Não foi possível salvar essa vaga.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(job) {
    const id = String(job?.id ?? '').trim();

    if (!id) {
      setError('Não foi possível identificar a vaga para exclusão.');
      console.warn('Delete cancelado: job.id vazio', job);
      return;
    }

    Alert.alert(
      'Remover vaga',
      `Deseja excluir a vaga "${job.title || 'esta vaga'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setError('');
              setSuccess('');
              await deleteJob(id);
              setJobs(current => current.filter(item => String(item.id) !== id));
              setSuccess('Vaga removida com sucesso.');
            } catch (err) {
              setError(err.message || 'Não foi possível excluir a vaga.');
            }
          },
        },
      ],
    );
  }

  function handleEdit(job) {
    setEditingId(job.id);
    setForm({
      title: job.title || '',
      description: job.description || '',
      company: job.company || '',
      location: job.location || '',
      url: job.url || '',
      platform: job.platform || '',
      salary: job.salary == null ? '' : String(job.salary),
    });
    setError('');
    setSuccess('');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0D2347" />
        </TouchableOpacity>
        <Text style={styles.title}>Painel administrativo</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>{editingId ? 'Editar vaga' : 'Adicionar vaga'}</Text>

          <TextInput
            value={form.title}
            onChangeText={value => updateField('title', value)}
            placeholder="Título da vaga"
            style={styles.input}
          />
          <TextInput
            value={form.company}
            onChangeText={value => updateField('company', value)}
            placeholder="Empresa"
            style={styles.input}
          />
          <TextInput
            value={form.location}
            onChangeText={value => updateField('location', value)}
            placeholder="Localização"
            style={styles.input}
          />
          <TextInput
            value={form.platform}
            onChangeText={value => updateField('platform', value)}
            placeholder="Plataforma (LinkedIn, Indeed, etc.)"
            style={styles.input}
          />
          <TextInput
            value={form.url}
            onChangeText={value => updateField('url', value)}
            placeholder="URL da vaga"
            keyboardType="url"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={form.salary}
            onChangeText={value => updateField('salary', value)}
            placeholder="Salário (opcional)"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            value={form.description}
            onChangeText={value => updateField('description', value)}
            placeholder="Descrição"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={[styles.input, styles.textArea]}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={saving}>
              <Text style={styles.primaryButtonText}>{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Adicionar vaga'}</Text>
            </TouchableOpacity>

            {editingId ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={resetForm}>
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Vagas cadastradas</Text>
          <TextInput
            value={search}
            onChangeText={async value => {
              setSearch(value);
              await loadJobs(value);
            }}
            placeholder="Buscar por título ou empresa"
            style={styles.searchInput}
          />
        </View>

        {loading ? (
          <Text style={styles.emptyState}>Carregando vagas...</Text>
        ) : jobs.length === 0 ? (
          <Text style={styles.emptyState}>Nenhuma vaga cadastrada ainda.</Text>
        ) : (
          jobs.map(job => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobMeta}>{job.company}</Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEdit(job)} style={styles.iconButton}>
                    <Ionicons name="create-outline" size={18} color="#0D2347" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(job)} style={styles.iconButton}>
                    <Ionicons name="trash-outline" size={18} color="#C23616" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.jobText}>{job.location}</Text>
              <Text style={styles.jobText}>{job.platform}</Text>
              {job.salary != null ? <Text style={styles.jobSalary}>R$ {Number(job.salary).toLocaleString('pt-BR')}</Text> : null}
              <Text numberOfLines={3} style={styles.jobDescription}>{job.description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF4FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EBF5',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D2347',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D2347',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#DCE5F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 14,
    color: '#182A41',
  },
  textArea: {
    minHeight: 120,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1647C5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    marginLeft: 8,
    backgroundColor: '#EAF0FD',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#1647C5',
    fontWeight: '700',
  },
  errorText: {
    color: '#C23616',
    backgroundColor: '#FFF1F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  successText: {
    color: '#146C43',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  listHeader: {
    marginTop: 22,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5DDEA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6EDF8',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  jobTitle: {
    color: '#102B56',
    fontSize: 16,
    fontWeight: '700',
  },
  jobMeta: {
    color: '#53657B',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  jobText: {
    color: '#42566E',
    fontSize: 13,
    marginBottom: 2,
  },
  jobSalary: {
    color: '#0F7A52',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 6,
  },
  jobDescription: {
    color: '#4E607A',
    fontSize: 12,
    lineHeight: 18,
  },
  emptyState: {
    textAlign: 'center',
    color: '#73839A',
    marginVertical: 18,
  },
});
