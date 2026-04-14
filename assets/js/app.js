import LoginView from "./components/Login.js";
import DashboardView from "./components/Dashboard.js";
import VenderView from "./components/Vender.js";
import EstoqueView from "./components/Estoque.js";
import HistoricoView from "./components/Historico.js";
import ConfiguracoesView from "./components/Configuracoes.js";
import AnaliseView from "./components/AnaliseView.js";
import EstrategiaAdsView from "./components/EstrategiaAds.js";
import { apiGet, clearAuth, getStoredSession, normalizeRole } from "./api.js";

const { createApp } = Vue;

function normalizeCanal(canal) {
  return {
    ...canal,
    corHex: canal?.corHex || canal?.cor_hex || "#3b82f6",
  };
}

const app = createApp({
  components: {
    LoginView,
    DashboardView,
    VenderView,
    EstoqueView,
    HistoricoView,
    ConfiguracoesView,
    AnaliseView,
    EstrategiaAdsView,
  },
  data() {
    return {
      session: null,
      userRole: "vendedor",
      telaAtual: "dashboard",
      menuAberto: false,
      produtos: [],
      vendas: [],
      canais: [], // ADICIONADO: Lista de canais vinda do banco
      taxas: {
        ml_comissao: 12,
        ml_frete: 22.45,
        shopee_regras: [
          { min: 0, max: 79.99, taxa: 0.2, fixa: 4.0 },
          { min: 80, max: 99.99, taxa: 0.14, fixa: 16.0 },
          { min: 100, max: 199.99, taxa: 0.14, fixa: 20.0 },
          { min: 200, max: 499.99, taxa: 0.14, fixa: 26.0 },
          { min: 500, max: 99999, taxa: 0.14, fixa: 28.0 },
        ],
      },
      feedback: { ativo: false, titulo: "", texto: "" },
      menu: [
        { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-chart-pie" },
        { id: "vender", label: "Vender", icon: "fa-solid fa-tag" },
        {
          id: "historico",
          label: "Histórico",
          icon: "fa-solid fa-clock-rotate-left",
        },
        { id: "estoque", label: "Estoque", icon: "fa-solid fa-box-archive" },
        {
          id: "analise",
          label: "Scanner ML",
          icon: "fa-solid fa-magnifying-glass-chart",
        },
        { id: "configuracoes", label: "Ajustes", icon: "fa-solid fa-gear" },
        {
          id: "estrategia-ads",
          label: "Estratégia Ads",
          icon: "fa-solid fa-chart-bar",
        },
      ],
    };
  },
  computed: {
    kpis() {
      if (!this.vendas || this.vendas.length === 0)
        return { lucro: 0, faturamento: 0, qtdVendas: 0 };
      const lucroTotal = this.vendas.reduce(
        (acc, v) => acc + Number(v.lucroLiquido || 0),
        0,
      );
      const faturamentoTotal = this.vendas.reduce(
        (acc, v) => acc + Number(v.faturamentoTotal || 0),
        0,
      );
      return {
        lucro: lucroTotal,
        faturamento: faturamentoTotal,
        qtdVendas: this.vendas.length,
      };
    },
  },
  methods: {
    async carregarDados() {
      try {
        const [configs, canais, produtos, vendas] = await Promise.all([
          apiGet("/api/configuracoes"),
          apiGet("/api/canais"),
          apiGet("/api/produtos"),
          apiGet("/api/vendas"),
        ]);

        if (configs) {
          const mapaTaxas = configs.reduce(
            (acc, i) => ({ ...acc, [i.chave]: Number(i.valor) }),
            {},
          );
          this.taxas = { ...this.taxas, ...mapaTaxas };
        }
        this.canais = (canais || []).map(normalizeCanal);
        this.produtos = produtos || [];
        this.vendas = vendas || [];
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        if (err.message?.includes("Sessão") || err.message?.includes("token")) {
          await this.fazerLogout();
          this.mostrarFeedback({
            titulo: "Sessão",
            texto: "Sua sessão expirou. Faça login novamente.",
          });
        }
      }
    },
    navegar(t) {
      this.telaAtual = t;
      this.menuAberto = false;
    },
    mostrarFeedback(a) {
      this.feedback = { ativo: true, titulo: a.titulo, texto: a.texto };
      setTimeout(() => (this.feedback.ativo = false), 3000);
    },
    onLogin(s) {
      this.session = { ...s, role: normalizeRole(s?.role) };
      this.userRole = normalizeRole(s?.role);
      this.carregarDados();
    },
    async fazerLogout() {
      clearAuth();
      this.session = null;
      this.userRole = "vendedor";
      this.telaAtual = "dashboard";
      this.produtos = [];
      this.vendas = [];
      this.canais = [];
    },
  },
  mounted() {
    const session = getStoredSession();
    if (session) this.onLogin(session);
  },
});

app.mount("#app");
