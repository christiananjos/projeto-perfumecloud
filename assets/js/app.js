import LoginView from "./components/Login.js";
import DashboardView from "./components/Dashboard.js";
import VenderView from "./components/Vender.js";
import EstoqueView from "./components/Estoque.js";
import HistoricoView from "./components/Historico.js";
import ConfiguracoesView from "./components/Configuracoes.js";
import AnaliseView from "./components/AnaliseView.js";

const { createApp } = Vue;

const app = createApp({
  components: {
    LoginView,
    DashboardView,
    VenderView,
    EstoqueView,
    HistoricoView,
    ConfiguracoesView,
    AnaliseView,
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
      ],
    };
  },
  computed: {
    kpis() {
      if (!this.vendas || this.vendas.length === 0)
        return { lucro: 0, faturamento: 0, qtdVendas: 0 };
      const lucroTotal = this.vendas.reduce(
        (acc, v) => acc + Number(v.lucro_liquido || 0),
        0,
      );
      const faturamentoTotal = this.vendas.reduce(
        (acc, v) => acc + Number(v.faturamento_total || 0),
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
        // 1. Busca configurações de taxas
        const { data: t } = await window.supabase
          .from("configuracoes")
          .select("chave, valor");
        if (t) {
          const mapaTaxas = t.reduce(
            (acc, i) => ({ ...acc, [i.chave]: Number(i.valor) }),
            {},
          );
          this.taxas = { ...this.taxas, ...mapaTaxas };
        }

        // 2. BUSCA OS CANAIS (NOVA TABELA)
        const { data: c, error: errorC } = await window.supabase
          .from("canais")
          .select("*")
          .eq("ativo", true)
          .order("id");
        if (errorC) throw errorC;
        this.canais = c || [];

        // 3. Busca Produtos
        const { data: p, error: errorP } = await window.supabase
          .from("produtos")
          .select("*")
          .order("nome");
        if (errorP) throw errorP;
        this.produtos = p || [];

        // 4. Busca Vendas (O select "*" já deve trazer o canal_id agora)
        const { data: v, error: errorV } = await window.supabase
          .from("vendas")
          .select("*")
          .order("created_at", { ascending: false });
        if (errorV) throw errorV;
        this.vendas = v || [];
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
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
      this.session = s;
      this.userRole = s.user.app_metadata?.role || "vendedor";
      this.carregarDados();
    },
    async fazerLogout() {
      try {
        await window.supabase.auth.signOut();
        this.session = null;
        this.userRole = "vendedor";
        this.telaAtual = "dashboard";
        this.produtos = [];
        this.vendas = [];
        this.canais = [];
      } catch (error) {
        console.error("Erro ao sair", error);
        this.session = null;
      }
    },
  },
  async mounted() {
    const { data } = await window.supabase.auth.getSession();
    if (data.session) this.onLogin(data.session);
  },
});

app.mount("#app");
