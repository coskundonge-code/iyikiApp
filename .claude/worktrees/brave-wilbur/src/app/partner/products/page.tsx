"use client";

import { useState, useEffect } from "react";
import { Plus, Edit3, X, Package } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import ImageUploader from "@/components/ImageUploader";

const CATEGORIES = ["coffee", "chocolate", "book", "flower", "experience", "food"];

interface ProductForm {
  name: string;
  description: string;
  category: string;
  stock: number;
  isPremium: boolean;
  image: string;
  productLogo: string;
  corporateLogo: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  category: "coffee",
  stock: 100,
  isPremium: false,
  image: "☕",
  productLogo: "",
  corporateLogo: "",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  coffee: "☕",
  chocolate: "🍫",
  book: "📚",
  flower: "🌹",
  experience: "🎭",
  food: "🍽️",
};

export default function PartnerProductsPage() {
  const { gifts, partners, isLoading, loadAdminData, addGift } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted text-sm">Yükleniyor...</div>;
  }

  const partner = partners[0];
  const partnerGifts = partner ? gifts.filter((g) => g.partnerId === partner.id) : gifts;

  const handleOpenForm = (giftId?: string) => {
    if (giftId) {
      const gift = gifts.find(g => g.id === giftId);
      if (gift) {
        setForm({
          name: gift.name,
          description: gift.description,
          category: gift.category,
          stock: gift.stock,
          isPremium: gift.isPremium,
          image: gift.image,
          productLogo: gift.productLogo || "",
          corporateLogo: gift.corporateLogo || "",
        });
        setEditingId(giftId);
      }
    } else {
      setForm(EMPTY_FORM);
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Ürün adı gerekli");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Ürün açıklaması gerekli");
      return;
    }
    if (form.stock < 0) {
      toast.error("Stok negatif olamaz");
      return;
    }

    if (editingId) {
      toast.success("Ürün güncellendi");
    } else {
      if (typeof addGift === 'function') {
        addGift({
          name: form.name,
          description: form.description,
          category: form.category as any,
          stock: form.stock,
          isPremium: form.isPremium,
          image: CATEGORY_EMOJIS[form.category] || "🎁",
          productLogo: form.productLogo || undefined,
          corporateLogo: form.corporateLogo || undefined,
          partnerId: partner?.id || "",
          partnerName: partner?.name || "",
        });
      }
      toast.success("Yeni ürün eklendi");
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Ürün Yönetimi</h3>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Ürün
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="bg-card rounded-xl border-2 border-green-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground text-sm">
              {editingId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
            </h4>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 hover:bg-gray-100 rounded-lg" aria-label="Formu kapat">
              <X className="w-4 h-4 text-muted" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Ürün Adı *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Örn: Latte, Çikolata..."
                className="w-full px-3 py-2.5 bg-surface rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">Açıklama *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ürün açıklaması..."
                rows={2}
                className="w-full px-3 py-2.5 bg-surface rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-green-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value, image: CATEGORY_EMOJIS[e.target.value] || "🎁" })}
                  className="w-full px-3 py-2.5 bg-surface rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {CATEGORY_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Stok Adedi</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                  min={0}
                  className="w-full px-3 py-2.5 bg-surface rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>
            </div>

            {/* Logo Yükleme Alanları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ImageUploader
                label="Ürün Logosu"
                value={form.productLogo}
                onChange={(url) => setForm({ ...form, productLogo: url })}
                placeholder="Ürün logo URL'si"
                hint="Ürünü temsil eden görsel (ör. kahve görseli)"
              />
              <ImageUploader
                label="Kurumsal Logo"
                value={form.corporateLogo}
                onChange={(url) => setForm({ ...form, corporateLogo: url })}
                placeholder="Firma logo URL'si"
                hint="Marka veya firma logosu"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPremium}
                onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                className="w-4 h-4 rounded border-border text-green-500 focus:ring-green-200"
              />
              <span className="text-sm text-foreground">Premium Ürün</span>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="flex-1 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-3 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
            >
              {editingId ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {partnerGifts.length === 0 && (
            <div className="p-8 text-center">
              <Package className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted mb-1">Henüz ürün eklenmedi</p>
              <p className="text-xs text-muted">Yukarıdaki "Yeni Ürün" butonuyla ilk ürününüzü ekleyin.</p>
            </div>
          )}
          {partnerGifts.map((gift) => (
            <div key={gift.id} className="flex items-center gap-3 p-4 hover:bg-card-hover transition-colors">
              {gift.productLogo ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gift.productLogo} alt={gift.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <span className="text-3xl">{gift.image}</span>
              )}
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground">{gift.name}</h4>
                <p className="text-xs text-muted mt-0.5">{gift.description}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                    {gift.category}
                  </span>
                  {gift.isPremium && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                      PRO
                    </span>
                  )}
                  {gift.corporateLogo && (
                    <div className="w-4 h-4 rounded overflow-hidden bg-gray-50 flex-shrink-0" title="Kurumsal logo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gift.corporateLogo} alt="Kurumsal" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-lg font-bold",
                  gift.stock > 50 ? "text-green-600" : gift.stock > 10 ? "text-amber-600" : "text-red-600"
                )}>
                  {gift.stock}
                </p>
                <p className="text-[10px] text-muted">stok</p>
              </div>
              <button
                onClick={() => handleOpenForm(gift.id)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Ürünü düzenle"
              >
                <Edit3 className="w-4 h-4 text-muted" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
