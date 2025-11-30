import React, { useState } from 'react';
import { BlogPost } from '../types';
import { Plus, Trash2, ExternalLink, Image as ImageIcon, Search } from 'lucide-react';

interface AdminContentProps {
  posts: BlogPost[];
  onAddPost: (post: Partial<BlogPost>) => void;
  onDeletePost: (id: string) => void;
}

export const AdminContent: React.FC<AdminContentProps> = ({ posts, onAddPost, onDeletePost }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    category: '', 
    excerpt: '', 
    image: '',
    seoKeywords: '', // String input, converted to array on submit
    seoDescription: ''
  });

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Blog & Estratégia SEO</h2>
          <p className="text-gray-500 text-sm">Crie conteúdo otimizado para atrair tráfego orgânico.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-olive-600 text-white px-4 py-2 rounded-lg hover:bg-olive-700 transition flex items-center gap-2"
        >
          <Plus size={18} /> Nova Publicação
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-olive-100 mb-6 animate-fade-in-down">
          <h3 className="font-bold text-lg mb-4 text-olive-900">Novo Artigo Otimizado</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Post (H1)</label>
                <input 
                  required
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-olive-500" 
                  placeholder="Ex: 5 Motivos para visitar o Resort no Outono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select 
                  required
                  value={newPost.category}
                  onChange={e => setNewPost({...newPost, category: e.target.value})}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Selecione...</option>
                  <option value="Novidades">Novidades</option>
                  <option value="Eventos">Eventos</option>
                  <option value="Promoções">Promoções</option>
                  <option value="Dicas">Dicas da Região</option>
                  <option value="Gastronomia">Gastronomia</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumo (Excerpt)</label>
              <textarea 
                required
                value={newPost.excerpt}
                onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
                className="w-full border rounded-lg p-2 h-20"
                placeholder="Um breve resumo que aparecerá nos cards da home page..."
              ></textarea>
            </div>

             {/* SEO Strategy Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
               <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
                 <Search size={16} /> Estrutura de SEO (Google)
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-blue-700 mb-1 uppercase">Palavras-chave (Meta Keywords)</label>
                    <input 
                      value={newPost.seoKeywords}
                      onChange={e => setNewPost({...newPost, seoKeywords: e.target.value})}
                      className="w-full border border-blue-200 rounded-lg p-2 text-sm" 
                      placeholder="Separe por vírgula: resort sp, hotel fazenda, férias"
                    />
                    <p className="text-[10px] text-blue-500 mt-1">Termos que os clientes buscam no Google.</p>
                 </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-700 mb-1 uppercase">Meta Descrição (Snippet)</label>
                    <input 
                      value={newPost.seoDescription}
                      onChange={e => setNewPost({...newPost, seoDescription: e.target.value})}
                      className="w-full border border-blue-200 rounded-lg p-2 text-sm" 
                      placeholder="A descrição que aparece abaixo do link azul no Google (max 160 caracteres)"
                      maxLength={160}
                    />
                 </div>
               </div>
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem de Capa</label>
              <input 
                value={newPost.image}
                onChange={e => setNewPost({...newPost, image: e.target.value})}
                className="w-full border rounded-lg p-2" 
                placeholder="https://..."
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-olive-600 text-white font-bold rounded-lg hover:bg-olive-700">Publicar Conteúdo</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition">
            <div className="h-40 bg-gray-200 relative">
              {post.image ? (
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <ImageIcon size={32} />
                </div>
              )}
              <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-olive-800">
                {post.category}
              </span>
            </div>
            <div className="p-5 flex-grow">
              <p className="text-xs text-gray-500 mb-1">{new Date(post.date).toLocaleDateString('pt-BR')}</p>
              <h3 className="font-bold text-gray-900 mb-2">{post.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{post.excerpt}</p>
              
              {/* SEO Tags Display */}
              {post.seoKeywords && post.seoKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.seoKeywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
              <button className="text-olive-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                <ExternalLink size={14} /> Ver prévia
              </button>
              <button 
                onClick={() => onDeletePost(post.id)}
                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                title="Excluir post"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};