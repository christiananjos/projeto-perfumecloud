const AnaliseView = {
  template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-4xl space-y-6 pt-2 px-4 pb-10">
        
        <div class="flex flex-col shrink-0 text-left">
            <h2 class="text-xl md:text-2xl font-black tracking-tighter text-slate-900 leading-none italic">Scanner de Algoritmo Pro</h2>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Diagnóstico de Tags e Reputação</p>
        </div>

        <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-6 md:p-10 space-y-6">
            <input v-model="urlAnuncio" type="text" placeholder="Cole a URL do anúncio aqui..." class="input-soft">
            <button @click="analisarAnuncio" :disabled="carregando" class="btn-primary w-full py-5 rounded-2xl uppercase text-xs font-black">
                {{ carregando ? 'Processando Dados...' : 'Escanear Saúde' }}
            </button>
        </div>

        <div v-if="resultado" class="space-y-6 animate-fade-in">
            
            <div class="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-md flex items-center justify-between">
                <div class="text-left">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status do Vendedor</p>
                    <div class="flex items-center gap-2 mt-1">
                        <i class="fa-solid fa-medal text-blue-500"></i>
                        <span class="text-sm font-black text-slate-700 uppercase">{{ medalhaTexto }}</span>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível</p>
                    <span class="text-xs font-bold px-3 py-1 rounded-full text-white mt-1 inline-block" 
                          :style="{ backgroundColor: getReputacaoColor }">
                        {{ reputacao.replace('_', ' ') }}
                    </span>
                </div>
            </div>

            <div v-if="tagsEncontradas.length" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="tag in tagsEncontradas" :key="tag" 
                     class="p-4 rounded-[1.2rem] border-2 border-emerald-500 bg-emerald-50 flex flex-col items-center">
                    <i class="fa-solid fa-circle-check text-emerald-500 text-xl mb-1"></i>
                    <span class="text-[8px] font-black uppercase text-emerald-800">{{ tag.replace(/_/g, ' ') }}</span>
                </div>
            </div>

            <div class="bg-slate-900 rounded-[3rem] p-8 text-left shadow-2xl">
                <h3 class="text-white font-black text-lg mb-6 italic">Análise de Performance</h3>
                <div class="space-y-4">
                    <div class="border-l-4 pl-4" :style="{ borderColor: hasDescription ? '#10b981' : '#ef4444' }">
                        <p class="text-[11px] font-black uppercase tracking-widest" :style="{ color: hasDescription ? '#34d399' : '#f87171' }">
                            DESCRIÇÃO RICA (ENHANCED)
                        </p>
                        <p class="text-slate-400 text-xs">
                            {{ hasDescription ? 'Sucesso: Seu anúncio utiliza HTML avançado e imagens na descrição.' : 'Atenção: Seu anúncio está com a descrição básica (texto puro).' }}
                        </p>
                    </div>
                </div>
            </div>

            <details class="text-left opacity-50">
                <summary class="text-[10px] cursor-pointer">Ver Resposta Bruta do Servidor</summary>
                <pre class="text-[10px] bg-gray-100 p-4 rounded-xl mt-2 overflow-x-auto">{{ rawData }}</pre>
            </details>
        </div>
    </div>`,

  data() {
    return {
      urlEnuncio: "",
      carregando: false,
      resultado: false,
      tagsEncontradas: [],
      reputacao: "",
      medalha: "",
      hasDescription: false,
      rawData: null,
    };
  },

  computed: {
    getReputacaoColor() {
      if (this.reputacao.includes("green")) return "#00a650";
      if (this.reputacao.includes("yellow")) return "#fff159";
      return "#ff5a5a";
    },
    medalhaTexto() {
      if (this.medalha === "none") return "Sem Medalha";
      return "Mercado Líder " + this.medalha;
    },
  },

  methods: {
    async analisarAnuncio() {
      this.carregando = true;
      this.resultado = false;
      try {
        const { data, error } = await window.supabase.functions.invoke(
          "analisar-anuncio",
          { body: { url: this.urlAnuncio } },
        );
        if (error) throw error;

        this.rawData = data;
        this.tagsEncontradas = data.tags || [];
        this.reputacao = data.reputation_level || "5_green";
        this.medalha = data.power_seller_status || "none";
        this.hasDescription = data.has_full_enhanced_descriptions;

        this.resultado = true;
      } catch (err) {
        alert("Erro no Scanner.");
      } finally {
        this.carregando = false;
      }
    },
  },
};

export default AnaliseView;
