import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Key, Sparkles } from 'lucide-react';
import './AiChat.css';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const STORAGE_KEY = '@ifood-economia:gemini-key';

export default function AiChat({ user, saldo, forecast, economy, limiteDiario }) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Carrega chave de API salva
  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Scroll para o fim das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Foca o input quando o chat abre
  useEffect(() => {
    if (isOpen && apiKey && !showSetup && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, apiKey, showSetup]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const buildSystemPrompt = () => {
    const nome = user?.nome || 'usuário';
    return `Você é o Assistente Financeiro do app iFood Economia, um consultor financeiro pessoal inteligente, amigável e especializado em hábitos de consumo do iFood e delivery.

Dados financeiros atuais de ${nome} (mês corrente):
- Saldo Geral: ${formatCurrency(saldo?.saldoAtual)}
- Receitas do Mês: ${formatCurrency(saldo?.totalReceitas)}
- Despesas do Mês: ${formatCurrency(saldo?.totalDespesas)}
- Gasto Médio Diário Real: ${forecast ? formatCurrency(forecast.gastoMedioDiario) : 'Não disponível'}
- Meta de Gasto Diário Definida pelo Usuário: ${formatCurrency(limiteDiario)}
- Projeção de Gastos para Fim do Mês: ${forecast ? formatCurrency(forecast.gastoProjetadoMensal) : 'Não disponível'}
- Status da Previsão: ${forecast?.statusPrevisao || 'Não disponível'}
- Alerta do Sistema: ${forecast?.alertaMensagem || 'Nenhum'}
- Total Gasto com Alimentação/Delivery/iFood: ${economy ? formatCurrency(economy.gastosAlimentacaoDelivery) : 'Não disponível'}
- Economia Potencial Reduzindo Delivery em 15%: ${economy ? formatCurrency(economy.economiaPotencialIfood) : 'Não disponível'}
- Taxa de Economia Atual: ${economy?.taxaEconomiaAtual || 0}% da renda
- Meta de Economia Sugerida: ${economy?.metaEconomiaSugerida || 20}%

Regras de comportamento:
- Responda SEMPRE em português do Brasil, de forma clara, empática e prática.
- Use os dados acima para dar respostas personalizadas. Cite os valores reais do usuário quando relevante.
- Seja objetivo: máximo 3 parágrafos por resposta. Use emojis com moderação para facilitar a leitura.
- Não invente dados. Se não tiver informação, informe isso claramente.
- Dê dicas acionáveis e específicas. Seja encorajador e motivador.
- Nunca recomende investimentos de risco ou produtos financeiros específicos.
- Se o usuário perguntar algo fora de finanças pessoais, redirecione gentilmente para o foco do app.`;
  };

  const getWelcomeMessage = () =>
    `Olá, **${user?.nome || 'usuário'}**! 👋 Sou seu assistente financeiro pessoal do iFood Economia.\n\nJá analisei seus dados: seu saldo atual é de **${formatCurrency(saldo?.saldoAtual)}** e o status da sua previsão é **${forecast?.statusPrevisao || 'ainda carregando'}**.\n\nComo posso te ajudar hoje? Pode me perguntar sobre seus gastos, como economizar, ou pedir um plano de metas!`;

  const handleOpen = () => {
    setError('');
    setIsOpen(true);
    if (!apiKey) {
      setShowSetup(true);
    } else if (messages.length === 0) {
      setMessages([{ role: 'assistant', text: getWelcomeMessage(), timestamp: new Date() }]);
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const trimmed = tempApiKey.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setApiKey(trimmed);
    setShowSetup(false);
    setError('');
    setMessages([{ role: 'assistant', text: getWelcomeMessage(), timestamp: new Date() }]);
  };

  const handleResetKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setTempApiKey('');
    setMessages([]);
    setShowSetup(true);
    setError('');
  };

  const sendMessage = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || isTyping) return;

    const userMessage = { role: 'user', text, timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setError('');

    // Monta histórico para a API do Gemini
    const history = updatedMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const payload = {
      system_instruction: { parts: [{ text: buildSystemPrompt() }] },
      contents: history,
      generationConfig: { temperature: 0.75, maxOutputTokens: 1024 },
    };

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          setError('Chave de API inválida ou sem permissão. Clique no ícone de chave para reconfigurar.');
        } else if (response.status === 429) {
          setError('Limite de requisições atingido. Aguarde um instante e tente novamente.');
        } else {
          setError(`Erro ao conectar com a IA: ${errData?.error?.message || 'Tente novamente.'}`);
        }
        setIsTyping(false);
        return;
      }

      const data = await response.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Desculpe, não consegui gerar uma resposta agora. Por favor, tente novamente.';
      setMessages((prev) => [...prev, { role: 'assistant', text: aiText, timestamp: new Date() }]);
    } catch {
      setError('Erro de rede. Verifique sua conexão com a internet e tente novamente.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Renderiza texto com negrito básico e quebras de linha
  const renderText = (text) => {
    return text.split('\n').map((line, lineIdx) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={lineIdx}>
          {lineIdx > 0 && <br />}
          {parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={i}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </span>
      );
    });
  };

  const SUGGESTIONS = [
    'Estou gastando muito?',
    'Como economizar no iFood?',
    'Me dê um plano de metas',
  ];

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <button className="ai-chat-fab" onClick={handleOpen} title="Assistente Financeiro IA">
          <Sparkles size={20} />
          <span className="ai-chat-fab-label">IA Financeira</span>
          <div className="ai-chat-fab-pulse" />
        </button>
      )}

      {/* Painel de Chat */}
      <div className={`ai-chat-panel glass-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-info">
            <div className="ai-chat-avatar-icon">
              <Bot size={18} />
            </div>
            <div>
              <div className="ai-chat-title">Assistente Financeiro</div>
              <div className="ai-chat-subtitle">
                <span className="ai-status-dot" />
                Powered by Google Gemini
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {apiKey && (
              <button onClick={handleResetKey} className="ai-icon-btn" title="Reconfigurar chave de API">
                <Key size={14} />
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="ai-icon-btn" title="Fechar">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tela de Configuração de API Key */}
        {showSetup ? (
          <div className="ai-setup-screen">
            <div className="ai-setup-icon-wrap">
              <Sparkles size={28} />
            </div>
            <h3 className="ai-setup-title">Ativar Assistente de IA</h3>
            <p className="ai-setup-desc">
              Cole sua chave de API do Google Gemini abaixo. É <strong>gratuita</strong> e pode ser obtida em:
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="ai-setup-link"
            >
              aistudio.google.com/app/apikey →
            </a>
            <form onSubmit={handleSaveApiKey} className="ai-setup-form">
              <input
                type="password"
                className="input-base"
                placeholder="Cole sua chave aqui: AIza..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                autoFocus
                required
              />
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Sparkles size={16} />
                Ativar Agora
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Histórico de Mensagens */}
            <div className="ai-messages-container">
              {messages.map((msg, i) => (
                <div key={i} className={`ai-msg-row ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="ai-msg-avatar bot">
                      <Bot size={13} />
                    </div>
                  )}
                  <div className={`ai-msg-bubble ${msg.role}`}>{renderText(msg.text)}</div>
                  {msg.role === 'user' && (
                    <div className="ai-msg-avatar user">
                      <User size={13} />
                    </div>
                  )}
                </div>
              ))}

              {/* Indicador de digitando */}
              {isTyping && (
                <div className="ai-msg-row assistant">
                  <div className="ai-msg-avatar bot">
                    <Bot size={13} />
                  </div>
                  <div className="ai-typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              {/* Sugestões rápidas (só quando não há mensagens do usuário ainda) */}
              {messages.length === 1 && !isTyping && (
                <div className="ai-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="ai-suggestion-chip" onClick={() => sendMessage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Mensagem de erro */}
              {error && <div className="ai-error-msg">{error}</div>}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="ai-input-area">
              <textarea
                ref={inputRef}
                className="ai-input"
                placeholder="Pergunte sobre seus gastos... (Enter para enviar)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isTyping}
              />
              <button
                className={`ai-send-btn ${input.trim() && !isTyping ? 'active' : ''}`}
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                title="Enviar (Enter)"
              >
                <Send size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
