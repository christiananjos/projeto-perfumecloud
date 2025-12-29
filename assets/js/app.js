import LoginView from './components/Login.js';
import DashboardView from './components/Dashboard.js';
import VenderView from './components/Vender.js';
import EstoqueView from './components/Estoque.js';
import HistoricoView from './components/Historico.js';
import ConfiguracoesView from './components/Configuracoes.js';

const { createApp } = Vue;

const app = createApp({
    components: {
        LoginView, DashboardView, VenderView, EstoqueView, HistoricoView, ConfiguracoesView
    },
    data() {
        return {
            session: null,
            userRole: 'vendedor',
            telaAtual: 'dashboard',
            menuAberto: false,
            produtos: [],
            vendas: [],
            feedback: { ativo: false, titulo: '', texto: '' },
            menu: [
                { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-pie' },
                { id: 'vender', label: 'Vender', icon: 'fa-solid fa-tag' },
                { id: 'estoque', label: 'Estoque', icon: 'fa-solid fa-box-archive' },
                { id: 'historico', label: 'Histórico', icon: 'fa-solid fa-clock-rotate-left' },
                { id: 'configuracoes', label: 'Ajustes', icon: 'fa-solid fa-gear' }
            ]
        }
    },
    // O segredo está aqui: kpis deve ser uma computed property para ser reativa
    computed: {
        kpis() {
            // Se as vendas ainda não carregaram, retorna valores padrão zerados
            if (!this.vendas || this.vendas.length === 0) {
                return { lucro: 0, faturamento: 0, qtdVendas: 0 };
            }
            
            const lucro = this.vendas.reduce((acc, v) => acc + (Number(v.lucro_liquido) || 0), 0);
            const faturamento = this.vendas.reduce((acc, v) => acc + (Number(v.faturamento_total) || 0), 0);
            
            return {
                lucro: lucro,
                faturamento: faturamento,
                qtdVendas: this.vendas.length
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
        onLogin(session) {
            this.session = session;
            this.userRole = session.user.app_metadata?.role || 'vendedor';
            this.carregarDados();
        },
        async fazerLogout() {
            await window.supabase.auth.signOut();
            this.session = null;
            location.reload();
        }
    },
    async mounted() {
        const { data } = await window.supabase.auth.getSession();
        if (data.session) this.onLogin(data.session);
    }
});

app.mount('#app');