import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  FolderTree,
  Lightbulb,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  X,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Utensils,
  Home,
  Car,
  Gamepad2,
  HeartPulse,
  BookOpen,
  MoreHorizontal,
  DollarSign,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Search,
  ChevronRight,
  Percent
} from 'lucide-react';
import api from '../services/api';
import AiChat from '../components/AiChat';
import './Dashboard.css';

// Mapeia ícones do banco de dados (Bootstrap Icons) para componentes Lucide
const iconMap = {
  'cash-stack': DollarSign,
  'graph-up-arrow': TrendingUp,
  'plus-circle': PlusCircle,
  'egg-fried': Utensils,
  'car-front': Car,
  'house': Home,
  'controller': Gamepad2,
  'heart-pulse': HeartPulse,
  'book': BookOpen,
  'three-dots': MoreHorizontal,
  'wallet2': Wallet
};

const getIconComponent = (iconName) => {
  return iconMap[iconName] || Wallet;
};

// Cores pré-definidas elegantes para novas categorias
const PRESET_COLORS = [
  '#ea1d2c', // Vermelho iFood
  '#10b981', // Verde Esmeralda
  '#3b82f6', // Azul Royal
  '#f59e0b', // Amarelo Ouro
  '#8b5cf6', // Violeta
  '#ec4899', // Rosa
  '#14b8a6', // Teal
  '#6b7280'  // Cinza
];

