const LoginView = {
  template: `
    <div class="flex items-center justify-center min-h-screen bg-[#f8fafc] px-4">
        <div class="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-fade-in border border-gray-100">
            <div class="text-center space-y-2">
                <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto shadow-lg mb-4">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h2 class="text-3xl font-bold tracking-tighter text-slate-900 leading-none">Acesso Restrito</h2>
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">PerfumeCloud Pro</p>
            </div>

            <div class="space-y-4">
                <div class="space-y-1 text-left">
                    <label class="text-[10px] font-bold text-gray-400 uppercase ml-4 font-black">Usuário</label>
                    <input v-model="username" @input="erro = ''" type="text" class="input-soft" :class="{'border-red-400': erro}">
                </div>
                
                <div class="space-y-1 text-left">
                    <label class="text-[10px] font-bold text-gray-400 uppercase ml-4 font-black">Senha</label>
                    <input v-model="password" @input="erro = ''" type="password" class="input-soft" :class="{'border-red-400': erro}" @keyup.enter="entrar">
                </div>

                <div v-if="erro" class="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 animate-shake">
                    <i class="fa-solid fa-circle-exclamation text-sm"></i>
                    <span class="text-xs font-bold uppercase tracking-tight">{{ erro }}</span>
                </div>
            </div>

            <button @click="entrar" :disabled="carregando" 
                class="btn-primary w-full py-5 text-sm font-bold uppercase tracking-widest shadow-xl disabled:opacity-50">
                {{ carregando ? 'Acessando...' : 'Entrar' }}
            </button>
        </div>
    </div>`,
  data() {
    return {
      username: "",
      password: "",
      carregando: false,
      erro: "", // Nova variável para a mensagem
      SUFIXO: "@meusistema.com",
    };
  },
  methods: {
    async entrar() {
      if (!this.username || !this.password) {
        this.erro = "Preencha todos os campos";
        return;
      }

      this.carregando = true;
      this.erro = ""; // Limpa erro anterior
      const emailFake = this.username.trim().toLowerCase() + this.SUFIXO;

      try {
        const { data, error } = await window.supabase.auth.signInWithPassword({
          email: emailFake,
          password: this.password,
        });

        if (error) throw error;
        this.$emit("logged", data.session);
      } catch (err) {
        this.erro = "Usuário ou senha inválidos";
      } finally {
        this.carregando = false;
      }
    },
  },
};

export default LoginView;
