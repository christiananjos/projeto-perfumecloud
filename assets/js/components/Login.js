const LoginView = {
    template: `
    <div class="fixed inset-0 z-[200] bg-white flex items-center justify-center p-4">
        <div class="w-full max-w-md space-y-8 animate-fade-in">
            <div class="text-center">
                <div class="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl mx-auto mb-6 text-3xl"><i class="fa-solid fa-cloud"></i></div>
                <h1 class="text-4xl font-bold tracking-tighter text-slate-900">PerfumeCloud Pro</h1>
            </div>
            <div class="card !p-10 shadow-2xl space-y-6">
                <div class="space-y-4">
                    <input v-model="email" type="email" placeholder="E-mail" class="input-soft">
                    <input v-model="password" type="password" placeholder="Senha" class="input-soft" @keyup.enter="login">
                </div>
                <button @click="login" class="btn-primary w-full py-5 text-lg uppercase tracking-widest">Acessar Painel</button>
            </div>
        </div>
    </div>`,
    data() { return { email: '', password: '' } },
    methods: {
        async login() {
            try {
                const { data, error } = await window.supabase.auth.signInWithPassword({ email: this.email, password: this.password });
                if (error) throw error;
                this.$emit('logged', data.session);
            } catch (err) { alert("Acesso negado: " + err.message); }
        }
    }
};
export default LoginView;