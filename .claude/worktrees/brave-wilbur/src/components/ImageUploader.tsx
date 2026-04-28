"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Link2, X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  hint?: string;
}

export default function ImageUploader({
  label,
  value,
  onChange,
  placeholder = "Logo URL yapıştırın veya dosya yükleyin",
  hint,
}: ImageUploaderProps) {
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [urlInput, setUrlInput] = useState(value || "");
  const [previewError, setPreviewError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = useCallback(() => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setPreviewError(false);
    }
  }, [urlInput, onChange]);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Dosya boyutu kontrolü (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert("Dosya boyutu 2MB'dan küçük olmalı");
        return;
      }

      // Sadece resim dosyaları
      if (!file.type.startsWith("image/")) {
        alert("Lütfen bir resim dosyası seçin");
        return;
      }

      setUploading(true);

      try {
        // Base64'e çevir (Supabase Storage entegrasyonu yoksa yerel önizleme)
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onChange(base64);
          setPreviewError(false);
          setUploading(false);
        };
        reader.onerror = () => {
          alert("Dosya okunamadı");
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } catch {
        alert("Yükleme başarısız");
        setUploading(false);
      }

      // Input'u temizle ki aynı dosyayı tekrar seçebilsin
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("");
    setUrlInput("");
    setPreviewError(false);
  }, [onChange]);

  const hasPreview = value && !previewError;

  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>

      {/* Önizleme */}
      {hasPreview && (
        <div className="relative mb-2 inline-block">
          <div className="w-16 h-16 rounded-xl border-2 border-green-200 overflow-hidden bg-gray-50 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="w-full h-full object-contain"
              onError={() => setPreviewError(true)}
            />
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Logoyu kaldır"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Mod Seçimi */}
      <div className="flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mode === "url"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <Link2 className="w-3 h-3" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mode === "upload"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <Upload className="w-3 h-3" />
          Dosya
        </button>
      </div>

      {/* URL Modu */}
      {mode === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setPreviewError(false);
            }}
            onBlur={handleUrlSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 bg-surface rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          />
          {urlInput && !value && (
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-3 py-2 bg-green-500 text-white rounded-xl text-xs font-medium hover:bg-green-600 transition-colors"
            >
              Ekle
            </button>
          )}
        </div>
      )}

      {/* Dosya Yükleme Modu */}
      {mode === "upload" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-muted hover:border-green-300 hover:text-green-600 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                Resim seçin (max 2MB)
              </>
            )}
          </button>
        </div>
      )}

      {/* Hata gösterimi */}
      {previewError && value && (
        <p className="text-xs text-red-500 mt-1">Resim yüklenemedi. URL&apos;yi kontrol edin.</p>
      )}

      {hint && <p className="text-[10px] text-muted mt-1">{hint}</p>}
    </div>
  );
}
