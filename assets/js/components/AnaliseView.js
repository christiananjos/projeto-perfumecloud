const AnaliseView = {
  template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-4xl space-y-6 pt-2 px-4 pb-10">
        
        <div class="flex flex-col shrink-0 text-left">
            <h2 class="text-xl md:text-2xl font-black tracking-tighter text-slate-900 leading-none italic">Scanner de Algoritmo Pro</h2>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Diagnóstico de Tags e Reputação</p>
        </div>

        <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-6 md:p-10 space-y-6">
            <div class="space-y-2 text-left">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">URL do Anúncio</label>
                <div class="relative">
                    <i class="fa-solid fa-link absolute left-5 top-1/2 -translate-y-1/2 text-blue-400"></i>
                    <input v-model="urlAnuncio" type="text" placeholder="https://..." class="input-soft !pl-12 !py-5">
                </div>
            </div>
            <button @click="analisarAnuncio" :disabled="carregando || !urlAnuncio" class="btn-primary w-full py-5 rounded-2xl uppercase text-xs font-black tracking-widest flex items-center justify-center gap-3 shadow-lg transition-all">
                <i v-if="carregando" class="fa-solid fa-circle-notch fa-spin"></i>
                <i v-else class="fa-solid fa-bolt"></i>
                {{ carregando ? 'Extraindo Dados...' : 'Analisar Agora' }}
            </button>
        </div>

        <div v-if="resultado" class="space-y-6 animate-fade-in">
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="tag in checklist" :key="tag.label" 
                     class="p-4 rounded-[1.2rem] border-2 flex flex-col items-center justify-center text-center transition-all shadow-sm"
                     :style="{ backgroundColor: tag.status ? '#ecfdf5' : '#fef2f2', borderColor: tag.status ? '#10b981' : '#ef4444' }">
                    <i class="fa-solid text-xl mb-2" 
                       :class="tag.status ? 'fa-circle-check' : 'fa-circle-xmark'"
                       :style="{ color: tag.status ? '#10b981' : '#ef4444' }"></i>
                    <span class="text-[8px] font-black uppercase tracking-tighter" :style="{ color: tag.status ? '#065f46' : '#991b1b' }">
                        {{ tag.label }}
                    </span>
                </div>
            </div>

            <div class="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-md flex flex-col md:flex-row items-center gap-6">
                <div class="flex flex-col items-center md:items-start text-left">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reputação Atual</p>
                    <div class="flex items-center gap-2 mt-1">
                        <div class="flex gap-1">
                            <div v-for="i in 5" :key="i" class="w-6 h-2 rounded-full" 
                                 :style="{ backgroundColor: i <= reputacaoNivel ? '#10b981' : '#e2e8f0' }"></div>
                        </div>
                        <span class="text-xs font-black text-emerald-600 uppercase italic" v-if="reputacaoNivel == 5">Excelente</span>
                    </div>
                </div>
                
                <div class="h-10 w-[1px] bg-gray-100 hidden md:block"></div>

                <div class="flex flex-col items-center md:items-start text-left">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medalha</p>
                    <div class="flex items-center gap-2 mt-1">
                        <i class="fa-solid fa-medal text-blue-500"></i>
                        <span class="text-xs font-bold text-slate-700 capitalize">{{ medalha || 'Nenhuma' }}</span>
                    </div>
                </div>
            </div>

            <div class="bg-slate-900 rounded-[3rem] p-8 text-left shadow-2xl border-t-4 border-blue-500">
                <h3 class="text-white font-black text-lg mb-6 italic flex items-center gap-3">
                    <i class="fa-solid fa-terminal text-blue-400"></i>
                    Relatório de Ranking
                </h3>
                <div class="space-y-4">
                    <div v-for="item in diagnostico" :key="item.titulo" class="border-l-4 pl-4" :style="{ borderColor: item.positivo ? '#10b981' : '#ef4444' }">
                        <p class="text-[10px] font-black uppercase tracking-widest" :style="{ color: item.positivo ? '#34d399' : '#f87171' }">
                           {{ item.positivo ? '✓' : '✗' }} {{ item.titulo }}
                        </p>
                        <p class="text-slate-400 text-xs">{{ item.msg }}</p>
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
      checklist: [],
      diagnostico: [],
      reputacaoNivel: 0,
      medalha: "",
      tagsBrutas: [],
    };
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

        const tagsML = data.tags || [];

        // MAPEAMENTO DAS TAGS POSITIVAS
        const tagsOuro = [
          { key: "good_quality_thumbnail", label: "Foto Premium" },
          { key: "cart_eligible", label: "Carrinho Ativo" },
          { key: "has_published_clips", label: "Clips/Vídeo" },
          { key: "immediate_payment", label: "Pgto Direto" },
          { key: "user_product_listing", label: "Selo Oficial" },
          { key: "kvs_primary", label: "Destaque KVS" },
        ];

        this.checklist = tagsOuro.map((t) => ({
          label: t.label,
          status: tagsML.includes(t.key),
        }));

        // Adiciona Descrição (Vem direto do booleano da função)
        this.checklist.push({
          label: "Desc. Rica",
          status: !!data.has_full_enhanced_descriptions,
        });

        // Extração de Reputação (baseado no JSON que você enviou)
        // O nível costuma ser "5_green", pegamos apenas o número
        this.reputacaoNivel = data.reputation_level
          ? parseInt(data.reputation_level[0])
          : 5;
        this.medalha = data.power_seller_status || "Nenhuma";

        this.diagnostico = this.checklist.map((c) => ({
          titulo: c.label,
          msg: c.status ? "Detectado com sucesso." : "Ausente no anúncio.",
          positivo: c.status,
        }));

        this.resultado = true;
      } catch (err) {
        alert("Erro na leitura. Tente novamente.");
      } finally {
        this.carregando = false;
      }
    },
  },
};

export default AnaliseView;
