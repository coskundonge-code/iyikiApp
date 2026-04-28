"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gift, Download, ExternalLink, Clock, Heart } from "lucide-react";

export default function GiftPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [showDownload, setShowDownload] = useState(false);

  // In a real app, this would fetch from API using the code
  // For demo, we show a generic preview
  const previewData = {
    senderName: "Bir Arkadaşın",
    giftName: "Starbucks Latte",
    giftEmoji: "☕",
    partnerName: "Starbucks",
    note: "Bugün aklıma geldin",
    expiresIn: "71 saat",
    code: code?.toString().toUpperCase() || "TKR-XXXXXX",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mb-3 shadow-lg"
          >
            <Gift className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-xl font-bold text-gray-900">iyi ki</h1>
        </div>

        {/* Gift Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Gift Visual */}
          <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 150, delay: 0.5 }}
              className="text-7xl mb-4"
            >
              {previewData.giftEmoji}
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900">{previewData.giftName}</h2>
            <p className="text-sm text-gray-500 mt-1">{previewData.partnerName}</p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="bg-rose-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{previewData.senderName}</span>{" "}
                sana bir jest yaptı
              </p>
              {previewData.note && (
                <p className="text-sm text-gray-500 mt-1 italic">
                  &ldquo;{previewData.note}&rdquo;
                </p>
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Kullanım süresi: <span className="font-semibold text-gray-700">{previewData.expiresIn}</span></span>
            </div>

            {/* CTA */}
            {!showDownload ? (
              <button
                onClick={() => setShowDownload(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-2xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg text-base"
              >
                <Gift className="w-5 h-5" />
                Hediyeni Al
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-sm text-gray-600">
                  Hediyeni almak için uygulamayı indir ve telefon numaranla giriş yap
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Uygulamaya Git
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                    App Store
                  </button>
                  <button className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                    Google Play
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Söylemene gerek yok, düşünmen yeter.
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-400">
            <Heart className="w-3 h-3" />
            <span>iyi ki tarafından desteklenmektedir</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
