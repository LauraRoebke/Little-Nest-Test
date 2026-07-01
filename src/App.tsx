import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Heart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  ArrowRight, 
  Percent, 
  Check, 
  Sparkles, 
  Menu, 
  ChevronRight, 
  Eye,
  Info,
  Gift,
  HelpCircle,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { products } from './products';
import { Product, CartItem, Tab, Category } from './types';

export default function App() {
  // Navigation & Filtering States
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  // Interactive States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'info' }[]>([]);

  // Checkout Form States
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'success'>('cart');
  const [shippingForm, setShippingForm] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    payment: 'paypal'
  });

  // Show Toast helper
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Sync scroll on tab switch
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.warn("window.scrollTo not supported or allowed in this context", e);
    }
    setMobileMenuOpen(false);
  }, [activeTab]);

  // Shopping Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cart]);

  const shippingFee = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    return cartSubtotal >= 50 ? 0 : 4.90;
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    return cartSubtotal + shippingFee;
  }, [cartSubtotal, shippingFee]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Add Item to Cart
  const handleAddToCart = (product: Product, quantity: number = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        showToast(`Menge von "${product.name}" im Warenkorb erhöht.`);
        return prevCart.map((item) => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      showToast(`"${product.name}" zum Warenkorb hinzugefügt.`);
      return [...prevCart, { product, quantity }];
    });
  };

  // Remove or decrement from cart
  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prevCart) => {
      const removedItem = prevCart.find(item => item.product.id === productId);
      if (removedItem) {
        showToast(`"${removedItem.product.name}" aus dem Warenkorb entfernt.`, 'info');
      }
      return prevCart.filter((item) => item.product.id !== productId);
    });
  };

  // Toggle Like Status
  const handleToggleLike = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedProducts((prev) => {
      const isLiked = prev.includes(productId);
      const product = products.find(p => p.id === productId);
      if (isLiked) {
        if (product) showToast(`"${product.name}" von Merkliste entfernt.`, 'info');
        return prev.filter((id) => id !== productId);
      } else {
        if (product) showToast(`"${product.name}" auf Merkliste gespeichert!`);
        return [...prev, productId];
      }
    });
  };

  // Filtered Products for Shop Tab
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0; // default order
      });
  }, [selectedCategory, searchQuery, sortBy]);

  // Sale Products
  const saleProducts = useMemo(() => {
    return products.filter((p) => p.priceOld !== undefined);
  }, []);

  // Submit shipping form
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('success');
    setCart([]);
    showToast("Bestellung erfolgreich aufgegeben!", "success");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FDFAF6] selection:bg-linen selection:text-bark relative overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#F4EDE3] rounded-full blur-[80px] opacity-60 pointer-events-none z-0"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-[300px] h-[300px] bg-[#EDE3D7] rounded-full blur-[60px] opacity-50 pointer-events-none z-0"></div>
      
      {/* Dynamic Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 ${
                toast.type === 'success' 
                  ? 'bg-bark text-white border-clay/30' 
                  : 'bg-linen text-bark border-clay/20'
              }`}
            >
              <div className="bg-clay/20 p-1.5 rounded-full text-clay shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-medium leading-tight">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* HEADER / NAVBAR */}
      <nav className="sticky top-0 z-[100] bg-white/40 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <button 
                onClick={() => { setActiveTab('home'); setSelectedCategory('all'); }} 
                className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-bark font-display cursor-pointer hover:opacity-90 transition-opacity"
                id="logo-button"
              >
                <span className="text-2xl">🌿</span>
                <span className="font-bold">Little Nest</span>
              </button>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => { setActiveTab('shop'); setSelectedCategory('all'); }}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'shop' && selectedCategory === 'all' 
                    ? 'text-clay border-b-2 border-clay pb-1' 
                    : 'text-ink/75 hover:text-clay'
                }`}
              >
                Shop
              </button>
              <button 
                onClick={() => { setActiveTab('shop'); setSelectedCategory('deko'); }}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'shop' && selectedCategory === 'deko' 
                    ? 'text-clay border-b-2 border-clay pb-1' 
                    : 'text-ink/75 hover:text-clay'
                }`}
              >
                Deko
              </button>
              <button 
                onClick={() => { setActiveTab('shop'); setSelectedCategory('textilien'); }}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'shop' && selectedCategory === 'textilien' 
                    ? 'text-clay border-b-2 border-clay pb-1' 
                    : 'text-ink/75 hover:text-clay'
                }`}
              >
                Textilien
              </button>
              <button 
                onClick={() => { setActiveTab('shop'); setSelectedCategory('moebel'); }}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'shop' && selectedCategory === 'moebel' 
                    ? 'text-clay border-b-2 border-clay pb-1' 
                    : 'text-ink/75 hover:text-clay'
                }`}
              >
                Möbel
              </button>
              <button 
                onClick={() => setActiveTab('inspiration')}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'inspiration' 
                    ? 'text-clay border-b-2 border-clay pb-1' 
                    : 'text-ink/75 hover:text-clay'
                }`}
              >
                Inspiration
              </button>
              <button 
                onClick={() => setActiveTab('sale')}
                className={`text-sm font-bold transition-colors cursor-pointer flex items-center gap-1 text-[#d9534f] hover:text-[#c9302c] animate-pulse`}
              >
                <Percent className="w-3.5 h-3.5" />
                Sale %
              </button>
            </div>

            {/* Right Header Icons */}
            <div className="flex items-center gap-4">
              {/* Liked list badge (Desktop Only) */}
              <button
                onClick={() => {
                  setActiveTab('shop');
                  showToast(`Zeige alle Lieblingsartikel (${likedProducts.length})`);
                }}
                className="relative p-2.5 text-bark hover:text-clay hover:bg-sand/30 rounded-full transition-all cursor-pointer"
                title="Merkliste"
              >
                <Heart className={`w-5.5 h-5.5 ${likedProducts.length > 0 ? 'fill-clay text-clay' : ''}`} />
                {likedProducts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-clay text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {likedProducts.length}
                  </span>
                )}
              </button>

              {/* Shopping Cart button */}
              <button 
                onClick={() => { setIsCartOpen(true); setCheckoutStep('cart'); }}
                className="flex items-center gap-2 text-bark bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm hover:bg-clay hover:text-white transition-all duration-300 px-4 py-2.5 rounded-full cursor-pointer group font-medium"
                id="cart-trigger-button"
              >
                <ShoppingBag className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-semibold font-display">Warenkorb</span>
                <span className="bg-clay text-white text-xs font-bold w-5.5 h-5.5 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-clay transition-all duration-300">
                  {totalItemsCount}
                </span>
              </button>

              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-bark hover:text-clay rounded-lg cursor-pointer"
                id="mobile-menu-toggle"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-white/20 bg-white/60 backdrop-blur-md overflow-hidden"
            >
              <div className="px-4 pt-3 pb-6 space-y-1.5 flex flex-col">
                <button 
                  onClick={() => { setActiveTab('shop'); setSelectedCategory('all'); }}
                  className="w-full text-left py-3 px-4 rounded-xl text-base font-medium text-bark hover:bg-sand/30 hover:text-clay transition-colors"
                >
                  Shop (Alle Produkte)
                </button>
                <button 
                  onClick={() => { setActiveTab('shop'); setSelectedCategory('deko'); }}
                  className="w-full text-left py-3 px-4 rounded-xl text-base font-medium text-bark hover:bg-sand/30 hover:text-clay transition-colors"
                >
                  Deko
                </button>
                <button 
                  onClick={() => { setActiveTab('shop'); setSelectedCategory('textilien'); }}
                  className="w-full text-left py-3 px-4 rounded-xl text-base font-medium text-bark hover:bg-sand/30 hover:text-clay transition-colors"
                >
                  Textilien
                </button>
                <button 
                  onClick={() => { setActiveTab('shop'); setSelectedCategory('moebel'); }}
                  className="w-full text-left py-3 px-4 rounded-xl text-base font-medium text-bark hover:bg-sand/30 hover:text-clay transition-colors"
                >
                  Möbel
                </button>
                <button 
                  onClick={() => setActiveTab('inspiration')}
                  className="w-full text-left py-3 px-4 rounded-xl text-base font-medium text-bark hover:bg-sand/30 hover:text-clay transition-colors"
                >
                  Inspiration
                </button>
                <button 
                  onClick={() => setActiveTab('sale')}
                  className="w-full text-left py-3 px-4 rounded-xl text-base font-bold text-[#d9534f] hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Percent className="w-4 h-4" />
                  Sale % (Angebote)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* MAIN SCREEN ROUTING */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              {/* Hero Section */}
              <section className="bg-white/30 backdrop-blur-md border border-white/20 rounded-3xl m-4 sm:m-6 lg:m-8 overflow-hidden relative shadow-sm">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center min-h-[600px]">
                  <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center max-w-xl z-10">
                    <span className="text-[#8A9B8E] uppercase tracking-[0.2em] text-xs font-bold mb-4 block">Wohnen mit Gefühl</span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display leading-[1.1] text-bark mb-6">
                      Dein Zuhause,<br />
                      <i className="italic font-normal text-clay">dein Gefühl.</i>
                    </h1>
                    <p className="text-base sm:text-lg text-bark/60 mb-10 max-w-md leading-relaxed">
                      Entdecke unsere neue Kollektion für minimalistisches und gemütliches Wohnen. Jetzt für kurze Zeit reduziert.
                    </p>
                    
                    {/* BUTTONS CONTAINER: Styled after Frosted Glass Theme red & brown style */}
                    <div className="flex flex-wrap gap-4 items-center">
                      <button 
                        onClick={() => { setActiveTab('shop'); setSelectedCategory('all'); }}
                        className="px-8 py-4 bg-bark text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:bg-clay transition-all duration-300 text-center cursor-pointer flex items-center justify-center gap-2"
                        id="hero-cta-shop"
                      >
                        Kollektion ansehen
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      
                      {/* RED THEMED BUTTON from the design HTML for Zum Sale */}
                      <button 
                        onClick={() => setActiveTab('sale')}
                        className="px-8 py-4 bg-[#d9534f] text-white rounded-full font-bold shadow-lg hover:bg-[#c1413d] hover:shadow-xl transition-all duration-300 text-center cursor-pointer flex items-center justify-center gap-2"
                        id="hero-cta-sale"
                      >
                        🔥 Zum Sale %
                      </button>
                    </div>

                    {/* Features Badges */}
                    <div className="grid grid-cols-3 gap-2 mt-12 pt-8 border-t border-white/20 text-xs text-bark/70 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-clay" /> Handgefertigt
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-clay" /> Nachhaltig
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-clay" /> Schneller Versand
                      </div>
                    </div>
                  </div>

                  {/* Hero Visual side with design frame styling */}
                  <div className="relative h-[450px] lg:h-[500px] w-full flex items-center justify-center p-6 lg:p-12">
                    <div className="absolute inset-6 bg-[#B87050]/10 rounded-[40px] transform rotate-3"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80&fit=crop" 
                      alt="Modernes Wohnzimmer mit Little Nest Möbeln"
                      className="w-full h-full object-cover rounded-[40px] shadow-2xl border-4 border-white relative z-10"
                    />
                    {/* Floating Promo Card using backdrop-blur-xl bg-white/70 */}
                    <div className="absolute -bottom-2 left-6 z-20 w-48 p-4 backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl shadow-xl hidden sm:block">
                      <p className="text-[#d9534f] font-bold text-xs uppercase mb-1">Spezial Angebot</p>
                      <p className="text-xl font-display font-bold text-[#5C3D2A]">Bis zu -50%</p>
                      <p className="text-[10px] text-gray-500 mt-2">Nur solange der Vorrat reicht.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Collections Grid (Kategorien) */}
              <section className="py-24 bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <p className="text-center text-clay font-semibold text-xs tracking-widest uppercase mb-2">Kollektionen</p>
                  <h2 className="text-center text-3xl sm:text-4xl font-medium text-bark font-display mb-12">Finde deinen Wohnstil</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Deko */}
                    <button 
                      onClick={() => { setActiveTab('shop'); setSelectedCategory('deko'); }}
                      className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300 text-left cursor-pointer w-full"
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1612965607446-25e1332775ae?w=600" 
                        alt="Deko-Kollektion" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bark/40 via-transparent to-transparent" />
                      <div className="absolute inset-x-4 bottom-4 backdrop-blur-md bg-white/60 border border-white/30 rounded-2xl p-4 text-bark shadow-sm transition-all group-hover:bg-white/85">
                        <span className="text-[10px] uppercase tracking-widest text-clay font-bold">Handverlesen</span>
                        <h3 className="font-display text-xl font-medium mt-0.5">Deko</h3>
                        <p className="text-xs opacity-75 mt-0.5 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Entdecken <ChevronRight className="w-3.5 h-3.5 text-clay" />
                        </p>
                      </div>
                    </button>

                    {/* Textilien */}
                    <button 
                      onClick={() => { setActiveTab('shop'); setSelectedCategory('textilien'); }}
                      className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300 text-left cursor-pointer w-full"
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600" 
                        alt="Textilien-Kollektion" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bark/40 via-transparent to-transparent" />
                      <div className="absolute inset-x-4 bottom-4 backdrop-blur-md bg-white/60 border border-white/30 rounded-2xl p-4 text-bark shadow-sm transition-all group-hover:bg-white/85">
                        <span className="text-[10px] uppercase tracking-widest text-clay font-bold">Natürliche Fasern</span>
                        <h3 className="font-display text-xl font-medium mt-0.5">Textilien</h3>
                        <p className="text-xs opacity-75 mt-0.5 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Entdecken <ChevronRight className="w-3.5 h-3.5 text-clay" />
                        </p>
                      </div>
                    </button>

                    {/* Möbel */}
                    <button 
                      onClick={() => { setActiveTab('shop'); setSelectedCategory('moebel'); }}
                      className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300 text-left cursor-pointer w-full"
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600" 
                        alt="Möbel-Kollektion" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bark/40 via-transparent to-transparent" />
                      <div className="absolute inset-x-4 bottom-4 backdrop-blur-md bg-white/60 border border-white/30 rounded-2xl p-4 text-bark shadow-sm transition-all group-hover:bg-white/85">
                        <span className="text-[10px] uppercase tracking-widest text-clay font-bold">Echtholz &amp; Handwerk</span>
                        <h3 className="font-display text-xl font-medium mt-0.5">Möbel</h3>
                        <p className="text-xs opacity-75 mt-0.5 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Entdecken <ChevronRight className="w-3.5 h-3.5 text-clay" />
                        </p>
                      </div>
                    </button>

                    {/* Sale Collection card */}
                    <button 
                      onClick={() => setActiveTab('sale')}
                      className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300 text-left cursor-pointer w-full border border-[#d9534f]/10"
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1603204077167-2fa0397f591b?w=600" 
                        alt="Sale Angebote" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bark/40 via-transparent to-transparent" />
                      <div className="absolute inset-x-4 bottom-4 backdrop-blur-md bg-white/60 border border-white/30 rounded-2xl p-4 text-bark shadow-sm transition-all group-hover:bg-white/85">
                        <span className="text-[10px] text-[#d9534f] font-bold uppercase tracking-wider">Reduziert</span>
                        <h3 className="font-display text-xl font-medium mt-0.5 text-[#d9534f]">Sale %</h3>
                        <p className="text-xs text-[#d9534f]/95 mt-0.5 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold">
                          Jetzt sparen <ChevronRight className="w-3.5 h-3.5 text-[#d9534f]" />
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </section>

              {/* Bestsellers Section */}
              <section className="py-24 bg-white/30 backdrop-blur-sm border-t border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
                    <div>
                      <p className="text-clay font-semibold text-xs tracking-widest uppercase mb-2">Ausgesucht für dich</p>
                      <h2 className="text-3xl font-medium text-bark font-display">Unsere Bestseller</h2>
                    </div>
                    <button 
                      onClick={() => { setActiveTab('shop'); setSelectedCategory('all'); }}
                      className="mt-4 sm:mt-0 text-clay hover:text-bark font-semibold text-sm flex items-center gap-1 transition-colors group cursor-pointer"
                    >
                      Zum gesamten Sortiment
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* 4 Bestseller items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.slice(0, 4).map((product) => {
                      const isLiked = likedProducts.includes(product.id);
                      return (
                        <div 
                          key={product.id} 
                          className="backdrop-blur-sm bg-white/50 border border-white/40 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col justify-between group relative cursor-pointer"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {/* Wishlist toggle */}
                          <button
                            onClick={(e) => handleToggleLike(product.id, e)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-bark hover:text-clay rounded-full shadow-sm transition-all cursor-pointer"
                          >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-clay text-clay' : ''}`} />
                          </button>

                          {/* Image wrap with quick view icon on hover */}
                          <div className="aspect-square w-full bg-sand overflow-hidden relative">
                            <img 
                              src={product.img} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                            />
                            {product.badge && (
                              <span className={`absolute top-4 left-4 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-white ${
                                product.badge === 'Sale' ? 'bg-[#d9534f]' : 'bg-clay'
                              }`}>
                                {product.badge}
                              </span>
                            )}
                            
                            {/* Hover overlay quick view */}
                            <div className="absolute inset-0 bg-bark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <span className="bg-white/95 text-bark text-xs font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <Eye className="w-3.5 h-3.5 text-clay" /> Schnellansicht
                              </span>
                            </div>
                          </div>

                          <div className="p-5 flex-grow flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] text-clay font-bold tracking-widest uppercase mb-1 block">
                                {product.category}
                              </span>
                              <h3 className="font-display font-medium text-lg text-bark mb-1 group-hover:text-clay transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-xs text-bark/60 line-clamp-2 mb-4 leading-relaxed">
                                {product.description}
                              </p>
                            </div>

                            <div>
                              <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-base font-bold text-clay">
                                  {product.price.toFixed(2).replace('.', ',')} €
                                </span>
                                {product.priceOld && (
                                  <span className="text-xs text-bark/40 line-through">
                                    {product.priceOld.toFixed(2).replace('.', ',')} €
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={(e) => handleAddToCart(product, 1, e)}
                                className="w-full bg-sand hover:bg-clay hover:text-white text-bark font-semibold text-xs py-3 rounded-xl transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" /> In den Warenkorb
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* USP Row - Frosted Glass Styled */}
              <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-[#B87050]/10 flex items-center justify-center text-2xl text-clay shrink-0">🚚</div>
                    <div>
                      <h3 className="text-sm font-bold text-[#5C3D2A] font-display">Gratis Versand</h3>
                      <p className="text-xs opacity-70 mt-0.5">Innerhalb Deutschlands ab einem Bestellwert von 50 €.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-[#B87050]/10 flex items-center justify-center text-2xl text-clay shrink-0">✨</div>
                    <div>
                      <h3 className="text-sm font-bold text-[#5C3D2A] font-display">Premium Qualität</h3>
                      <p className="text-xs opacity-70 mt-0.5">Handverlesene, liebevoll ausgesuchte Stücke.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-[#B87050]/10 flex items-center justify-center text-2xl text-clay shrink-0">🌱</div>
                    <div>
                      <h3 className="text-sm font-bold text-[#5C3D2A] font-display">Nachhaltigkeit</h3>
                      <p className="text-xs opacity-70 mt-0.5">Umweltfreundlich verpackt & biologische Materialien.</p>
                    </div>
                  </div>
                </div>
              </section>

            </motion.div>
          )}

          {/* TAB 2: SHOP */}
          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="py-12 bg-transparent"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h1 className="text-3xl sm:text-4xl font-display font-medium text-bark mb-3" id="shop-headline">
                    Unser Sortiment
                  </h1>
                  <p className="text-sm sm:text-base text-bark/70">
                    Bringe nordische Gemütlichkeit und warme, erdige Eleganz in jeden Winkel deiner Wohnung.
                  </p>
                </div>

                {/* Filters, Search, and Sorting Panel */}
                <div className="backdrop-blur-md bg-white/40 p-6 rounded-3xl border border-white/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 shadow-sm">
                  {/* Category Selection Pills */}
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'deko', 'textilien', 'moebel'] as Category[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          selectedCategory === cat 
                            ? 'bg-clay text-white shadow-sm' 
                            : 'bg-white/70 backdrop-blur-sm text-bark/80 hover:bg-sand hover:text-bark border border-white/40'
                        }`}
                      >
                        {cat === 'all' ? 'Alle' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Search and Sorting controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search Field */}
                    <div className="relative flex-grow sm:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bark/40 w-4.5 h-4.5" />
                      <input
                        type="text"
                        placeholder="Produkt suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay transition-all placeholder:text-bark/40 text-bark"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-bark/40 hover:text-bark"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Sorting dropdown */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="appearance-none bg-white/70 backdrop-blur-sm border border-white/40 text-sm rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay cursor-pointer w-full text-bark"
                      >
                        <option value="default">Standard-Sortierung</option>
                        <option value="price-asc">Preis: günstig zuerst</option>
                        <option value="price-desc">Preis: teuer zuerst</option>
                      </select>
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-bark/50">▼</span>
                    </div>
                  </div>
                </div>

                {/* Live Filter Indicator */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-xs text-bark/60 uppercase font-bold tracking-wider">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Produkt gefunden' : 'Produkte gefunden'}
                  </p>
                  {(selectedCategory !== 'all' || searchQuery !== '') && (
                    <button
                      onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                      className="text-xs font-semibold text-clay hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Filter zurücksetzen <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-white/60">
                    <HelpCircle className="w-12 h-12 text-bark/30 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xl font-display font-medium text-bark mb-1">Keine Produkte gefunden</h3>
                    <p className="text-sm text-bark/60 max-w-sm mx-auto">
                      Versuche es mit anderen Suchbegriffen oder setze die Filter zurück, um mehr Artikel zu sehen.
                    </p>
                    <button
                      onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                      className="mt-6 bg-clay text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-bark transition-colors cursor-pointer"
                    >
                      Alle Produkte anzeigen
                    </button>
                  </div>
                )}

                {/* Shop Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredProducts.map((product) => {
                    const isLiked = likedProducts.includes(product.id);
                    return (
                      <div 
                        key={product.id} 
                        className="backdrop-blur-sm bg-white/50 border border-white/40 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col justify-between group relative cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {/* Wishlist toggle */}
                        <button
                          onClick={(e) => handleToggleLike(product.id, e)}
                          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-bark hover:text-clay rounded-full shadow-sm transition-all cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-clay text-clay' : ''}`} />
                        </button>

                        {/* Image block */}
                        <div className="aspect-square w-full bg-sand overflow-hidden relative">
                          <img 
                            src={product.img} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                          {product.badge && (
                            <span className={`absolute top-4 left-4 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-white ${
                              product.badge === 'Sale' ? 'bg-[#d9534f]' : 'bg-clay'
                            }`}>
                              {product.badge}
                            </span>
                          )}

                          {/* Hover action Quick view overlay */}
                          <div className="absolute inset-0 bg-bark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="bg-white/95 text-bark text-xs font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                              <Eye className="w-3.5 h-3.5 text-clay" /> Schnellansicht
                            </span>
                          </div>
                        </div>

                        {/* Product Body */}
                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-clay font-bold tracking-widest uppercase mb-1 block">
                              {product.category}
                            </span>
                            <h3 className="font-display font-medium text-lg text-bark mb-1 group-hover:text-clay transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-xs text-bark/60 line-clamp-2 mb-4 leading-relaxed">
                              {product.description}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-baseline gap-2 mb-4">
                              <span className="text-base font-bold text-clay">
                                {product.price.toFixed(2).replace('.', ',')} €
                              </span>
                              {product.priceOld && (
                                <span className="text-xs text-bark/40 line-through">
                                  {product.priceOld.toFixed(2).replace('.', ',')} €
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => handleAddToCart(product, 1, e)}
                              className="w-full bg-sand hover:bg-clay hover:text-white text-bark font-semibold text-xs py-3 rounded-xl transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> In den Warenkorb
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: SALE */}
          {activeTab === 'sale' && (
            <motion.div
              key="sale"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="py-12 bg-transparent"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Sale Banner */}
                <div className="bg-[#d9534f] text-white p-8 sm:p-12 rounded-3xl text-center mb-12 shadow-md relative overflow-hidden">
                  {/* Absolutes decorative icon */}
                  <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 text-white/5 font-display text-9xl select-none font-bold">
                    %
                  </div>
                  <div className="relative z-10 max-w-2xl mx-auto">
                    <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                      Letzte Chance Angebote
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-display font-medium mb-4">
                      Hier sparst du Platz &amp; Geld
                    </h1>
                    <p className="text-sm sm:text-base text-red-100 mb-0">
                      Nur für kurze Zeit: Saisonale Highlights, Einzelstücke und Auslaufmodelle radikal reduziert. Zugreifen, solange der Vorrat reicht!
                    </p>
                  </div>
                </div>

                {/* Sale Grid title */}
                <div className="border-b border-white/20 pb-4 mb-8">
                  <h2 className="text-2xl font-display font-semibold text-bark">
                    Unsere unschlagbaren Angebote
                  </h2>
                </div>

                {/* Sale products grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {saleProducts.map((product) => {
                    const isLiked = likedProducts.includes(product.id);
                    // calculate discount %
                    const discountPercent = product.priceOld 
                      ? Math.round(((product.priceOld - product.price) / product.priceOld) * 100) 
                      : 0;

                    return (
                      <div 
                        key={product.id}
                        className="backdrop-blur-sm bg-white/50 border border-white/40 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col md:flex-row relative cursor-pointer group"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {/* Red SALE badge with custom % */}
                        <div className="absolute top-4 left-4 z-10 bg-[#d9534f] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                          <Percent className="w-3 h-3" />
                          <span>-{discountPercent}%</span>
                        </div>

                        {/* Wishlist button */}
                        <button
                          onClick={(e) => handleToggleLike(product.id, e)}
                          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-bark hover:text-clay rounded-full shadow-sm transition-all cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-clay text-clay' : ''}`} />
                        </button>

                        {/* Image wrap */}
                        <div className="w-full md:w-1/2 aspect-square md:aspect-auto min-h-[220px] bg-sand overflow-hidden relative">
                          <img 
                            src={product.img} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-bark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="bg-white/95 text-bark text-xs font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-clay" /> Ansehen
                            </span>
                          </div>
                        </div>

                        {/* Info details */}
                        <div className="p-6 w-full md:w-1/2 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-[#d9534f] font-bold tracking-widest uppercase mb-1 block">
                              {product.category}
                            </span>
                            <h3 className="font-display font-medium text-lg text-bark mb-2 group-hover:text-clay transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-xs text-bark/60 line-clamp-3 leading-relaxed mb-4">
                              {product.description}
                            </p>
                          </div>

                          <div>
                            {/* Sale Price block */}
                            <div className="flex flex-col mb-4">
                              <span className="text-xs text-bark/40">Zuvor {product.priceOld?.toFixed(2).replace('.', ',')} €</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-[#d9534f]">
                                  {product.price.toFixed(2).replace('.', ',')} €
                                </span>
                                <span className="bg-red-50 text-[#d9534f] text-[10px] font-bold px-2 py-0.5 rounded border border-red-100">
                                  Spare {(product.priceOld! - product.price).toFixed(2).replace('.', ',')} €
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => handleAddToCart(product, 1, e)}
                              className="w-full bg-[#d9534f] text-white hover:bg-bark font-semibold text-xs py-3 rounded-xl transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" /> In den Warenkorb
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* FAQ Box */}
                <div className="mt-20 p-8 rounded-2xl bg-linen/20 border border-linen max-w-3xl mx-auto">
                  <h3 className="font-display text-xl font-medium text-bark mb-3 text-center">Gibt es Fragen zum Sale?</h3>
                  <div className="space-y-4 text-xs sm:text-sm text-bark/85">
                    <p><strong>Sind alle Produkte neu und makellos?</strong> Ja! Es handelt sich um originalverpackte Neuware. Wir reduzieren diese Artikel lediglich, um Platz in unserem Regallager für die nächste Herbstkollektion zu schaffen.</p>
                    <p><strong>Gilt das 30-tägige Rückgaberecht auch für Sale-Artikel?</strong> Natürlich! Du kannst jeden reduzierten Artikel innerhalb von 30 Tagen kostenlos an uns zurücksenden, wenn er dir nicht gefällt.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: INSPIRATION */}
          {activeTab === 'inspiration' && (
            <motion.div
              key="inspiration"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="py-12 bg-transparent"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <p className="text-clay font-semibold text-xs tracking-widest uppercase mb-2">Inspirationswelten</p>
                  <h1 className="text-3xl sm:text-5xl font-display font-medium text-bark mb-4">
                    Wohnwelten zum Nachstylen
                  </h1>
                  <p className="text-sm sm:text-base text-bark/70 leading-relaxed">
                    Entdecke harmonische Kombinationen und erfahre, wie unsere Lieblingsstücke in echten Räumen wirken. Lass dich verzaubern.
                  </p>
                </div>

                {/* Look 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
                  <div className="lg:col-span-7 rounded-2xl overflow-hidden shadow-lg relative aspect-[4/3] bg-linen">
                    <img 
                      src="https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1000" 
                      alt="Minimalistischer Scandi-Wohnzimmer-Look" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-xs font-semibold text-bark">
                      💡 Design Tipp: Nutze helle Kissen für frische Kontraste!
                    </div>
                  </div>
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <span className="text-xs font-bold text-clay tracking-widest uppercase mb-2">LOOK NO. 1</span>
                    <h2 className="text-2xl sm:text-3xl font-display font-medium text-bark mb-4">
                      Der minimalistische Scandi-Traum
                    </h2>
                    <p className="text-sm sm:text-base text-bark/75 leading-relaxed mb-6">
                      Helle Eichentöne gepaart mit sanften Textilien aus reinem Leinen erschaffen eine Oase der Ruhe. Weniger Deko, dafür ausdrucksstarke Einzelstücke aus unserer Manufaktur, die Wärme und Natürlichkeit spenden.
                    </p>
                    <div>
                      <button 
                        onClick={() => { setActiveTab('shop'); setSelectedCategory('moebel'); }}
                        className="text-clay hover:text-bark font-semibold text-sm inline-flex items-center gap-1 border-b-2 border-clay pb-1 hover:border-bark transition-all cursor-pointer"
                      >
                        Passende Möbel shoppen <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Look 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-12">
                  <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center">
                    <span className="text-xs font-bold text-clay tracking-widest uppercase mb-2">LOOK NO. 2</span>
                    <h2 className="text-2xl sm:text-3xl font-display font-medium text-bark mb-4">
                      Warmer Earth-Look im Flur & Wohnbereich
                    </h2>
                    <p className="text-sm sm:text-base text-bark/75 leading-relaxed mb-6">
                      Begrüße deine Gäste mit beruhigenden Erdtönen. Unsere handgeformten Terrakotta-Vasen kombiniert mit getrockneten Gräsern und Naturholz bringen die beruhigende Kraft der Natur direkt in dein Zuhause.
                    </p>
                    <div>
                      <button 
                        onClick={() => { setActiveTab('shop'); setSelectedCategory('deko'); }}
                        className="text-clay hover:text-bark font-semibold text-sm inline-flex items-center gap-1 border-b-2 border-clay pb-1 hover:border-bark transition-all cursor-pointer"
                      >
                        Dekoartikel entdecken <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="lg:col-span-7 order-1 lg:order-2 rounded-2xl overflow-hidden shadow-lg relative aspect-[4/3] bg-linen">
                    <img 
                      src="https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=1000" 
                      alt="Earth-Look Detailaufnahmen" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-xs font-semibold text-bark">
                      🌿 Handarbeit aus traditioneller Ton-Manufaktur
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1E1A17] text-white pt-20 pb-10 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-bark/30">
            {/* Column 1: Info */}
            <div className="lg:col-span-5">
              <h4 className="font-display font-bold text-2xl text-white mb-4">🌿 Little Nest</h4>
              <p className="text-xs sm:text-sm text-linen/70 leading-relaxed max-w-sm">
                Nachhaltige, ästhetische und minimalistische Wohnaccessoires mit Seele. Wir glauben an nachhaltiges Wohnen und zeitlose Ästhetik.
              </p>
              {/* Trust symbol */}
              <div className="mt-6 flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10 max-w-xs">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="text-xs font-bold text-linen">Sehr gut bewertet</p>
                  <p className="text-[10px] text-linen/60">4.9 / 5.0 Sterne bei Trusted-Shops</p>
                </div>
              </div>
            </div>

            {/* Column 2: Shop Links */}
            <div className="lg:col-span-2.5">
              <h5 className="text-[11px] font-bold uppercase tracking-widest text-linen mb-4">Shop</h5>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <button 
                    onClick={() => { setActiveTab('shop'); setSelectedCategory('deko'); }}
                    className="text-linen/70 hover:text-clay transition-colors cursor-pointer"
                  >
                    Dekoartikel
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveTab('shop'); setSelectedCategory('textilien'); }}
                    className="text-linen/70 hover:text-clay transition-colors cursor-pointer"
                  >
                    Nachhaltige Textilien
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveTab('shop'); setSelectedCategory('moebel'); }}
                    className="text-linen/70 hover:text-clay transition-colors cursor-pointer"
                  >
                    Echtholz-Möbel
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('sale')}
                    className="text-[#d9534f] hover:underline font-semibold cursor-pointer"
                  >
                    Sonderangebote %
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Inspiration & Info */}
            <div className="lg:col-span-2.5">
              <h5 className="text-[11px] font-bold uppercase tracking-widest text-linen mb-4">Inspiration</h5>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <button 
                    onClick={() => setActiveTab('inspiration')}
                    className="text-linen/70 hover:text-clay transition-colors cursor-pointer"
                  >
                    Wohnwelten &amp; Ideen
                  </button>
                </li>
                <li>
                  <a href="#" className="text-linen/70 hover:text-clay transition-colors">Über uns</a>
                </li>
                <li>
                  <a href="#" className="text-linen/70 hover:text-clay transition-colors">Nachhaltigkeits-Kodex</a>
                </li>
                <li>
                  <a href="#" className="text-linen/70 hover:text-clay transition-colors">Partnerprogramm</a>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact info */}
            <div className="lg:col-span-2">
              <h5 className="text-[11px] font-bold uppercase tracking-widest text-linen mb-4">Kontakt</h5>
              <ul className="space-y-2 text-xs sm:text-sm text-linen/70">
                <li>✉ info@littlenest.de</li>
                <li>📞 +49 (0) 800 123 456</li>
                <li>📍 Hamburg, Deutschland</li>
                <li className="pt-2 text-[10px] text-linen/40">Mo. - Fr. 09:00 - 18:00 Uhr</li>
              </ul>
            </div>
          </div>

          {/* Sub Footer Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[11px] text-linen/40">
            <p>© {new Date().getFullYear()} Little Nest GmbH. Alle Rechte vorbehalten.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-clay transition-colors">Impressum</a>
              <a href="#" className="hover:text-clay transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-clay transition-colors">AGB</a>
              <a href="#" className="hover:text-clay transition-colors">Widerrufsrecht</a>
            </div>
          </div>
        </div>
      </footer>

      {/* SHOPPING CART SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[250] overflow-hidden">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-bark cursor-pointer"
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
                id="shopping-cart-drawer"
              >
                {/* Header of Drawer */}
                <div className="p-6 border-b border-linen flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-clay" />
                    <h2 className="text-lg font-bold font-display text-bark">Dein Warenkorb</h2>
                    <span className="bg-linen text-bark text-xs font-semibold px-2 py-0.5 rounded-full">
                      {totalItemsCount}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 text-bark hover:text-clay hover:bg-sand/30 rounded-full cursor-pointer transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Body with scrolling items or Checkout steps */}
                <div className="flex-grow overflow-y-auto p-6">
                  
                  {/* STEP A: VIEW CART ITEMS */}
                  {checkoutStep === 'cart' && (
                    <>
                      {/* Free Shipping Progress bar */}
                      {cart.length > 0 && (
                        <div className="mb-6 bg-sand/30 p-4 rounded-xl border border-linen">
                          <p className="text-xs text-bark/80 font-medium mb-1.5 flex items-center gap-1">
                            <Truck className="w-4 h-4 text-clay" />
                            {cartSubtotal >= 50 ? (
                              <span className="text-emerald-700 font-bold">Glückwunsch! Kostenloser Versand freigeschaltet.</span>
                            ) : (
                              <span>
                                Noch <strong>{(50 - cartSubtotal).toFixed(2).replace('.', ',')} €</strong> bis zum kostenlosen Versand!
                              </span>
                            )}
                          </p>
                          <div className="w-full bg-linen/50 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-clay h-full transition-all duration-500"
                              style={{ width: `${Math.min((cartSubtotal / 50) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {cart.length === 0 ? (
                        <div className="text-center py-24">
                          <ShoppingBag className="w-12 h-12 text-bark/20 mx-auto mb-4" />
                          <h3 className="font-display text-lg font-medium text-bark mb-1">Dein Warenkorb ist leer</h3>
                          <p className="text-xs text-bark/60 max-w-xs mx-auto mb-6">
                            Stöbere in unseren Kategorien und füge deine Lieblingsstücke hinzu!
                          </p>
                          <button
                            onClick={() => { setIsCartOpen(false); setActiveTab('shop'); }}
                            className="bg-clay text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-bark transition-colors cursor-pointer"
                          >
                            Jetzt shoppen gehen
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cart.map((item) => (
                            <div 
                              key={item.product.id} 
                              className="flex items-center gap-4 p-3 bg-linen/10 rounded-xl border border-linen/30"
                            >
                              <img 
                                src={item.product.img} 
                                alt={item.product.name} 
                                className="w-16 h-16 rounded-lg object-cover bg-sand shrink-0"
                              />
                              <div className="flex-grow min-w-0">
                                <h4 className="text-sm font-semibold text-bark truncate font-display text-[15px]">
                                  {item.product.name}
                                </h4>
                                <p className="text-xs text-clay font-bold mt-0.5">
                                  {item.product.price.toFixed(2).replace('.', ',')} €
                                </p>
                                
                                {/* Quantity counters */}
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.product.id, -1)}
                                    className="p-1 bg-white hover:bg-sand border border-linen rounded text-bark/80 hover:text-bark transition-colors cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-bold w-4 text-center text-bark">{item.quantity}</span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item.product.id, 1)}
                                    className="p-1 bg-white hover:bg-sand border border-linen rounded text-bark/80 hover:text-bark transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveFromCart(item.product.id)}
                                className="p-2 text-bark/40 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Löschen"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* STEP B: SHIPPING ADDRESS FORM */}
                  {checkoutStep === 'shipping' && (
                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      <div className="border-b border-linen pb-3 mb-4">
                        <h3 className="font-display font-semibold text-bark text-base">Versanddetails</h3>
                        <p className="text-xs text-bark/60">Bitte trage deine Lieferanschrift ein, um die Bestellung abzuschließen.</p>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold text-bark uppercase tracking-wider mb-1">
                            Vollständiger Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="z.B. Maria Müller"
                            value={shippingForm.name}
                            onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-white border border-linen rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-bark uppercase tracking-wider mb-1">
                            E-Mail-Adresse
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="z.B. maria@example.de"
                            value={shippingForm.email}
                            onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-white border border-linen rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-bark uppercase tracking-wider mb-1">
                            Straße & Hausnummer
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Lindenstraße 24"
                            value={shippingForm.street}
                            onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-white border border-linen rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-bark uppercase tracking-wider mb-1">
                            PLZ & Ort
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="20457 Hamburg"
                            value={shippingForm.city}
                            onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-white border border-linen rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-bark uppercase tracking-wider mb-1">
                            Zahlungsart
                          </label>
                          <select
                            value={shippingForm.payment}
                            onChange={(e) => setShippingForm({ ...shippingForm, payment: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-white border border-linen rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay cursor-pointer"
                          >
                            <option value="paypal">PayPal</option>
                            <option value="cc">Kreditkarte (Visa/Mastercard)</option>
                            <option value="invoice">Kauf auf Rechnung</option>
                            <option value="sofort">Sofortüberweisung</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-6">
                        <button
                          type="submit"
                          className="w-full bg-clay text-white hover:bg-bark transition-colors py-3 rounded-xl font-semibold text-sm cursor-pointer shadow-md text-center flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Kostenpflichtig bestellen ({cartTotal.toFixed(2).replace('.', ',')} €)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('cart')}
                          className="w-full text-center text-xs text-bark/60 hover:text-bark mt-3 hover:underline cursor-pointer"
                        >
                          Zurück zum Warenkorb
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP C: ORDER SUCCESS */}
                  {checkoutStep === 'success' && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 animate-bounce">
                        <Check className="w-8 h-8" />
                      </div>
                      <h3 className="font-display text-2xl font-medium text-bark mb-3">Vielen Dank für deinen Einkauf!</h3>
                      <p className="text-sm text-bark/80 mb-6 leading-relaxed">
                        Deine Bestellung wurde erfolgreich entgegengenommen. Wir senden dir in Kürze eine Bestätigungs-E-Mail mit allen Details und der Rechnung zu.
                      </p>
                      
                      <div className="bg-linen/20 border border-linen p-4 rounded-xl text-left text-xs mb-8 space-y-1.5">
                        <p className="text-bark/50">ZUSAMMENFASSUNG:</p>
                        <p><strong>Empfänger:</strong> {shippingForm.name}</p>
                        <p><strong>Lieferadresse:</strong> {shippingForm.street}, {shippingForm.city}</p>
                        <p><strong>Zahlungsart:</strong> {shippingForm.payment === 'paypal' ? 'PayPal' : shippingForm.payment === 'cc' ? 'Kreditkarte' : 'Kauf auf Rechnung'}</p>
                        <p className="pt-2 text-clay font-bold">Voraussichtliche Lieferung: in 2-3 Werktagen</p>
                      </div>

                      <button
                        onClick={() => { setIsCartOpen(false); setActiveTab('home'); }}
                        className="bg-bark text-white hover:bg-clay transition-colors px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer w-full"
                      >
                        Weiter einkaufen
                      </button>
                    </div>
                  )}

                </div>

                {/* Footer of Drawer (Summary Price & Checkout CTAs) */}
                {checkoutStep === 'cart' && cart.length > 0 && (
                  <div className="p-6 border-t border-linen bg-linen/10 space-y-4">
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between text-bark/70">
                        <span>Zwischensumme:</span>
                        <span>{cartSubtotal.toFixed(2).replace('.', ',')} €</span>
                      </div>
                      <div className="flex justify-between text-bark/70">
                        <span>Versandkosten:</span>
                        <span>{shippingFee === 0 ? 'Gratis' : `${shippingFee.toFixed(2).replace('.', ',')} €`}</span>
                      </div>
                      <div className="flex justify-between text-bark font-bold text-base pt-2 border-t border-linen/60">
                        <span>Gesamtsumme (inkl. MwSt.):</span>
                        <span className="text-clay">{cartTotal.toFixed(2).replace('.', ',')} €</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setCheckoutStep('shipping')}
                      className="w-full bg-clay text-white hover:bg-bark transition-colors py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider cursor-pointer shadow-md text-center flex items-center justify-center gap-1.5"
                    >
                      Zur Kasse gehen <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-full text-center text-xs text-bark/60 hover:text-bark hover:underline cursor-pointer"
                    >
                      Einkauf fortsetzen
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* PRODUCT QUICK VIEW MODAL / DIALOG */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-bark cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full z-10 grid grid-cols-1 md:grid-cols-2"
              id="product-quickview-modal"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-bark hover:text-clay rounded-full shadow-sm cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column: Image with optional badge */}
              <div className="aspect-square bg-sand relative overflow-hidden h-full min-h-[300px]">
                <img 
                  src={selectedProduct.img} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover absolute inset-0"
                />
                {selectedProduct.badge && (
                  <span className={`absolute top-6 left-6 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-white ${
                    selectedProduct.badge === 'Sale' ? 'bg-[#d9534f]' : 'bg-clay'
                  }`}>
                    {selectedProduct.badge}
                  </span>
                )}
              </div>

              {/* Right Column: Detailed parameters */}
              <div className="p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-clay tracking-widest uppercase mb-1.5 block">
                    Kategorie: {selectedProduct.category}
                  </span>
                  <h3 className="font-display font-medium text-2xl sm:text-3xl text-bark mb-4">
                    {selectedProduct.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-6 border-b border-linen pb-4">
                    <span className="text-2xl font-bold text-clay">
                      {selectedProduct.price.toFixed(2).replace('.', ',')} €
                    </span>
                    {selectedProduct.priceOld && (
                      <span className="text-sm text-bark/40 line-through">
                        {selectedProduct.priceOld.toFixed(2).replace('.', ',')} €
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-bark/75 leading-relaxed mb-6">
                    {selectedProduct.description}
                  </p>

                  {/* Detailed specs list */}
                  <div className="space-y-2 text-xs text-bark/70 bg-linen/20 p-3 rounded-xl border border-linen/50 mb-6">
                    <p>✓ <strong>Nachhaltig:</strong> 100% ökologisch hergestellte Materialien</p>
                    <p>✓ <strong>Unikat:</strong> In liebevoller Detail-Handarbeit geformt</p>
                    <p>✓ <strong>Lagerung:</strong> Sofort lieferbar, in 2-3 Werktagen bei dir</p>
                  </div>
                </div>

                <div>
                  {/* Add action */}
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct, 1);
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-clay text-white hover:bg-bark transition-all py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider cursor-pointer shadow-md text-center flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" /> In den Warenkorb legen
                  </button>
                  <p className="text-[10px] text-bark/40 text-center mt-2.5">
                    Sichere SSL-Verschlüsselung &amp; kostenloser Rückversand
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
