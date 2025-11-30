import React, { useState } from 'react';
import { Product, ProductCategory } from '../types';
import { Plus, Trash2, Edit2, Search, Tag, Image as ImageIcon } from 'lucide-react';

interface AdminProductsProps {
  products: Product[];
  onAddProduct: (product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ products, onAddProduct, onDeleteProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Restaurante',
    price: 0,
    available: true,
    image: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct(newProduct);
    setNewProduct({ name: '', category: 'Restaurante', price: 0, available: true, image: '', description: '' });
    setIsModalOpen(false);
  };

  const categories: ProductCategory[] = ['Restaurante', 'Bar', 'Frigobar', 'Serviços', 'Passeios', 'Outro'];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Catálogo de Produtos e Serviços</h2>
          <p className="text-gray-500 text-sm">Gerencie o cardápio e preços disponíveis no PDV.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-olive-600 text-white px-4 py-2 rounded-lg hover:bg-olive-700 transition flex items-center gap-2 shadow"
        >
          <Plus size={18} /> Novo Item
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
         <Search className="text-gray-400" />
         <input 
            type="text"
            placeholder="Buscar por nome ou categoria..."
            className="flex-grow outline-none text-gray-700"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
         />
      </div>

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
             <div className="p-4 bg-gray-50 border-t flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-400">ID: {product.id}</span>
                <button onClick={() => onDeleteProduct(product.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-full transition">
                  <Trash2 size={18} />
                </button>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
            <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center gap-2">
              <Tag className="text-olive-600" /> Adicionar Novo Produto
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Item</label>
                <input required className="w-full border rounded-lg p-2" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Ex: Batata Frita" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                   <input required type="number" step="0.01" className="w-full border rounded-lg p-2" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                   <select className="w-full border rounded-lg p-2" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as ProductCategory})}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea className="w-full border rounded-lg p-2" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Ingredientes ou detalhes..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                <input className="w-full border rounded-lg p-2" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                 <input type="checkbox" id="avail" checked={newProduct.available} onChange={e => setNewProduct({...newProduct, available: e.target.checked})} />
                 <label htmlFor="avail" className="text-sm text-gray-700">Disponível para venda</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-olive-600 text-white font-bold rounded-lg hover:bg-olive-700">Salvar Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};