
const GUPY_API_URL = '';

export async function buscarVagasNaGupy(filtros = {}) {
  if (!GUPY_API_URL) {
    console.log('Configure a URL da API da Gupy.');
    return [];
  }

  const parametros = new URLSearchParams();

  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor) {
      parametros.append(chave, valor);
    }
  });

  const response = await fetch(
    `${GUPY_API_URL}?${parametros.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  const dados = await response.json();

  const lista = Array.isArray(dados)
    ? dados
    : dados.jobs || dados.results || [];

  return lista.map((item, index) => ({
    id: String(item.id || item.code || index),
    cargo: item.name || item.title || 'Vaga sem título',
    empresa: item.companyName || item.company?.name || 'Empresa',
    local: item.city || item.location || 'Não informado',
    modalidade: item.workplaceType || 'Remoto',
    categoria: item.category || 'Todas',
    contrato: item.contractType || '',
    nivel: item.seniority || '',
    salario: item.salary || 'Não informado',
    tempo: '',
    descricao: item.description || 'Descrição não informada.',
    requisitos: item.requirements || [],
    beneficios: item.benefits || 'Não informado',
    link: item.applicationUrl || item.url || '',
  }));
}
