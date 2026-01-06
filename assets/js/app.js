import LoginView from "./components/Login.js";
import DashboardView from "./components/Dashboard.js";
import VenderView from "./components/Vender.js";
import EstoqueView from "./components/Estoque.js";
import HistoricoView from "./components/Historico.js";
import ConfiguracoesView from "./components/Configuracoes.js";

const { createApp } = Vue;

const app = createApp({
  components: {
    LoginView,
    DashboardView,
    VenderView,
    EstoqueView,
    HistoricoView,
    ConfiguracoesView,
  },
  data() {
    return {
      session: null,
      userRole: "vendedor",
      telaAtual: "dashboard",
      menuAberto: false,
      produtos: [],
      vendas: [],
      taxas: { ml_comissao: 12, ml_frete: 22.45 },
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

        { id: "configuracoes", label: "Ajustes", icon: "fa-solid fa-gear" },
      ],
    };
  },
  created() {
    this.erro = ""; // Garante que inicia sem erro ao deslogar
  },
  // BLOCO COMPUTED RESTAURADO
  computed: {
    kpis() {
      if (!this.vendas || this.vendas.length === 0) {
        return { lucro: 0, faturamento: 0, qtdVendas: 0 };
      }

      // Soma o lucro real registrado em cada venda
      const lucroTotal = this.vendas.reduce(
        (acc, v) => acc + Number(v.lucro_liquido || 0),
        0
      );

      // Soma o faturamento total registrado em cada venda
      const faturamentoTotal = this.vendas.reduce(
        (acc, v) => acc + Number(v.faturamento_total || 0),
        0
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
        const { data: p } = await window.supabase
          .from("produtos")
          .select("*")
          .order("nome");
        this.produtos = p || [];
        const { data: v } = await window.supabase
          .from("vendas")
          .select("*")
          .order("created_at", { ascending: false });
        this.vendas = v || [];
        const { data: t } = await window.supabase
          .from("configuracoes")
          .select("chave, valor");
        if (t) {
          this.taxas = t.reduce(
            (acc, i) => ({ ...acc, [i.chave]: Number(i.valor) }),
            {}
          );
        }
      } catch (err) {
        console.error(err);
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
        // Apenas limpe a sessão.
        // A LoginView cuidará de mostrar a mensagem ao ser carregada.
        this.session = null;
        this.userRole = null;
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
