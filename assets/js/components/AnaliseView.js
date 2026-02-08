const AnaliseView = {
  template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-4xl space-y-6 pt-2 px-4 pb-10">
        
        <div class="flex flex-col shrink-0 text-left">
            <h2 class="text-xl md:text-2xl font-black tracking-tighter text-slate-900 leading-none italic">Scanner de Algoritmo</h2>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Diagnóstico de Saúde no Mercado Livre</p>
        </div>

        <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-6 md:p-10 space-y-6">
            <div class="space-y-2 text-left">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">URL do seu Anúncio</label>
                <div class="relative">
                    <i class="fa-solid fa-link absolute left-5 top-1/2 -translate-y-1/2 text-blue-400"></i>
                    <input 
                        v-model="urlAnuncio" 
                        type="text" 
                        placeholder="https://produto.mercadolivre.com.br/MLB-..." 
                        class="input-soft !pl-12 !py-5 !text-sm border-2 focus:border-blue-500 transition-all"
                        :disabled="carregando"
                    >
                </div>
                <p class="text-[9px] text-gray-400 ml-4 font-medium italic">* Analisamos tags, fotos, vídeos e descrição avançada.</p>
            </div>

            <button 
                @click="analisarAnuncio" 
                :disabled="carregando || !urlAnuncio"
                class="btn-primary w-full py-5 rounded-2xl uppercase text-xs font-black tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
                <i v-if="carregando" class="fa-solid fa-circle-notch fa-spin"></i>
                <i v-else class="fa-solid fa-radar text-lg"></i>
                {{ carregando ? 'Escaneando Servidores...' : 'Escanear Agora' }}
            </button>
        </div>

        <div v-if="resultado" class="space-y-6 animate-fade-in">
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="tag in checklist" :key="tag.label" 
                     :class="['p-5 rounded-[1.5rem] border-2 flex flex-col items-center justify-center text-center shadow-sm transition-all', 
                              tag.status ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700']">
                    <i :class="['fa-solid text-xl mb-2', tag.status ? 'fa-square-check' : 'fa-circle-exclamation']"></i>
                    <span class="text-[9px] font-black uppercase tracking-tighter">{{ tag.label }}</span>
                </div>
            </div>

            <div class="bg-slate-900 rounded-[3rem] p-8 md:p-10 text-left relative overflow-hidden shadow-2xl border-t-4 border-blue-500">
                <h3 class="text-white font-black text-lg mb-8 flex items-center gap-3">
                    <i class="fa-solid fa-microchip text-blue-400 animate-pulse"></i>
                    Diagnóstico de Visibilidade
                </h3>
                
                <div class="space-y-6 relative z-10">
                    <div v-for="item in diagnostico" :key="item.titulo" class="border-l-2 border-slate-700 pl-6 py-1">
                        <p :class="['text-[11px] font-black uppercase tracking-[0.2em]', item.cor]">{{ item.titulo }}</p>
                        <p class="text-slate-300 text-sm mt-2 leading-relaxed font-medium">{{ item.msg }}</p>
                    </div>
                </div>

                <i class="fa-solid fa-chart-line absolute -right-10 -bottom-10 text-white/5 text-[12rem] rotate-12"></i>
            </div>

            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white flex items-center gap-5 shadow-xl">
                <div class="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                    <i class="fa-solid fa-wand-magic-sparkles text-xl"></i>
                </div>
                <div class="text-left">
                    <p class="text-[10px] font-black uppercase opacity-70 tracking-widest">Recomendação Estratégica</p>
                    <p class="text-sm font-bold mt-1">{{ recomendacao }}</p>
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
      recomendacao: "",
    };
  },

  methods: {
    async analisarAnuncio() {
      if (!this.urlAnuncio.includes("mercadolivre.com.br")) {
        return alert("Por favor, insira uma URL válida do Mercado Livre.");
      }

      this.carregando = true;
      this.resultado = false;

      try {
        // Chamada direta para a Edge Function via SDK do Supabase
        const { data, error } = await window.supabase.functions.invoke(
          "analisar-anuncio",
          {
            body: { url: this.urlAnuncio },
          },
        );

        // O erro 401 geralmente cai aqui se o JWT falhar ou se a função não for pública
        if (error) throw error;
        if (!data || !data.success) throw new Error("Falha ao extrair dados");

        const tags = data.tags || [];

        // 1. Checklist visual
        this.checklist = [
          {
            label: "Foto de Capa",
            status: tags.includes("good_quality_thumbnail"),
          },
          {
            label: "Elegível Carrinho",
            status: tags.includes("cart_eligible"),
          },
          { label: "Vídeo Clips", status: data.has_clips },
          {
            label: "Desc. Avançada",
            status: data.has_full_enhanced_descriptions,
          },
        ];

        // 2. Diagnóstico
        this.diagnostico = [];

        if (tags.includes("good_quality_thumbnail")) {
          this.diagnostico.push({
            titulo: "Thumbnail",
            msg: "Aprovada! Sua foto principal segue os padrões do robô do ML.",
            cor: "text-emerald-400",
          });
        } else {
          this.diagnostico.push({
            titulo: "Thumbnail",
            msg: "Alerta: Foto com qualidade abaixo do esperado ou fundo poluído.",
            cor: "text-red-400",
          });
        }

        if (data.has_full_enhanced_descriptions) {
          this.diagnostico.push({
            titulo: "Descrição",
            msg: "Uso de descrição rica detectado. Ótimo para fechar vendas técnicas.",
            cor: "text-emerald-400",
          });
        } else {
          this.diagnostico.push({
            titulo: "Descrição",
            msg: "Seu anúncio usa apenas texto. Adicione imagens para converter mais.",
            cor: "text-orange-400",
          });
        }

        if (data.has_clips) {
          this.diagnostico.push({
            titulo: "Engajamento",
            msg: "Vídeos (Clips) ativos. O algoritmo prioriza seu anúncio no app mobile.",
            cor: "text-blue-400",
          });
        }

        // 3. Recomendação
        if (!data.has_full_enhanced_descriptions) {
          this.recomendacao =
            "Crie uma Descrição Avançada (HTML Rico) para aumentar a relevância do seu perfume.";
        } else if (!data.has_clips) {
          this.recomendacao =
            "Grave um vídeo de 15s para ganhar o selo de clips e dobrar suas visitas.";
        } else {
          this.recomendacao =
            "Anúncio saudável! Foque em responder perguntas rapidamente para manter o rank.";
        }

        this.resultado = true;
      } catch (err) {
        console.error("Erro na análise:", err);
        // Tratamento amigável para o erro 401 ou de rede
        alert(
          "Ocorreu um erro ao conectar com o Scanner. Certifique-se de que fez o deploy com a flag --no-verify-jwt.",
        );
      } finally {
        this.carregando = false;
      }
    },
  },
};

export default AnaliseView;
