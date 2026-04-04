import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();

  if (diff <= 0) return 'Süresi doldu';

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainHours = hours % 24;
    return `${days} gün ${remainHours} saat`;
  }

  return `${hours} saat ${minutes} dk`;
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days < 7) return `${days} gün önce`;
  return date.toLocaleDateString('tr-TR');
}

export function getExpiryPercentage(createdAt: string, expiresAt: string): number {
  const now = new Date();
  const created = new Date(createdAt);
  const expires = new Date(expiresAt);
  const total = expires.getTime() - created.getTime();
  const elapsed = now.getTime() - created.getTime();
  const remaining = Math.max(0, Math.min(100, ((total - elapsed) / total) * 100));
  return Math.round(remaining);
}

export function formatPhone(phone: string): string {
  if (phone.startsWith('+90')) {
    const digits = phone.slice(3);
    return `+90 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  }
  return phone;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Bekliyor',
    claimed: 'Kullanıldı',
    expired: 'Süresi Doldu',
    social_pool: 'Askıda',
    distributed: 'Dağıtıldı',
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    claimed: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    social_pool: 'bg-purple-100 text-purple-800',
    distributed: 'bg-blue-100 text-blue-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}
