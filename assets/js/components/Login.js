import { loginApi } from "../api.js";

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
                    <input v-model="username" @input="erro = ''; info = ''" type="text" class="input-soft" :class="{'border-red-400': erro}">
                </div>
                
                <div class="space-y-1 text-left">
                    <label class="text-[10px] font-bold text-gray-400 uppercase ml-4 font-black">Senha</label>
                    <input v-model="password" @input="erro = ''; info = ''" type="password" class="input-soft" :class="{'border-red-400': erro}" @keyup.enter="entrar">
                </div>

                <div v-if="erro" class="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 animate-shake">
                    <i class="fa-solid fa-circle-exclamation text-sm"></i>
                    <span class="text-xs font-bold uppercase tracking-tight">{{ erro }}</span>
                </div>

                <div v-if="info" class="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-2xl flex items-center gap-3 animate-fade-in">
                    <i class="fa-solid fa-circle-info text-sm"></i>
                    <span class="text-xs font-bold uppercase tracking-tight">{{ info }}</span>
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
      erro: "",
      info: "", // Nova variável para mensagens informativas
      SUFIXO: "@meusistema.com",
    };
  },
  mounted() {
    // Quando o componente carrega, verificamos se viemos de um logout
    // Se a sessão for nula e não houver erro, mostramos a mensagem
    this.info = "Usuário desconectado";

    // Remove a mensagem automaticamente após 5 segundos
    setTimeout(() => {
      this.info = "";
    }, 5000);
  },
  methods: {
    async entrar() {
      if (!this.username || !this.password) {
        this.info = "";
        this.erro = "Preencha todos os campos";
        return;
      }

      this.carregando = true;
      this.erro = "";
      this.info = "";
      const emailFake = this.username.trim().toLowerCase() + this.SUFIXO;

      try {
        const { data, error } = await window.supabase.auth.signInWithPassword({
          email: emailFake,
          password: this.password,
        });

        if (error) throw error;

        const apiData = await loginApi(emailFake, this.password);
        if (!apiData?.token) {
          await window.supabase.auth.signOut();
          localStorage.removeItem("apiToken");
          throw new Error("Falha ao obter token da API");
        }

        window.apiToken = apiData.token;
        localStorage.setItem("apiToken", apiData.token);

        this.$emit("logged", data.session);
      } catch (err) {
        this.erro =
          err.message === "Falha ao obter token da API"
            ? "Login do backend falhou. Verifique as variaveis do Azure."
            : "Usuário ou senha inválidos";
      } finally {
        this.carregando = false;
      }
    },
  },
};

export default LoginView;
