import { memo } from "react";

// Skeleton untuk StatsCard
export const StatsCardSkeleton = memo(function StatsCardSkeleton({ color }: { color: "cyan" | "blue" | "purple" | "green" }) {
  return (
    <div className="clay-stat-card">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-[var(--border-strong)] rounded-[var(--radius)] animate-pulse" />
        <div className="flex space-x-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-2.5 h-6 bg-[var(--border-strong)] rounded animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>
      <div className="h-4 bg-[var(--border-strong)] rounded w-20 animate-pulse" />
    </div>
  );
});

// Skeleton untuk History items
export const HistoryItemSkeleton = memo(function HistoryItemSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-2">
          <div className="h-5 bg-[var(--border-strong)] rounded w-16 animate-pulse" />
          <div className="h-4 bg-[var(--border-strong)] rounded w-24 animate-pulse" style={{ animationDelay: "200ms" }} />
        </div>
        <div className="h-6 bg-[var(--border-strong)] rounded-full w-16 animate-pulse" style={{ animationDelay: "300ms" }} />
      </div>
      <div className="h-3 bg-[var(--border-strong)] rounded w-32 animate-pulse" style={{ animationDelay: "400ms" }} />
    </div>
  );
});

// Skeleton untuk History section
export const HistorySkeleton = memo(function HistorySkeleton({ itemCount = 3 }: { itemCount?: number }) {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {Array.from({ length: itemCount }).map((_, index) => (
        <HistoryItemSkeleton key={index} index={index} />
      ))}
    </div>
  );
});

// Loading shimmer effect untuk text
export const ShimmerText = memo(function ShimmerText({ width = "w-20", height = "h-4" }: { width?: string; height?: string }) {
  return (
    <div className={`${height} ${width} bg-gradient-to-r from-[var(--border-strong)] via-[var(--border)] to-[var(--border-strong)] rounded animate-pulse`} />
  );
});

// Animated counter effect (simplified)
export const AnimatedCounter = memo(function AnimatedCounter({ value }: { value: number }) {
  return (
    <div className="text-2xl font-bold text-[var(--foreground)]">
      {value.toLocaleString()}
    </div>
  );
});

// Skeleton untuk BotTable
export const BotTableSkeleton = memo(function BotTableSkeleton() {
  return (
    <div className="overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {["No", "Tipe", "Grup", "Status", "Aksi"].map((title, index) => (
              <th key={index} className="text-left py-3 px-4">
                <div className="h-4 bg-[var(--border-strong)] rounded w-12 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-[var(--border)]">
              <td className="py-3 px-4">
                <div className="h-5 bg-[var(--border-strong)] rounded w-28 animate-pulse" />
              </td>
              <td className="py-3 px-4">
                <div className="h-4 bg-[var(--border-strong)] rounded w-16 animate-pulse" />
              </td>
              <td className="py-3 px-4">
                <div className="h-4 bg-[var(--border-strong)] rounded w-8 animate-pulse" />
              </td>
              <td className="py-3 px-4">
                <div className="h-6 bg-[rgba(34,197,94,0.12)] rounded-full w-16 inline-block animate-pulse" />
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-[var(--accent-glow)] rounded border border-[var(--accent-border)] animate-pulse" />
                  <div className="h-8 w-8 bg-[rgba(239,68,68,0.12)] rounded border border-[rgba(239,68,68,0.20)] animate-pulse" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export const AdminBotTableSkeleton = memo(function AdminBotTableSkeleton() {
  return (
    <div className="overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">User</th>
            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">No</th>
            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Tipe</th>
            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Grup</th>
            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Status</th>
            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((_, index) => (
            <tr key={index} className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><div className="h-4 w-20 bg-[var(--border-strong)] rounded animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-4 w-32 bg-[var(--border-strong)] rounded animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-[var(--border-strong)] rounded animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-4 w-12 bg-[var(--border-strong)] rounded animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-6 w-16 bg-[var(--border-strong)] rounded-full animate-pulse" /></td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-[var(--border-strong)] rounded animate-pulse" />
                  <div className="h-8 w-8 bg-[var(--border-strong)] rounded animate-pulse" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export const AdminUserTableSkeleton = memo(function AdminUserTableSkeleton() {
  return (
    <div>
      <div className="mb-4">
        <div className="h-10 bg-[var(--border-strong)] rounded-lg animate-pulse" />
      </div>
      
      {/* Table skeleton */}
      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">ID</th>
              <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Nama</th>
              <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Email</th>
              <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Koin</th>
              <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Role</th>
              <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Kelola Koin</th>
              <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((_, index) => (
              <tr key={index} className="border-b border-[var(--border)]">
                <td className="py-3 px-4"><div className="h-4 w-32 bg-[var(--border-strong)] rounded animate-pulse" /></td>
                <td className="py-3 px-4"><div className="h-4 w-24 bg-[var(--border-strong)] rounded animate-pulse" /></td>
                <td className="py-3 px-4"><div className="h-4 w-36 bg-[var(--border-strong)] rounded animate-pulse" /></td>
                <td className="py-3 px-4"><div className="h-4 w-16 bg-[var(--border-strong)] rounded animate-pulse" /></td>
                <td className="py-3 px-4"><div className="h-6 w-12 bg-[var(--border-strong)] rounded-full animate-pulse" /></td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <div className="h-8 w-24 bg-[var(--border-strong)] rounded animate-pulse" />
                    <div className="h-8 w-8 bg-[var(--border-strong)] rounded animate-pulse" />
                    <div className="h-8 w-8 bg-[var(--border-strong)] rounded animate-pulse" />
                  </div>
                </td>
                <td className="py-3 px-4"><div className="h-8 w-8 bg-[var(--border-strong)] rounded animate-pulse" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export const AdminTopUpTableSkeleton = memo(function AdminTopUpTableSkeleton() {
  return (
    <div className="overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">ID</th>
            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">User</th>
            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Jumlah</th>
            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Metode</th>
            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Status</th>
            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((_, index) => (
            <tr key={index} className="border-b border-[var(--border)]">
              <td className="py-3 px-4"><div className="h-4 w-24 bg-[var(--border-strong)] rounded animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-4 w-28 bg-[var(--border-strong)] rounded animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-[var(--border-strong)] rounded animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-4 w-16 bg-[var(--border-strong)] rounded animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-6 w-16 bg-[var(--border-strong)] rounded-full animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-4 w-32 bg-[var(--border-strong)] rounded animate-pulse" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
