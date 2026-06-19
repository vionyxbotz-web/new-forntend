import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldOff, Clock, AlertTriangle, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

interface BlockedUser {
  userId: string;
  count: number;
  resetAt: number;
  suspiciousActivity: number;
  blockType: 'rate_limit' | 'suspicious_activity';
  blockedUntil: string;
  timeRemaining: number;
}

interface BlockedIP {
  ip: string;
  endpoint?: string;
  violations: number;
  blockedUntil: number;
  timeRemaining: number;
}

interface AdminBlocksTableProps {
  blockedUsers: BlockedUser[];
  blockedIPs: BlockedIP[];
  onUpdate: () => void;
  isLoading: boolean;
}

export default function AdminBlocksTable({ blockedUsers, blockedIPs, onUpdate, isLoading }: AdminBlocksTableProps) {
  const [unblocking, setUnblocking] = useState<string | null>(null);
  const { toast } = useToast();

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} detik`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} menit`;
    return `${Math.ceil(seconds / 3600)} jam`;
  };

  const handleUnblock = async (type: 'user' | 'ip', identifier: string) => {
    try {
      setUnblocking(`${type}-${identifier}`);
      await backend.admin.unblock({ type, identifier });
      toast({
        title: "Berhasil!",
        description: `Berhasil membuka blokir ${type === 'user' ? 'user' : 'IP'}: ${identifier}`,
      });
      onUpdate();
    } catch (error: any) {
      console.error('Error unblocking:', error);
      toast({
        title: getErrorTitle(error, "Gagal membuka blokir"),
        description: getErrorMessage(error) || `Gagal membuka blokir ${type === 'user' ? 'user' : 'IP'}`,
        variant: "destructive",
      });
    } finally {
      setUnblocking(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  const totalBlocked = blockedUsers.length + blockedIPs.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="clay-card-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--foreground-muted)] text-sm">Total Blokir</p>
              <p className="text-2xl font-bold text-[#EF4444]">{totalBlocked}</p>
            </div>
            <Shield className="w-8 h-8 text-[#EF4444]" />
          </div>
        </Card>
        <Card className="clay-card-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--foreground-muted)] text-sm">User Terblokir</p>
              <p className="text-2xl font-bold text-[#F97316]">{blockedUsers.length}</p>
            </div>
            <UserX className="w-8 h-8 text-[#F97316]" />
          </div>
        </Card>
        <Card className="clay-card-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--foreground-muted)] text-sm">IP Terblokir</p>
              <p className="text-2xl font-bold text-[#EAB308]">{blockedIPs.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-[#EAB308]" />
          </div>
        </Card>
      </div>

      {totalBlocked === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-[var(--foreground-subtle)] mx-auto mb-4" />
          <p className="text-[var(--foreground-muted)] text-lg">Tidak ada user atau IP yang terblokir</p>
          <p className="text-[var(--foreground-subtle)] text-sm mt-2">Sistem keamanan berjalan dengan baik</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Blocked Users */}
          {blockedUsers.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <UserX className="w-5 h-5 text-[#F97316]" />
                User Terblokir ({blockedUsers.length})
              </h3>
              <div className="space-y-3">
                {blockedUsers.map((user, index) => (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="clay-card-sm p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-[var(--foreground)]">{user.userId}</h4>
                            <span 
                              className={
                                user.blockType === 'suspicious_activity' 
                                  ? 'clay-badge clay-badge-danger' 
                                  : 'clay-badge clay-badge-warning'
                              }
                            >
                              {user.blockType === 'suspicious_activity' ? 'Aktivitas Mencurigakan' : 'Rate Limit'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <p className="text-[var(--foreground-subtle)]">Request Count</p>
                              <p className="text-[var(--foreground)] font-medium">{user.count}</p>
                            </div>
                            <div>
                              <p className="text-[var(--foreground-subtle)]">Pelanggaran</p>
                              <p className="text-[var(--foreground)] font-medium">{user.suspiciousActivity}</p>
                            </div>
                            <div>
                              <p className="text-[var(--foreground-subtle)]">Sisa Waktu</p>
                              <p className="text-[var(--foreground)] font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(user.timeRemaining)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[var(--foreground-subtle)]">Blokir Hingga</p>
                              <p className="text-[var(--foreground)] font-medium text-xs">
                                {new Date(user.blockedUntil).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleUnblock('user', user.userId)}
                          disabled={unblocking === `user-${user.userId}`}
                          variant="outline"
                          className="!text-[#16A34A] dark:!text-[#4ADE80]"
                        >
                          <ShieldOff className="w-4 h-4 mr-2" />
                          {unblocking === `user-${user.userId}` ? 'Membuka...' : 'Buka Blokir'}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Blocked IPs */}
          {blockedIPs.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#EAB308]" />
                IP Terblokir ({blockedIPs.length})
              </h3>
              <div className="space-y-3">
                {blockedIPs.map((ip, index) => (
                  <motion.div
                    key={ip.ip}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="clay-card-sm p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-[var(--foreground)] font-mono">{ip.ip}</h4>
                            <span className="clay-badge clay-badge-warning">
                              {ip.endpoint || 'IP Mencurigakan'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-[var(--foreground-subtle)]">Total Pelanggaran</p>
                              <p className="text-[var(--foreground)] font-medium">{ip.violations}</p>
                            </div>
                            <div>
                              <p className="text-[var(--foreground-subtle)]">Sisa Waktu</p>
                              <p className="text-[var(--foreground)] font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(ip.timeRemaining)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[var(--foreground-subtle)]">Blokir Hingga</p>
                              <p className="text-[var(--foreground)] font-medium text-xs">
                                {new Date(ip.blockedUntil).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleUnblock('ip', ip.ip)}
                          disabled={unblocking === `ip-${ip.ip}`}
                          variant="outline"
                          className="!text-[#16A34A] dark:!text-[#4ADE80]"
                        >
                          <ShieldOff className="w-4 h-4 mr-2" />
                          {unblocking === `ip-${ip.ip}` ? 'Membuka...' : 'Buka Blokir'}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
