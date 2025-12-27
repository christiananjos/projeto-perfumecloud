import LoginView from './components/Login.js';
import DashboardView from './components/Dashboard.js';
import VenderView from './components/Vender.js';
import EstoqueView from './components/Estoque.js';
import HistoricoView from './components/Historico.js';

const { createApp } = Vue;

const app = createApp({
    components: {
        'login-view': LoginView,
        'dashboard-view': DashboardView,
        'vender-view': VenderView,
        'produtos-view': EstoqueView, // Verifique se no menu está 'produtos'
        'historico-view': HistoricoView
    },
    data() {
        return {
            session: null,
            telaAtual: 'dashboard',
            produtos: [],
            vendas: [],
            feedback: { aberto: false, titulo: '', mensagem: '' },
            menu: [
                { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-pie' },
                { id: 'vender', label: 'Vender', icon: 'fa-solid fa-cash-register' },
                { id: 'produtos', label: 'Estoque', icon: 'fa-solid fa-list' }, // O ID deve ser 'produtos'
                { id: 'historico', label: 'Histórico', icon: 'fa-solid fa-clock-rotate-left' }
            ]
        }
    },
    computed: {
        kpis() {
            const lucro = this.vendas.reduce((a, v) => a + (Number(v.lucro_liquido) || 0), 0);
            const fat = this.vendas.reduce((a, v) => a + (Number(v.faturamento_total) || 0), 0);
            return { lucro, faturamento: fat, qtdVendas: this.vendas.length };
        }
    },
    methods: {
        onLogin(session) {
            this.session = session;
            this.carregarDados();
        },
        async fazerLogout() {
            await window.supabase.auth.signOut();
            this.session = null;
        },
        async carregarDados() {
            console.log("Iniciando busca de dados...");
            try {
                // Busca Produtos
                const { data: p, error: errP } = await window.supabase
                    .from('produtos')
                    .select('*')
                    .order('nome');
                
                if (errP) throw errP;
                
                // FORÇANDO A ATUALIZAÇÃO REATIVA
                this.produtos = Array.from(p || []); 
                console.log("Produtos carregados no estado do Vue:", this.produtos.length);

                // Busca Vendas
                const { data: v, error: errV } = await window.supabase
                    .from('vendas')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (errV) throw errV;
                this.vendas = Array.from(v || []);

            } catch (e) {
                console.error("Erro ao carregar dados:", e.message);
            }
        },
        navegar(tela) {
            this.telaAtual = tela;
            this.carregarDados();
        },
        mostrarFeedback(msg) {
            this.feedback = { aberto: true, titulo: msg.titulo, mensagem: msg.texto };
        }
    },
    async mounted() {
        window.app = this; 
        const { data: { session } } = await window.supabase.auth.getSession();
        
        // Mesmo sem sessão (se as suas tabelas forem públicas), vamos carregar
        this.session = session; 
        this.carregarDados();
    }
});

app.mount('#app');