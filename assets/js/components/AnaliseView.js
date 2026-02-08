const AnaliseView = {
  template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-4xl space-y-6 pt-2 px-4 pb-10 text-left">
        
        <div class="flex flex-col">
            <h2 class="text-xl md:text-2xl font-black tracking-tighter text-slate-900 leading-none italic uppercase">Scanner de Performance</h2>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Diagnóstico de Algoritmo e Saúde do Anúncio</p>
        </div>

        <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-6 md:p-10 space-y-6">
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">URL do Anúncio</label>
                <input v-model="urlAnuncio" type="text" placeholder="https://produto.mercadolivre.com.br/..." class="input-soft">
            </div>
            <button @click="analisarAnuncio" :disabled="carregando || !urlAnuncio" class="btn-primary w-full py-5 rounded-2xl uppercase text-xs font-black tracking-widest flex items-center justify-center gap-3">
                <i v-if="carregando" class="fa-solid fa-circle-notch fa-spin"></i>
                <i v-else class="fa-solid fa-bolt"></i>
                {{ carregando ? 'Consultando Servidor...' : 'Analisar Agora' }}
            </button>
        </div>

        <div v-if="resultado" class="space-y-6 animate-fade-in">
            
            <div v-if="temAlertas" class="space-y-3">
                <div v-if="alertas.is_cbt" class="bg-red-50 border-l-8 border-red-500 p-5 rounded-2xl flex items-center gap-4 shadow-md">
                    <i class="fa-solid fa-triangle-exclamation text-red-500 text-2xl"></i>
                    <div>
                        <p class="text-[10px] font-black text-red-700 uppercase leading-none">Erro: Envio Internacional (CBT)</p>
                        <p class="text-xs font-bold text-red-900 mt-1">Este anúncio está marcado como envio da China. Isso reduz drasticamente sua relevância no Brasil.</p>
                    </div>
                </div>

                <div v-if="alertas.out_of_coverage" class="bg-orange-50 border-l-8 border-orange-500 p-5 rounded-2xl flex items-center gap-4 shadow-md">
                    <i class="fa-solid fa-truck-fast text-orange-500 text-2xl"></i>
                    <div>
                        <p class="text-[10px] font-black text-orange-700 uppercase leading-none">Logística: Fora de Cobertura</p>
                        <p class="text-xs font-bold text-orange-900 mt-1">O produto possui restrições de entrega em certas regiões mapeadas pelo algoritmo.</p>
                    </div>
                </div>

                <div v-if="alertas.needs_prescription" class="bg-slate-100 border-l-8 border-slate-600 p-5 rounded-2xl flex items-center gap-4 shadow-md">
                    <i class="fa-solid fa-file-prescription text-slate-600 text-2xl"></i>
                    <div>
                        <p class="text-[10px] font-black text-slate-700 uppercase leading-none">Categoria: Produto Controlado</p>
                        <p class="text-xs font-bold text-slate-900 mt-1">O Mercado Livre detectou este item como de venda controlada/restrita.</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div class="space-y-1">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reputação do Vendedor</p>
                    <div class="flex items-center gap-2 justify-center md:justify-start">
                        <div class="flex gap-1">
                            <div v-for="n in 5" :key="n" class="w-6 h-2 rounded-full" 
                                 :style="{ backgroundColor: n <= 5 ? '#00a650' : '#e2e8f0' }"></div>
                        </div>
                        <span class="text-xs font-black text-emerald-600 uppercase italic">{{ reputacao }}</span>
                    </div>
                </div>

                <div class="h-10 w-[1px] bg-gray-100 hidden md:block"></div>

                <div class="space-y-1">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Mercado Líder</p>
                    <div class="flex items-center gap-2 justify-center md:justify-start">
                        <i class="fa-solid fa-medal text-blue-500 text-xl"></i>
                        <span class="text-sm font-black text-slate-700 uppercase">{{ medalhaTexto }}</span>
                    </div>
                </div>
            </div>

            <div v-if="!temAlertas" class="bg-emerald-50 border-l-8 border-emerald-500 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm">
                <i class="fa-solid fa-circle-check text-emerald-500 text-2xl"></i>
                <div>
                    <p class="text-xs font-black text-emerald-900 uppercase">Anúncio Saudável</p>
                    <p class="text-[11px] font-medium text-emerald-800">Nenhum erro crítico de algoritmo detectado. O anúncio está operando com os parâmetros normais de visibilidade.</p>
                </div>
            </div>

            <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                <div class="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                    <h3 class="font-black italic text-sm tracking-widest uppercase">Performance Log</h3>
                    <span class="text-[9px] font-mono text-blue-400 uppercase">{{ timestamp }}</span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest">
                    <div class="bg-white/5 p-3 rounded-xl border border-white/10">
                        <p class="text-gray-500 mb-1">Vendas Totais</p>
                        <p class="text-lg text-blue-400">{{ vendas }}</p>
                    </div>
                    <div class="bg-white/5 p-3 rounded-xl border border-white/10">
                        <p class="text-gray-500 mb-1">Desc. Rica</p>
                        <p class="text-lg" :class="hasEnhanced ? 'text-emerald-400' : 'text-red-400'">
                            {{ hasEnhanced ? 'SIM' : 'NÃO' }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>`,

  data() {
    return {
      urlAnuncio: "",
      carregando: false,
      resultado: false,
      reputacao: "",
      medalha: "",
      alertas: {},
      temAlertas: false,
      vendas: 0,
      hasEnhanced: false,
      timestamp: "",
    };
  },

  computed: {
    medalhaTexto() {
      return this.medalha === "none"
        ? "Sem Medalha"
        : this.medalha.replace("_", " ");
    },
  },

  methods: {
    async analisarAnuncio() {
      this.carregando = true;
      this.resultado = false;

      try {
        const { data, error } = await window.supabase.functions.invoke(
          "analisar-anuncio",
          {
            body: { url: this.urlAnuncio },
          },
        );

        if (error || !data.success) throw new Error();

        // Mapeamento dos dados que seu servidor retorna
        this.reputacao = data.reputation_level.replace("_", " ");
        this.medalha = data.power_seller_status;
        this.alertas = data.alertas_criticos;
        this.vendas = data.sold_quantity;
        this.hasEnhanced = data.has_full_enhanced_descriptions;
        this.timestamp = new Date(data.timestamp).toLocaleTimeString();

        // Lógica: se qualquer alerta crítico for TRUE, ativa a seção de erros
        this.temAlertas = Object.values(data.alertas_criticos).some(
          (v) => v === true,
        );

        this.resultado = true;
      } catch (err) {
        alert("Erro ao conectar com o servidor de análise.");
      } finally {
        this.carregando = false;
      }
    },
  },
};

export default AnaliseView;
