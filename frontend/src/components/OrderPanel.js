import { useEffect, useState } from 'react';
import Select from 'react-select';
import api from '../api/axios';


function OrderPanel() {
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [vatRate, setVatRate] = useState(20);
  const [items, setItems] = useState([
    { product: '', quantity: 1, unit_price: '', item_discount: 0 },
  ]);

  const token = localStorage.getItem('access');

  useEffect(() => {
    const fetchData = async () => {
      const [compRes, prodRes, orderRes] = await Promise.all([
        api.get('companies/', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('products/', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('orders/', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setCompanies(compRes.data);
      setProducts(prodRes.data);
      setOrders(orderRes.data);
    };

    fetchData();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'quantity' || field === 'item_discount' ? Number(value) : value;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { product: '', quantity: 1, unit_price: '', item_discount: 0 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        'orders/',
        {
          company: selectedCompany,
          global_discount: globalDiscount,
          vat_rate: vatRate,
          items,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedCompany('');
      setGlobalDiscount(0);
      setVatRate(20);
      setItems([{ product: '', quantity: 1, unit_price: '', item_discount: 0 }]);

      const updatedOrders = await api.get('orders/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(updatedOrders.data);
    } catch (err) {
      alert('Sipariş oluşturulamadı');
    }
  };

  // Add new state for calculations
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    discountAmount: 0,
    vatAmount: 0,
    total: 0
  });

  // Add calculation effect
  useEffect(() => {
    const calculateTotals = () => {
      let subtotal = 0;
      
      // Calculate subtotal and item discounts
      items.forEach(item => {
        const itemTotal = item.quantity * item.unit_price;
        const itemDiscountAmount = (itemTotal * item.item_discount) / 100;
        subtotal += itemTotal - itemDiscountAmount;
      });

      // Calculate global discount
      const globalDiscountAmount = (subtotal * globalDiscount) / 100;
      const afterDiscount = subtotal - globalDiscountAmount;

      // Calculate VAT
      const vatAmount = (afterDiscount * vatRate) / 100;

      // Calculate final total
      const total = afterDiscount + vatAmount;

      setCalculations({
        subtotal: subtotal.toFixed(2),
        discountAmount: (globalDiscountAmount).toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        total: total.toFixed(2)
      });
    };

    calculateTotals();
  }, [items, globalDiscount, vatRate]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Sipariş Yönetimi
          </span>
        </h1>
        <div className="text-sm text-gray-500">
          Toplam Sipariş: {orders.length}
        </div>
      </div>

      {/* Sipariş Formu */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Yeni Sipariş Oluştur</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 mb-1">Firma</label>
                <Select
                options={companies.map((c) => ({
                    value: c.id,
                    label: c.name
                }))}
                value={companies.find((c) => c.id === Number(selectedCompany)) && {
                    value: selectedCompany,
                    label: companies.find((c) => c.id === Number(selectedCompany))?.name
                }}
                onChange={(selectedOption) => setSelectedCompany(selectedOption.value)}
                placeholder="Firma Seçin"
                className="react-select-container"
                classNamePrefix="react-select"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Genel İskonto (%)</label>
                <input
                  type="number"
                  value={globalDiscount}
                  onChange={(e) => setGlobalDiscount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">KDV Oranı (%)</label>
                <input
                  type="number"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-700">Ürünler</h3>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Yeni Ürün Ekle</span>
                </button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg grid md:grid-cols-4 gap-4">
                    {/* Ürün Seçimi */}
                    <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Ürün</label>
                    <Select
                        options={products.map((p) => ({
                        value: p.id,
                        label: `${p.name} (${p.code})`
                        }))}
                        value={
                        products.find((p) => p.id === Number(item.product)) && {
                            value: item.product,
                            label: `${products.find((p) => p.id === Number(item.product))?.name} (${products.find((p) => p.id === Number(item.product))?.code})`
                        }
                        }
                        onChange={(selectedOption) =>
                        handleItemChange(index, 'product', selectedOption?.value)
                        }
                        placeholder="Ürün Seçin"
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                    </div>

                    {/* Adet */}
                    <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Adet</label>
                    <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    </div>

                    {/* Birim Fiyat */}
                    <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Birim Fiyat (₺)</label>
                    <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    </div>

                    {/* Ürün İskonto */}
                    <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Ürün İskonto (%)</label>
                    <input
                        type="number"
                        value={item.item_discount}
                        onChange={(e) => handleItemChange(index, 'item_discount', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    </div>
                </div>
                ))}
            </div>

            <div className="border-t pt-6 mt-6">
              <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span className="font-medium">{calculations.subtotal}₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">İskonto ({globalDiscount}%):</span>
                  <span className="font-medium text-red-600">-{calculations.discountAmount}₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">KDV ({vatRate}%):</span>
                  <span className="font-medium text-blue-600">{calculations.vatAmount}₺</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span className="text-gray-800">Toplam:</span>
                  <span className="text-indigo-600">{calculations.total}₺</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Siparişi Kaydet</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrderPanel;
