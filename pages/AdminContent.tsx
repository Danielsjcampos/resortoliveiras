
import React, { useState, useEffect } from 'react';
import { BlogPost, SystemSettings } from '../types';
import { 
  Plus, Trash2, ExternalLink, Image as ImageIcon, Search, 
  Sparkles, ListOrdered, Play, Pause, RefreshCw, X, CheckCircle,
  Newspaper
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AdminContentProps {
  posts: BlogPost[];
  onAddPost: (post: Partial<BlogPost>) => void;
  onDeletePost: (id: string) => void;
  settings: SystemSettings;
  onUpdateSettings: (s: SystemSettings) => void;
}

export const AdminContent: React.FC<AdminContentProps> = ({ posts, onAddPost, onDeletePost, settings, onUpdateSettings }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  
  const [newPost, setNewPost] = useState({ 
    title: '', category: '', excerpt: '', image: '', seoKeywords: '', seoDescription: ''
  });

  // --- Lógica do Auto-Pilot IA ---
  const handleAddKeywords = () => {
    const list = keywordInput.split('\n').map(k => k.trim()).filter(k => k.length > 0);
    onUpdateSettings({
        ...settings,
        aiKeywordsQueue: [...settings.aiKeywordsQueue, ...list]
    });
    setKeywordInput('');
  };

  const clearQueue = () => {
     onUpdateSettings({ ...settings, aiKeywordsQueue: [] });
  };

  const toggleAutoPilot = () => {
      onUpdateSettings({ ...settings, isAutoPilotActive: !settings.isAutoPilotActive });
  };

  // Simulação de geração automática quando o Pilot está ativo e há itens na fila
  useEffect(() => {
    let timer: any;
    if (settings.isAutoPilotActive && settings.aiKeywordsQueue.length > 0) {
        // A cada 15 segundos ele tenta processar um item (Simulação do Agendamento 3/dia)
        timer = setTimeout(generateNextAiPost, 15000);
    }
    return () => clearTimeout(timer);
  }, [settings.isAutoPilotActive, settings.aiKeywordsQueue]);

  const generateNextAiPost = async () => {
    if (settings.aiKeywordsQueue.length === 0) return;
    
    setIsAiLoading(true);
    const keyword = settings.aiKeywordsQueue[0];
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Você é um estrategista de conteúdo para o Resort das Oliveiras. 
        Crie um post de blog atraente e otimizado para SEO baseado na palavra-chave: "${keyword}".
        O conteúdo deve ser elegante, focado em luxo e natureza.
        Retorne APENAS um JSON:
        {
          "title": "Título SEO",
          "category": "Escolha entre: Gastronomia, Eventos, Dicas, Natureza",
          "excerpt": "Resumo de 2 frases",
          "content": "Artigo completo com dicas",
          "seoKeywords": ["tag1", "tag2"],
          "seoDescription": "Meta descrição"
        }`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const data = JSON.parse(response.text || '{}');
        onAddPost({
            ...data,
            image: `https://picsum.photos/seed/${Math.random()}/800/400`,
            isAiGenerated: true,
            date: new Date().toISOString()
        });

        // Remove o item processado da fila
        onUpdateSettings({
            ...settings,
            aiKeywordsQueue: settings.aiKeywordsQueue.slice(1)
        });

    } catch (error) {
        console.error("AI Auto-Pilot falhou", error);
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPost({
      ...newPost,
      seoKeywords: newPost.seoKeywords.split(',').map(k => k.trim()),
      date: new Date().toISOString()
    });
    setNewPost({ title: '', category: '', excerpt: '', image: '', seoKeywords: '', seoDescription: '' });
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Newspaper className="text-olive-600" /> Auto-Pilot SEO & IA
          </h2>
          <p className="text-gray-500 text-sm">O sistema cria conteúdo automaticamente baseado em sua estratégia.</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setIsCreating(!isCreating)}
              className="bg-white text-stone-700 border border-stone-200 px-5 py-2.5 rounded-2xl hover:bg-stone-50 transition flex items-center gap-2 font-bold shadow-sm"
            >
              <Plus size={18} /> Novo Manual
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Feed de Posts Gerados */}
          <div className="lg:col-span-2 space-y-6">
            {isCreating && (
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-olive-100 animate-fade-in-down">
                <h3 className="font-bold text-lg mb-4 text-olive-900">Novo Artigo Manual</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                    <input required value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full border rounded-xl p-3" placeholder="Título" />
                    <select required value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full border rounded-xl p-3">
                        <option value="">Categoria...</option>
                        <option value="Natureza">Natureza</option>
                        <option value="Gastronomia">Gastronomia</option>
                        <option value="Eventos">Eventos</option>
                    </select>
                    </div>
                    <textarea required value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})} className="w-full border rounded-xl p-3 h-20" placeholder="Resumo..."></textarea>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-stone-500 font-bold">Cancelar</button>
                        <button type="submit" className="px-8 py-2 bg-olive-600 text-white font-bold rounded-xl shadow-lg">Publicar</button>
                    </div>
                </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map(post => (
                <div key={post.id} className="bg-white rounded-[32px] shadow-sm border border-stone-100 overflow-hidden flex flex-col group hover:shadow-lg transition">
                    <div className="h-44 bg-gray-200 relative overflow-hidden">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-olive-800 uppercase shadow-sm">
                            {post.category}
                        </div>
                        {post.isAiGenerated && (
                            <div className="absolute top-4 right-4 bg-blue-600 text-white p-1.5 rounded-full shadow-lg" title="Gerado por IA">
                                <Sparkles size={12} />
                            </div>
                        )}
                    </div>
                    <div className="p-6 flex-grow">
                        <h3 className="font-bold text-gray-900 mb-2 leading-tight line-clamp-2">{post.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
                    </div>
                    <div className="p-4 bg-stone-50 border-t flex justify-between items-center">
                        <span className="text-[10px] text-stone-400 font-bold">{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                        <button onClick={() => onDeletePost(post.id)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={16}/></button>
                    </div>
                </div>
                ))}
            </div>
          </div>

          {/* Fila de Espera IA (Estratégico) */}
          <div className="space-y-6">
              <div className="bg-white rounded-[32px] shadow-xl border border-stone-200 overflow-hidden">
                  <div className="p-6 bg-gradient-to-br from-olive-800 to-olive-950 text-white relative">
                      <Sparkles className="absolute right-4 top-4 opacity-20" size={40}/>
                      <h3 className="text-xl font-bold">Auto-Pilot IA</h3>
                      <p className="text-olive-300 text-xs mt-1">Estratégia Sequencial (3 posts/dia)</p>
                      
                      <div className="mt-6 flex items-center justify-between bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                          <span className="text-sm font-bold">{settings.isAutoPilotActive ? 'ATIVO' : 'DESLIGADO'}</span>
                          <button 
                            onClick={toggleAutoPilot}
                            className={`p-2 rounded-xl transition-all ${settings.isAutoPilotActive ? 'bg-red-500' : 'bg-green-500 hover:scale-105'}`}
                          >
                            {settings.isAutoPilotActive ? <Pause size={20}/> : <Play size={20}/>}
                          </button>
                      </div>
                  </div>

                  <div className="p-6 space-y-4">
                      <div>
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Adicionar Palavras-Chave</label>
                          <textarea 
                            value={keywordInput}
                            onChange={e => setKeywordInput(e.target.value)}
                            placeholder="Ex: Benefícios do Azeite&#10;Yoga ao ar livre&#10;Melhores Vinhos" 
                            className="w-full bg-stone-50 border-stone-200 rounded-2xl p-3 text-sm h-32 focus:ring-2 focus:ring-olive-600 outline-none"
                          />
                          <button 
                            onClick={handleAddKeywords}
                            className="w-full mt-2 bg-olive-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-olive-800 transition shadow-md"
                          >
                            Alimentar Estratégia
                          </button>
                      </div>

                      <div className="pt-4 border-t">
                          <div className="flex justify-between items-center mb-3">
                              <h4 className="text-xs font-bold text-stone-600 flex items-center gap-2"><ListOrdered size={14}/> Fila de Produção</h4>
                              <button onClick={clearQueue} className="text-[9px] text-red-500 hover:underline font-bold uppercase">Limpar</button>
                          </div>
                          
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                              {settings.aiKeywordsQueue.length === 0 ? (
                                  <p className="text-[11px] text-stone-400 italic text-center py-4">Fila vazia. Insira termos acima.</p>
                              ) : (
                                settings.aiKeywordsQueue.map((kw, i) => (
                                    <div key={i} className="flex justify-between items-center p-2.5 bg-stone-50 rounded-lg text-xs border border-stone-100">
                                        <span className="truncate flex-grow pr-2 font-medium">{kw}</span>
                                        {i === 0 && settings.isAutoPilotActive && isAiLoading ? (
                                            <RefreshCw size={12} className="animate-spin text-olive-600" />
                                        ) : (
                                            <span className="text-[9px] font-bold text-stone-300">#{i + 1}</span>
                                        )}
                                    </div>
                                ))
                              )}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Status de SEO */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6">
                  <h4 className="font-bold text-emerald-800 text-sm mb-2 flex items-center gap-2"><CheckCircle size={16}/> Eficiência de Tráfego</h4>
                  <p className="text-emerald-700 text-[11px] leading-relaxed">
                    Sua fila atual garante conteúdo para os próximos {Math.ceil(settings.aiKeywordsQueue.length / 3)} dias, mantendo o Resort no topo das buscas orgânicas.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};
