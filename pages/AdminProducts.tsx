import React, { useState, useRef } from 'react';
import { Product, ProductCategory } from '../types';
import { Plus, Trash2, Edit2, Search, Tag, Image as ImageIcon, LayoutGrid, List } from 'lucide-react';

interface AdminProductsProps {
  products: Product[];
  onAddProduct: (product: Partial<Product>) => void;
  onUpdateProduct?: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editMode, setEditMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Restaurante',
    price: 0,
    available: true,
    image: '',
    description: '',
    isRoomService: true,
    needsPreparation: false,
    preparationTime: 0
  });

  const handleEditClick = (product: Product) => {
      setCurrentProduct(product);
      setEditMode(true);
      setIsModalOpen(true);
  };

  const handleAddNew = () => {
      setCurrentProduct({
        name: '',
        category: 'Restaurante',
        price: 0,
        available: true,
        image: '',
        description: '',
        isRoomService: true,
        needsPreparation: false,
        preparationTime: 0
      });
      setEditMode(false);
      setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setCurrentProduct(prev => ({ ...prev, image: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && currentProduct.id && onUpdateProduct) {
        onUpdateProduct(currentProduct.id, currentProduct);
    } else {
        onAddProduct(currentProduct);
    }
    setIsModalOpen(false);
  };

  const categories: ProductCategory[] = ['Restaurante', 'Bar', 'Frigobar', 'Serviços', 'Passeios', 'Outro'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(filter.toLowerCase()) || 
                          p.category.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Catálogo de Produtos e Serviços</h2>
          <p className="text-gray-500 text-sm">Gerencie o cardápio e preços disponíveis no PDV.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-olive-600 text-white px-4 py-2 rounded-lg hover:bg-olive-700 transition flex items-center gap-2 shadow"
        >
          <Plus size={18} /> Novo Item
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 flex-grow">
             <Search className="text-gray-400" />
             <input 
                type="text"
                placeholder="Buscar por nome..."
                className="flex-grow outline-none text-gray-700"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
             />
          </div>
          
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex items-center">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition ${viewMode === 'grid' ? 'bg-olive-100 text-olive-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                  <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition ${viewMode === 'list' ? 'bg-olive-100 text-olive-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                  <List size={20} />
              </button>
          </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
          <button 
            onClick={() => setSelectedCategory('Todos')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${selectedCategory === 'Todos' ? 'bg-olive-600 text-white border-olive-600' : 'bg-white text-gray-600 border-gray-200'}`}
          >
              Todos
          </button>
          {categories.map(c => (
             <button 
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${selectedCategory === c ? 'bg-olive-600 text-white border-olive-600' : 'bg-white text-gray-600 border-gray-200'}`}
             >
                 {c}
             </button>
          ))}
      </div>

      {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition group">
                 <div className="h-40 bg-gray-100 relative">
                   <img src={product.image || 'https://via.placeholder.com/300?text=Sem+Imagem'} alt={product.name} className="w-full h-full object-cover" />
                   <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-olive-800 shadow-sm">
                     {product.category}
                   </div>
                   {!product.available && (
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold backdrop-blur-sm">
                       INDISPONÍVEL
                     </div>
                   )}
                 </div>
                 <div className="p-4 flex-grow">
                   <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                   <p className="text-sm text-gray-500 mb-2">{product.description || 'Sem descrição.'}</p>
                   <div className="flex items-center justify-between mt-2">
                     <span className="text-xl font-bold text-olive-700">R$ {product.price.toFixed(2)}</span>
                   </div>
                 </div>
                 <div className="p-4 bg-gray-50 border-t flex justify-end gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(product)} className="text-blue-500 hover:bg-blue-100 p-2 rounded-full transition">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => onDeleteProduct(product.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-full transition">
                      <Trash2 size={18} />
                    </button>
                 </div>
              </div>
            ))}
          </div>
      ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <table className="w-full text-left">
                   <thead className="bg-gray-50 text-gray-500 text-sm">
                       <tr>
                           <th className="p-4">Item</th>
                           <th className="p-4">Categoria</th>
                           <th className="p-4">Opções</th>
                           <th className="p-4">Preço</th>
                           <th className="p-4 text-right">Ações</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                       {filteredProducts.map(p => (
                           <tr key={p.id} className="hover:bg-gray-50 group">
                               <td className="p-4 flex items-center gap-3">
                                   <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden">
                                       <img src={p.image || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover"/>
                                   </div>
                                   <div>
                                       <div className="font-bold text-gray-800">{p.name}</div>
                                       {!p.available && <span className="text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-bold">Indisponível</span>}
                                   </div>
                               </td>
                               <td className="p-4 text-sm text-gray-600">{p.category}</td>
                               <td className="p-4 text-sm text-gray-400">
                                   <div className="flex gap-1">
                                       {p.isRoomService && <span title="Room Service" className="w-2 h-2 rounded-full bg-blue-400"></span>}
                                       {p.needsPreparation && <span title="Cozinha" className="w-2 h-2 rounded-full bg-orange-400"></span>}
                                   </div>
                               </td>
                               <td className="p-4 font-bold text-olive-700">R$ {p.price.toFixed(2)}</td>
                               <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:bg-blue-100 p-2 rounded-lg transition"><Edit2 size={16}/></button>
                                        <button onClick={() => onDeleteProduct(p.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition"><Trash2 size={16}/></button>
                                    </div>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
          </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fade-in-up">
            <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center gap-2">
              <Tag className="text-olive-600" /> {editMode ? 'Editar Produto' : 'Adicionar Novo Produto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Item</label>
                <input required className="w-full border rounded-lg p-2" value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} placeholder="Ex: Batata Frita" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                   <input required type="number" step="0.01" className="w-full border rounded-lg p-2" value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                   <select className="w-full border rounded-lg p-2" value={currentProduct.category} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value as ProductCategory})}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea className="w-full border rounded-lg p-2" value={currentProduct.description} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} placeholder="Ingredientes ou detalhes..." />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
                
                {/* Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {currentProduct.image ? (
                        <div className="relative h-32 w-full">
                            <img src={currentProduct.image} className="h-full w-full object-cover rounded-md mx-auto" alt="Preview"/>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition text-white text-sm font-bold">Trocar Imagem</div>
                        </div>
                    ) : (
                        <div className="py-4 text-gray-400">
                            <ImageIcon size={32} className="mx-auto mb-2" />
                            <p className="text-sm">Clique para fazer upload</p>
                            <p className="text-xs">(Ou cole a URL abaixo)</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>

                <input className="w-full border rounded-lg p-2 mt-2 text-xs text-gray-400" value={currentProduct.image} onChange={e => setCurrentProduct({...currentProduct, image: e.target.value})} placeholder="Ou cole a URL da imagem aqui..." />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg space-y-3 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Opções de Serviço</h4>
                  <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={currentProduct.isRoomService ?? true} onChange={e => setCurrentProduct({...currentProduct, isRoomService: e.target.checked})} className="rounded text-olive-600 focus:ring-olive-500" />
                          <span className="text-sm text-gray-700">Disponível para Room Service (Quarto)</span>
                      </label>
                      
                      <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={currentProduct.needsPreparation ?? false} onChange={e => setCurrentProduct({...currentProduct, needsPreparation: e.target.checked})} className="rounded text-olive-600 focus:ring-olive-500" />
                              <span className="text-sm text-gray-700">Item de Cozinha (Requer Preparo)</span>
                          </label>
                          
                          {currentProduct.needsPreparation && (
                              <div className="flex items-center gap-2">
                                  <input type="number" min="0" className="w-16 border rounded p-1 text-sm" value={currentProduct.preparationTime || 0} onChange={e => setCurrentProduct({...currentProduct, preparationTime: Number(e.target.value)})} />
                                  <span className="text-xs text-gray-500">minutos</span>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                 <input type="checkbox" id="avail" checked={currentProduct.available} onChange={e => setCurrentProduct({...currentProduct, available: e.target.checked})} />
                 <label htmlFor="avail" className="text-sm text-gray-700">Disponível para venda</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-olive-600 text-white font-bold rounded-lg hover:bg-olive-700">
                    {editMode ? 'Salvar Alterações' : 'Criar Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};