// Ícones disponíveis para criação de categoria
const PRESET_ICONS = [
  { name: 'egg-fried', label: 'Comida/Bebida', icon: Utensils },
  { name: 'car-front', label: 'Transporte', icon: Car },
  { name: 'house', label: 'Moradia', icon: Home },
  { name: 'controller', label: 'Lazer', icon: Gamepad2 },
  { name: 'heart-pulse', label: 'Saúde', icon: HeartPulse },
  { name: 'book', label: 'Educação', icon: BookOpen },
  { name: 'cash-stack', label: 'Financeiro', icon: DollarSign },
  { name: 'three-dots', label: 'Outros', icon: MoreHorizontal }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // States de dados
  const [saldo, setSaldo] = useState({ totalReceitas: 0, totalDespesas: 0, saldoAtual: 0 });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [economy, setEconomy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros de transação
  const [filterText, setFilterText] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');

  // Modais
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // Configuração de Limite Diário
  const [limiteDiario, setLimiteDiario] = useState(50.0);
  const [tempLimiteDiario, setTempLimiteDiario] = useState('');

  // Form Fields - Transação
  const [txDescricao, setTxDescricao] = useState('');
  const [txValor, setTxValor] = useState('');
  const [txData, setTxData] = useState(new Date().toISOString().split('T')[0]);
  const [txTipo, setTxTipo] = useState('Despesa');
  const [txCategoriaId, setTxCategoriaId] = useState('');

  // Form Fields - Categoria
  const [catNome, setCatNome] = useState('');
  const [catTipo, setCatTipo] = useState('Despesa');
  const [catCor, setCatCor] = useState(PRESET_COLORS[0]);
  const [catIcone, setCatIcone] = useState(PRESET_ICONS[0].name);

  // Verifica Autenticação
  useEffect(() => {
    const token = localStorage.getItem('@ifood-economia:token');
    const storedUser = localStorage.getItem('@ifood-economia:user');
    
    if (!token || !storedUser) {
      localStorage.clear();
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  // Carrega Limite Diário persistido por usuário
  useEffect(() => {
    if (user && user.email) {
      const storedLimit = localStorage.getItem(`@ifood-economia:limite-diario:${user.email}`);
      if (storedLimit) {
        setLimiteDiario(parseFloat(storedLimit));
      } else {
        setLimiteDiario(50.0); // Valor padrão inicial
      }
    }
  }, [user]);

  // Carrega todas as informações do Dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Carrega saldo
      const saldoRes = await api.get('/transacoes/saldo');
      setSaldo(saldoRes.data);

      // Carrega categorias (útil para dropdowns e aba de categorias)
      const catRes = await api.get('/categorias');
      setCategories(catRes.data);
      if (catRes.data.length > 0 && !txCategoriaId) {
        // Define uma categoria padrão no form
        setTxCategoriaId(catRes.data[0].id);
      }

      // Carrega previsão
      const prevRes = await api.get('/planejamento/previsao-mensal');
      setForecast(prevRes.data);

      // Carrega metas e dicas de economia
      const econRes = await api.get('/planejamento/economia');
      setEconomy(econRes.data);

      // Carrega transações (com filtros aplicados se houver)
      await loadTransactions();
      
    } catch (err) {
      console.error(err);
      setError('Falha ao carregar dados do Dashboard. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega transações separadamente para permitir filtros rápidos
  const loadTransactions = async () => {
    try {
      const params = {};
      if (filterDataInicio) params.dataInicio = filterDataInicio;
      if (filterDataFim) params.dataFim = filterDataFim;
      if (filterTipo) params.tipo = filterTipo;
      if (filterCategoria) params.categoriaId = parseInt(filterCategoria);

      const txRes = await api.get('/transacoes', { params });
      setTransactions(txRes.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao filtrar transações.');
    }
  };

  // Dispara filtros de transação
  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [filterTipo, filterCategoria, filterDataInicio, filterDataFim]);

  // Dispara recarga geral ao mudar de aba ou iniciar
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, activeTab]);

  // Efetua Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Limpa filtros
  const handleClearFilters = () => {
    setFilterText('');
    setFilterTipo('');
    setFilterCategoria('');
    setFilterDataInicio('');
    setFilterDataFim('');
  };

  // Abre Modal para Adicionar Transação
  const handleOpenAddTx = () => {
    setEditingTx(null);
    setTxDescricao('');
    setTxValor('');
    setTxData(new Date().toISOString().split('T')[0]);
    setTxTipo('Despesa');
    
    // Tenta selecionar a primeira categoria correspondente ao tipo
    const filteredCats = categories.filter(c => c.tipo === 'Despesa');
    if (filteredCats.length > 0) {
      setTxCategoriaId(filteredCats[0].id);
    } else if (categories.length > 0) {
      setTxCategoriaId(categories[0].id);
    }
    
    setIsTxModalOpen(true);
  };

  // Abre Modal para Editar Transação
  const handleOpenEditTx = (tx) => {
    setEditingTx(tx);
    setTxDescricao(tx.descricao);
    setTxValor(tx.valor);
    setTxData(tx.data.split('T')[0]);
    setTxTipo(tx.tipo);
    setTxCategoriaId(tx.categoriaId);
    setIsTxModalOpen(true);
  };

  // Atualiza categorias selecionáveis no modal conforme o tipo (Receita/Despesa)
  useEffect(() => {
    const filteredCats = categories.filter(c => c.tipo === txTipo);
    if (filteredCats.length > 0) {
      // Se a categoria selecionada atualmente não for do tipo novo, atualiza
      const currentCat = categories.find(c => c.id === parseInt(txCategoriaId));
      if (!currentCat || currentCat.tipo !== txTipo) {
        setTxCategoriaId(filteredCats[0].id);
      }
    }
  }, [txTipo, categories, txCategoriaId]);

  // Envio do formulário de Transação (Criar ou Atualizar)
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!txDescricao || !txValor || !txCategoriaId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const payload = {
      descricao: txDescricao,
      valor: parseFloat(txValor),
      data: new Date(txData).toISOString(),
      tipo: txTipo,
      categoriaId: parseInt(txCategoriaId)
    };

    try {
      if (editingTx) {
        await api.put(`/transacoes/${editingTx.id}`, payload);
      } else {
        await api.post('/transacoes', payload);
      }
      setIsTxModalOpen(false);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.mensagem || 'Erro ao salvar transação.');
    }
  };

  // Excluir Transação
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;
    try {
      await api.delete(`/transacoes/${id}`);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir transação.');
    }
  };

  // Envio do formulário de Categoria
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catNome) {
      alert('O nome da categoria é obrigatório.');
      return;
    }

    const payload = {
      nome: catNome,
      tipo: catTipo,
      corHex: catCor,
      icone: catIcone
    };

    try {
      await api.post('/categorias', payload);
      setIsCatModalOpen(false);
      setCatNome('');
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.mensagem || 'Erro ao criar categoria.');
    }
  };

  // Excluir Categoria Customizada
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Excluir esta categoria? Isso não afetará transações já registradas em outras categorias.')) return;
    try {
      await api.delete(`/categorias/${id}`);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.mensagem || 'Erro ao excluir categoria. Certifique-se de que não há transações associadas.');
    }
  };

  // Limite Diário de Gastos
  const handleOpenLimitModal = () => {
    setTempLimiteDiario(limiteDiario.toString());
    setIsLimitModalOpen(true);
  };

  const handleSaveLimit = (e) => {
    e.preventDefault();
    const val = parseFloat(tempLimiteDiario);
    if (isNaN(val) || val <= 0) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }
    setLimiteDiario(val);
    if (user && user.email) {
      localStorage.setItem(`@ifood-economia:limite-diario:${user.email}`, val.toString());
    }
    setIsLimitModalOpen(false);
  };

  // Transações filtradas por texto na interface (para busca incremental local)
  const displayedTransactions = transactions.filter(t => 
    t.descricao.toLowerCase().includes(filterText.toLowerCase()) ||
    t.categoriaNome.toLowerCase().includes(filterText.toLowerCase())
  );

  // Formatação de Dinheiro
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Formatação de data amigável
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  // Determinar ícone de status de previsão
  const getForecastIcon = (status) => {
    if (status === 'Dentro do Planejado') return <CheckCircle size={20} className="text-emerald" />;
    if (status?.includes('Atenção') || status === 'Defina sua receita') return <HelpCircle size={20} style={{ color: '#f1c40f' }} />;
    return <AlertTriangle size={20} style={{ color: 'var(--ifood-red)' }} />;
  };

  const getForecastClass = (status) => {
    if (status === 'Dentro do Planejado') return 'success';
    if (status?.includes('Atenção') || status === 'Defina sua receita') return 'warning';
    return 'danger';
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Top Glass Navbar */}
      <header className="dashboard-navbar">
        <div className="nav-brand">
          <TrendingUp className="nav-logo" size={28} strokeWidth={2.5} />
          <span>iFood Economia</span>
        </div>
        
        <div className="nav-user">
          <div className="user-info">
            <div className="user-name">{user.nome}</div>
            <div className="user-email">{user.email}</div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-content animate-fade-in-up">
        {error && <div className="error-message">{error}</div>}

        {/* Tab Navigation */}
        <nav className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            Visão Geral
          </button>
          <button 
            className={`tab-button ${activeTab === 'transacoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('transacoes')}
          >
            <Receipt size={18} />
            Transações
          </button>
          <button 
            className={`tab-button ${activeTab === 'categorias' ? 'active' : ''}`}
            onClick={() => setActiveTab('categorias')}
          >
            <FolderTree size={18} />
            Categorias
          </button>
          <button 
            className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <Lightbulb size={18} />
            iFood Insights
          </button>
        </nav>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            Carregando dados da plataforma...
          </div>
        ) : (
          <>
            {/* ================= TAB 1: OVERVIEW ================= */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Financial KPI Cards */}
                <section className="overview-grid">
                  <div className="glass-panel card-finance card-saldo">
                    <div className="card-finance-header">
                      <span className="card-finance-title">Saldo Geral</span>
                      <div className="card-finance-icon">
                        <Wallet size={20} />
                      </div>
                    </div>
                    <div className="card-finance-value">{formatCurrency(saldo.saldoAtual)}</div>
                  </div>

                  <div className="glass-panel card-finance card-receita">
                    <div className="card-finance-header">
                      <span className="card-finance-title">Receitas do Mês</span>
                      <div className="card-finance-icon">
                        <ArrowUpRight size={20} />
                      </div>
                    </div>
                    <div className="card-finance-value">{formatCurrency(saldo.totalReceitas)}</div>
                  </div>

                  <div className="glass-panel card-finance card-despesa">
                    <div className="card-finance-header">
                      <span className="card-finance-title">Despesas do Mês</span>
                      <div className="card-finance-icon">
                        <ArrowDownRight size={20} />
                      </div>
                    </div>
                    <div className="card-finance-value">{formatCurrency(saldo.totalDespesas)}</div>
                  </div>
                </section>

                {/* Planning Details (Forecast & Goals) */}
                <section className="planning-grid">
                  
                  {/* Forecast Forecast */}
                  {forecast && (
                    <div className="glass-panel panel-forecast">
                      <div className="forecast-title-row">
                        <div className="forecast-title">
                          <TrendingUp size={20} className="text-secondary" />
                          Previsão e Ritmo de Gastos
                        </div>
                        <span className={`badge-status ${getForecastClass(forecast.statusPrevisao)}`}>
                          {forecast.statusPrevisao}
                        </span>
                      </div>

                      <div className="forecast-stats">
                        <div className="stat-item">
                          <span className="stat-label">Gasto Médio Diário</span>
                          <span className="stat-value">{formatCurrency(forecast.gastoMedioDiario)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Projeção p/ Fim do Mês</span>
                          <span className="stat-value">{formatCurrency(forecast.gastoProjetadoMensal)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Dias Decorridos</span>
                          <span className="stat-value">{forecast.diasDecorridos} de {forecast.diasNoMes}</span>
                        </div>
                      </div>

                      <div className={`forecast-message ${getForecastClass(forecast.statusPrevisao)}`}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          {getForecastIcon(forecast.statusPrevisao)}
                          <span className="dica-text" style={{ marginTop: '-2px' }}>{forecast.alertaMensagem}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Circular Savings Goal Meter */}
                  {economy && (
                    <div className="glass-panel panel-goal">
                      <div className="goal-title">Metas de Economia</div>
                      <div className="goal-progress-container">
                        <div 
                          className="circular-progress" 
                          style={{ '--progress-percent': Math.min(100, Math.max(0, economy.taxaEconomiaAtual)) }}
                        >
                          <div className="circular-progress-text">
                            {economy.taxaEconomiaAtual}%
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 600, color: 'var(--emerald)' }}>
                        Renda Economizada
                      </div>
                      <div className="goal-details">
                        <div>
                          <span>Economizado: </span>
                          <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(economy.valorEconomizado)}</strong>
                        </div>
                        <div>
                          <span>Meta Sugerida ({economy.metaEconomiaSugerida}%): </span>
                          <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(economy.valorMetaSugerida)}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Daily Budget Limit Card */}
                  <div className="glass-panel panel-limit">
                    <div className="limit-header">
                      <span className="limit-title">Meta de Gasto Diário</span>
                      <button 
                        onClick={handleOpenLimitModal} 
                        className="btn-edit-limit" 
                        title="Configurar Limite Diário"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>

                    <div className="limit-comparison">
                      <div className="limit-metric-box">
                        <span className="limit-metric-label">Definido</span>
                        <span className="limit-metric-value">{formatCurrency(limiteDiario)}</span>
                      </div>
                      <div className="limit-divider" />
                      <div className="limit-metric-box">
                        <span className="limit-metric-label">Média Real</span>
                        <span className="limit-metric-value real-spend">
                          {forecast ? formatCurrency(forecast.gastoMedioDiario) : 'R$ 0,00'}
                        </span>
                      </div>
                    </div>

                    {forecast && (
                      <div className="limit-progress-wrapper">
                        <div className="limit-progress-labels">
                          <span>Uso do Limite</span>
                          <span>{limiteDiario > 0 ? Math.round((forecast.gastoMedioDiario / limiteDiario) * 100) : 0}%</span>
                        </div>
                        <div className="limit-progress-bar-bg">
                          <div 
                            className={`limit-progress-bar-fill ${forecast.gastoMedioDiario > limiteDiario ? 'exceeded' : 'within'}`}
                            style={{ width: `${Math.min(100, limiteDiario > 0 ? (forecast.gastoMedioDiario / limiteDiario) * 100 : 0)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {forecast && (
                      <div className={`limit-status-badge ${forecast.gastoMedioDiario > limiteDiario ? 'danger' : 'success'}`}>
                        {forecast.gastoMedioDiario > limiteDiario ? (
                          <>
                            <AlertTriangle size={14} />
                            <span>Excedido em {formatCurrency(forecast.gastoMedioDiario - limiteDiario)}/dia</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} />
                            <span>Dentro da Meta (Economiza {formatCurrency(limiteDiario - forecast.gastoMedioDiario)}/dia)</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* Recent Transactions List */}
                <section style={{ marginTop: '12px' }}>
                  <div className="section-header">
                    <h2 className="section-title">Transações Recentes</h2>
                    <button onClick={handleOpenAddTx} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      <Plus size={16} /> Adicionar Transação
                    </button>
                  </div>
                  
                  {displayedTransactions.length === 0 ? (
                    <div className="empty-state">
                      <p className="empty-state-text">Nenhuma transação cadastrada no momento.</p>
                      <button onClick={handleOpenAddTx} className="btn-secondary">Cadastrar Primeira Transação</button>
                    </div>
                  ) : (
                    <div className="recent-transactions">
                      {displayedTransactions.slice(0, 5).map((t) => {
                        const Icon = getIconComponent(t.categoriaIcone);
                        return (
                          <div key={t.id} className="transaction-item">
                            <div className="t-info">
                              <div 
                                className="t-category-icon"
                                style={{ backgroundColor: `${t.categoriaCorHex}20`, color: t.categoriaCorHex, border: `1px solid ${t.categoriaCorHex}40` }}
                              >
                                <Icon size={20} />
                              </div>
                              <div className="t-details">
                                <span className="t-desc">{t.descricao}</span>
                                <div className="t-meta">
                                  <span className="t-category-badge" style={{ backgroundColor: `${t.categoriaCorHex}25`, color: t.categoriaCorHex }}>
                                    {t.categoriaNome}
                                  </span>
                                  <span>•</span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={12} />
                                    {formatDate(t.data)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="t-value-col">
                              <span className={`t-value ${t.tipo.toLowerCase()}`}>
                                {t.tipo === 'Receita' ? '+' : '-'} {formatCurrency(t.valor)}
                              </span>
                              <div className="t-actions">
                                <button onClick={() => handleOpenEditTx(t)} className="btn-action-sm" title="Editar">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteTransaction(t.id)} className="btn-action-sm delete" title="Excluir">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {displayedTransactions.length > 5 && (
                        <button 
                          onClick={() => setActiveTab('transacoes')}
                          className="btn-secondary" 
                          style={{ alignSelf: 'center', marginTop: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
                        >
                          Ver Todas as Transações
                        </button>
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ================= TAB 2: TRANSACTIONS ================= */}
            {activeTab === 'transacoes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="section-header">
                  <h2 className="section-title">Gerenciador de Transações</h2>
                  <button onClick={handleOpenAddTx} className="btn-primary">
                    <Plus size={18} /> Nova Transação
                  </button>
                </div>

                {/* Filters Row */}
                <div className="glass-panel" style={{ padding: '16px 24px' }}>
                  <div className="filters-bar">
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                      <input 
                        type="text" 
                        placeholder="Pesquisar descrição ou categoria..."
                        className="filter-input"
                        style={{ paddingLeft: '36px', width: '100%' }}
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                      />
                      <Search size={16} className="text-secondary" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                    </div>

                    <select 
                      className="filter-select" 
                      value={filterTipo} 
                      onChange={(e) => setFilterTipo(e.target.value)}
                    >
                      <option value="">Todos os Tipos</option>
                      <option value="Receita">Apenas Receitas</option>
                      <option value="Despesa">Apenas Despesas</option>
                    </select>

                    <select 
                      className="filter-select" 
                      value={filterCategoria} 
                      onChange={(e) => setFilterCategoria(e.target.value)}
                    >
                      <option value="">Todas as Categorias</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome} ({c.tipo})</option>
                      ))}
                    </select>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="date" 
                        className="filter-input" 
                        value={filterDataInicio}
                        onChange={(e) => setFilterDataInicio(e.target.value)}
                        placeholder="Início" 
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>até</span>
                      <input 
                        type="date" 
                        className="filter-input" 
                        value={filterDataFim}
                        onChange={(e) => setFilterDataFim(e.target.value)}
                        placeholder="Fim" 
                      />
                    </div>

                    {(filterText || filterTipo || filterCategoria || filterDataInicio || filterDataFim) && (
                      <button onClick={handleClearFilters} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                {/* Transactions List */}
                {displayedTransactions.length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-state-text">Nenhuma transação encontrada com os filtros selecionados.</p>
                    <button onClick={handleOpenAddTx} className="btn-secondary">Adicionar Transação</button>
                  </div>
                ) : (
                  <div className="recent-transactions">
                    {displayedTransactions.map((t) => {
                      const Icon = getIconComponent(t.categoriaIcone);
                      return (
                        <div key={t.id} className="transaction-item">
                          <div className="t-info">
                            <div 
                              className="t-category-icon"
                              style={{ backgroundColor: `${t.categoriaCorHex}20`, color: t.categoriaCorHex, border: `1px solid ${t.categoriaCorHex}40` }}
                            >
                              <Icon size={20} />
                            </div>
                            <div className="t-details">
                              <span className="t-desc">{t.descricao}</span>
                              <div className="t-meta">
                                <span className="t-category-badge" style={{ backgroundColor: `${t.categoriaCorHex}25`, color: t.categoriaCorHex }}>
                                  {t.categoriaNome}
                                </span>
                                <span>•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Calendar size={12} />
                                  {formatDate(t.data)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="t-value-col">
                            <span className={`t-value ${t.tipo.toLowerCase()}`}>
                              {t.tipo === 'Receita' ? '+' : '-'} {formatCurrency(t.valor)}
                            </span>
                            <div className="t-actions">
                              <button onClick={() => handleOpenEditTx(t)} className="btn-action-sm" title="Editar">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeleteTransaction(t.id)} className="btn-action-sm delete" title="Excluir">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 3: CATEGORIES ================= */}
            {activeTab === 'categorias' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Gerenciar Categorias</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Categorias padrão do sistema e customizadas criadas por você.
                    </p>
                  </div>
                  <button onClick={() => setIsCatModalOpen(true)} className="btn-primary">
                    <Plus size={18} /> Nova Categoria
                  </button>
                </div>

                <div className="categories-grid">
                  {categories.map((c) => {
                    const IconComponent = getIconComponent(c.icone);
                    const isCustom = c.usuarioId !== null;

                    return (
                      <div key={c.id} className="glass-panel category-card" style={{ borderTop: `4px solid ${c.corHex}` }}>
                        <div 
                          className="category-card-icon"
                          style={{ backgroundColor: `${c.corHex}15`, color: c.corHex, border: `1px solid ${c.corHex}30` }}
                        >
                          <IconComponent size={24} />
                        </div>
                        <span className="category-card-name">{c.nome}</span>
                        <span className="category-card-type">{c.tipo}</span>
                        
                        {isCustom ? (
                          <button 
                            onClick={() => handleDeleteCategory(c.id)}
                            className="btn-action-sm delete category-delete-btn"
                            title="Excluir Categoria"
                          >
                            <X size={14} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>
                            Padrão
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= TAB 4: INSIGHTS ================= */}
            {activeTab === 'insights' && economy && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <h2 className="section-title">iFood Insights & Dicas</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Análise inteligente de gastos focada em alimentação, delivery e hábitos financeiros.
                  </p>
                </div>

                <div className="insights-intro-row">
                  <div className="glass-panel panel-insights-kpi">
                    <div className="kpi-icon-wrap alimentacao">
                      <Utensils size={28} />
                    </div>
                    <div className="kpi-info">
                      <span className="kpi-title">Gastos com Alimentação / iFood</span>
                      <span className="kpi-value">{formatCurrency(economy.gastosAlimentacaoDelivery)}</span>
                    </div>
                  </div>

                  <div className="glass-panel panel-insights-kpi">
                    <div className="kpi-icon-wrap economia">
                      <Percent size={28} />
                    </div>
                    <div className="kpi-info">
                      <span className="kpi-title">Economia Potencial (15%)</span>
                      <span className="kpi-value">{formatCurrency(economy.economiaPotencialIfood)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Recomendações Personalizadas</h3>
                  <div className="dicas-container">
                    {economy.dicasEconomia && economy.dicasEconomia.map((dica, index) => (
                      <div key={index} className="dica-card">
                        <div className="dica-icon">
                          <Lightbulb size={18} />
                        </div>
                        <div className="dica-text">{dica}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ================= MODAL: TRANSACTION ================= */}
      {isTxModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTx ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <button onClick={() => setIsTxModalOpen(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="modal-form">
              <div className="input-group">
                <label htmlFor="txDescricao">Descrição *</label>
                <input 
                  id="txDescricao"
                  type="text" 
                  className="input-base"
                  placeholder="Ex: Compra iFood / Salário"
                  value={txDescricao}
                  onChange={(e) => setTxDescricao(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="txValor">Valor (R$) *</label>
                  <input 
                    id="txValor"
                    type="number" 
                    step="0.01"
                    min="0.01"
                    className="input-base"
                    placeholder="0.00"
                    value={txValor}
                    onChange={(e) => setTxValor(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="txData">Data *</label>
                  <input 
                    id="txData"
                    type="date" 
                    className="input-base"
                    value={txData}
                    onChange={(e) => setTxData(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="txTipo">Tipo *</label>
                  <select 
                    id="txTipo"
                    className="filter-select"
                    style={{ height: '46px', borderRadius: 'var(--radius-md)', padding: '0 16px' }}
                    value={txTipo}
                    onChange={(e) => setTxTipo(e.target.value)}
                  >
                    <option value="Despesa">Despesa</option>
                    <option value="Receita">Receita</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="txCategoriaId">Categoria *</label>
                  <select 
                    id="txCategoriaId"
                    className="filter-select"
                    style={{ height: '46px', borderRadius: 'var(--radius-md)', padding: '0 16px' }}
                    value={txCategoriaId}
                    onChange={(e) => setTxCategoriaId(e.target.value)}
                    required
                  >
                    {categories
                      .filter(c => c.tipo === txTipo)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsTxModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingTx ? 'Salvar Alterações' : 'Confirmar Transação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CATEGORY ================= */}
      {isCatModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Nova Categoria</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="modal-form">
              <div className="input-group">
                <label htmlFor="catNome">Nome da Categoria *</label>
                <input 
                  id="catNome"
                  type="text" 
                  className="input-base"
                  placeholder="Ex: Assinaturas, Mercado"
                  value={catNome}
                  onChange={(e) => setCatNome(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="catTipo">Tipo *</label>
                <select 
                  id="catTipo"
                  className="filter-select"
                  style={{ height: '46px', borderRadius: 'var(--radius-md)', padding: '0 16px' }}
                  value={catTipo}
                  onChange={(e) => setCatTipo(e.target.value)}
                >
                  <option value="Despesa">Despesa</option>
                  <option value="Receita">Receita</option>
                </select>
              </div>

              {/* Color Preset Picker */}
              <div className="input-group">
                <label>Cor de Destaque</label>
                <div className="color-picker-grid">
                  {PRESET_COLORS.map((c) => (
                    <div 
                      key={c}
                      className={`color-option ${catCor === c ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setCatCor(c)}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Picker */}
              <div className="input-group">
                <label>Ícone Representativo</label>
                <div className="icon-picker-grid">
                  {PRESET_ICONS.map((item) => {
                    const PresetIconComponent = item.icon;
                    return (
                      <button 
                        key={item.name}
                        type="button"
                        className={`icon-option ${catIcone === item.name ? 'selected' : ''}`}
                        title={item.label}
                        onClick={() => setCatIcone(item.name)}
                      >
                        <PresetIconComponent size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LIMIT ================= */}
      {isLimitModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Meta de Gasto Diário</h3>
              <button onClick={() => setIsLimitModalOpen(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLimit} className="modal-form">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Defina o valor máximo que você deseja gastar por dia. Isso ajudará você a acompanhar sua média diária real e economizar mais dinheiro.
              </p>

              <div className="input-group">
                <label htmlFor="limitValor">Quanto você quer gastar por dia? (R$) *</label>
                <input 
                  id="limitValor"
                  type="number" 
                  step="0.01"
                  min="0.01"
                  className="input-base"
                  placeholder="0.00"
                  value={tempLimiteDiario}
                  onChange={(e) => setTempLimiteDiario(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsLimitModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar Limite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= AI CHAT WIDGET ================= */}
      <AiChat
        user={user}
        saldo={saldo}
        forecast={forecast}
        economy={economy}
        limiteDiario={limiteDiario}
      />
    </div>
  );
}
