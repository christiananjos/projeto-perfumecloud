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
    computed: {
        kpis() {
            if (!this.vendas || this.vendas.length === 0) return { lucro: 0, faturamento: 0, qtdVendas: 0 };
            const lucro = this.vendas.reduce((acc, v) => acc + (Number(v.lucro_liquido) || 0), 0);
            const faturamento = this.vendas.reduce((acc, v) => acc + (Number(v.faturamento_total) || 0), 0);
            return { lucro, faturamento, qtdVendas: this.vendas.length };
        }
    },
    methods: {
        async carregarDados() {
            try {
                const { data: p } = await window.supabase.from('produtos').select('*').order('nome');
                this.produtos = p || [];
                const { data: v } = await window.supabase.from('vendas').select('*').order('created_at', { ascending: false });
                this.vendas = v || [];
            } catch (err) { console.error("Erro ao carregar dados:", err); }
        },
        navegar(tela) {
            this.telaAtual = tela;
            this.menuAberto = false;
        },
        mostrarFeedback(aviso) {
            this.feedback.titulo = aviso.titulo;
            this.feedback.texto = aviso.texto;
            this.feedback.ativo = true;
            setTimeout(() => { this.feedback.ativo = false; }, 3000);
        },
        onLogin(session) {
            this.session = session;
            
            // BUSCA DIRETA NO APP_METADATA QUE VOCÊ MOSTROU NO SCRIPT
            const role = session.user.app_metadata?.role;
            
            if (role === 'admin') {
                this.userRole = 'admin';
            } else {
                this.userRole = 'vendedor';
            }

            console.log("SISTEMA: Logado como", this.userRole);
            this.carregarDados();
        },
        async fazerLogout() {
            await window.supabase.auth.signOut();
            this.session = null;
            this.userRole = 'vendedor';
            localStorage.clear();
            location.reload();
        }
    },
    async mounted() {
        if (window.supabase) {
            const { data } = await window.supabase.auth.getSession();
            if (data.session) this.onLogin(data.session);
        }
    }
});

app.mount('#app');