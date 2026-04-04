"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatPhone, generateOTP } from "@/lib/utils";
import toast from "react-hot-toast";

export default function VerifyPage() {
  const router = useRouter();
  const pendingPhone = useAppStore((s) => s.pendingPhone);
  const login = useAppStore((s) => s.login);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [demoOtp] = useState(() => generateOTP());
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!pendingPhone) {
      router.replace("/login");
      return;
    }
    // Show demo OTP
    toast(`Demo kodu: ${demoOtp}`, { icon: "🔑", duration: 10000 });
  }, [pendingPhone, router, demoOtp]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    const fullCode = newOtp.join("");
    if (fullCode.length === 6) {
      verifyCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    if (pasted.length === 6) {
      verifyCode(pasted);
    }
  };

  const verifyCode = (code: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      if (code === demoOtp) {
        if (pendingPhone) {
          login(pendingPhone);
          toast.success("Hoş geldin!");
          router.push("/home");
        }
      } else {
        toast.error("Geçersiz kod, tekrar dene");
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
        setIsVerifying(false);
      }
    }, 1000);
  };

  const handleResend = () => {
    setTimer(60);
    const newCode = generateOTP();
    toast(`Yeni kod: ${newCode}`, { icon: "🔑", duration: 10000 });
  };

  if (!pendingPhone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      style={{ opacity: 1 }}
    >
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-muted hover:text-foreground mb-6 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Geri
      </button>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Doğrulama Kodu</h2>
          <p className="text-muted text-sm mt-2">
            {formatPhone(pendingPhone)} numarasına gönderilen 6 haneli kodu gir
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="otp-input"
              disabled={isVerifying}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Verifying State */}
        {isVerifying && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-muted">Doğrulanıyor...</span>
          </div>
        )}

        {/* Timer / Resend */}
        <div className="text-center">
          {timer > 0 ? (
            <p className="text-sm text-muted">
              Tekrar gönder: <span className="font-mono font-medium text-foreground">{String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="flex items-center gap-1.5 mx-auto text-sm text-primary hover:text-primary-dark font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tekrar Gönder
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
