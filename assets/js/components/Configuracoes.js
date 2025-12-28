const ConfiguracoesView = {
    template: `
    <div class="animate-fade-in flex flex-col mx-auto w-full md:max-w-6xl h-[92vh] md:h-auto space-y-4 md:space-y-8 pt-2 px-4">
        
        <div class="flex justify-between items-center shrink-0">
            <h2 class="text-xl md:text-3xl font-bold tracking-tighter text-slate-900 leading-none">Configurações</h2>
        </div>

        <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 flex flex-col items-center justify-center space-y-6 flex-1 md:flex-initial">
            
            <div class="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-3xl shadow-sm">
                <i class="fa-solid fa-dollar-sign"></i>
            </div>

            <div class="text-center space-y-2">
                <h3 class="text-lg md:text-2xl font-bold text-slate-800">Taxa Fixa Mercado Livre</h3>
                <p class="text-[10px] md:text-sm text-gray-400 max-w-xs mx-auto font-medium">
                    Defina o valor fixo em Reais que o ML desconta por cada produto vendido.
                </p>
            </div>

            <div class="relative w-full max-w-[220px]">
                <span class="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-yellow-500">R$</span>
                <input v-model.number="taxaLocal" type="number" step="0.01" 
                       class="input-soft !text-3xl !font-black !text-center !py-8 !pl-16 border-yellow-200 focus:border-yellow-400">
            </div>

            <button @click="salvarTaxa" class="btn-primary w-full max-w-xs py-5 uppercase text-xs tracking-widest font-bold shadow-xl active:scale-95 transition-transform">
                <i class="fa-solid fa-floppy-disk mr-2"></i> Salvar Valor da Taxa
            </button>
        </div>

        <div class="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4 shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <i class="fa-solid fa-info text-blue-600 text-xs"></i>
            </div>
            <p class="text-[9px] md:text-xs text-blue-700 leading-tight font-bold uppercase tracking-tight">
                Exemplo: Se a taxa for R$ 60,00, este valor será subtraído do lucro por cada unidade vendida.
            </p>
        </div>
    </div>`,
    data() {
        return {
            taxaLocal: 60.00
        }
    },
    methods: {
        salvarTaxa() {
            localStorage.setItem('taxaMLFixa', this.taxaLocal);
            this.$emit('notificar', { 
                titulo: 'Configurado!', 
                texto: 'Taxa fixa atualizada para R$ ' + this.taxaLocal.toFixed(2)
            });
        }
    },
    mounted() {
        const salva = localStorage.getItem('taxaMLFixa');
        if (salva) this.taxaLocal = parseFloat(salva);
    }
};

export default ConfiguracoesView;