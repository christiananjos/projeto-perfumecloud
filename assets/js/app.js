import LoginView from './components/Login.js';
import DashboardView from './components/Dashboard.js';
import VenderView from './components/Vender.js';
import EstoqueView from './components/Estoque.js';
import HistoricoView from './components/Historico.js';

const { createApp } = Vue;

const app = createApp({
    components: {
        DashboardView,
        VenderView,
        EstoqueView,
        HistoricoView,
        LoginView
    },
    data() {
        return {
            session: null,
            telaAtual: 'dashboard',
            menuAberto: false,
            produtos: [],
            vendas: [],
            feedback: { ativo: false, titulo: '', texto: '' }, // Definição correta para o feedback
            menu: [
                { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-pie' },
                { id: 'vender', label: 'Vender', icon: 'fa-solid fa-tag' },
                { id: 'estoque', label: 'Estoque', icon: 'fa-solid fa-box-archive' },
                { id: 'historico', label: 'Histórico', icon: 'fa-solid fa-clock-rotate-left' }
            ]
        }
    },
    computed: {
        // Garantindo que 'kpis' esteja sempre definido, mesmo que as vendas estejam vazias
        kpis() {
            const lucro = this.vendas.reduce((acc, v) => acc + (Number(v.lucro_liquido) || 0), 0);
            const faturamento = this.vendas.reduce((acc, v) => acc + (Number(v.faturamento_total) || 0), 0);
            return {
                lucro: lucro || 0,
                faturamento: faturamento || 0,
                qtdVendas: this.vendas.length || 0
            };
        }
    },
    methods: {
        async carregarDados() {
            try {
                const { data: p } = await window.supabase.from('produtos').select('*').order('nome');
                this.produtos = p || [];

                const { data: v } = await window.supabase.from('vendas').select('*').order('created_at', { ascending: false });
                this.vendas = v || [];
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
            }
        },
        navegar(tela) {
            this.telaAtual = tela;
            this.menuAberto = false;
        },
        // Nome da função deve ser exatamente o que o index.html chama: mostrarFeedback
        mostrarFeedback(aviso) {
            this.feedback = { ativo: true, titulo: aviso.titulo, texto: aviso.texto };
            setTimeout(() => this.feedback.ativo = false, 3500);
        },
        onLogin(session) {
            this.session = session;
            this.carregarDados();
        },
        async fazerLogout() {
            await window.supabase.auth.signOut();
            this.session = null;
            location.reload();
        }
    },
    async mounted() {
        if (window.supabase) {
            const { data } = await window.supabase.auth.getSession();
            this.session = data.session;
            if (this.session) await this.carregarDados();
        }
    }
});

app.mount('#app');