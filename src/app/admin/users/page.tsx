"use client";

import { useState } from "react";
import { Search, Shield, Ban, MoreVertical } from "lucide-react";
import { MOCK_USERS } from "@/lib/mock-data";
import { cn, getInitials, formatRelativeTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const users = MOCK_USERS.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.role.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim, telefon veya rol ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-card rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-3 bg-gray-50 border-b border-border text-xs font-medium text-muted">
          <span>Kullanıcı</span>
          <span>Rol</span>
          <span>Durum</span>
          <span>Kayıt</span>
        </div>
        <div className="divide-y divide-border">
          {users.map((user) => (
            <div key={user.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center p-3 hover:bg-card-hover transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name || "İsimsiz"}</p>
                  <p className="text-[10px] text-muted">{user.phone}</p>
                </div>
              </div>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                user.role === "admin" ? "bg-red-100 text-red-700" :
                user.role === "partner" ? "bg-green-100 text-green-700" :
                user.role === "sponsor" ? "bg-purple-100 text-purple-700" :
                "bg-blue-100 text-blue-700"
              )}>
                {user.role}
              </span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                user.status === "active" ? "bg-green-100 text-green-700" :
                user.status === "suspended" ? "bg-red-100 text-red-700" :
                "bg-gray-100 text-gray-700"
              )}>
                {user.status}
              </span>
              <span className="text-[10px] text-muted whitespace-nowrap">
                {formatRelativeTime(user.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
