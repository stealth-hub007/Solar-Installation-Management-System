/**
 * Technician Helper Utilities
 */

export const calculateShadowFreeAreaPercent = (totalArea, shadowFreeArea) => {
  if (!totalArea || Number(totalArea) <= 0) return 0;
  const shadow = Number(shadowFreeArea) || 0;
  return Math.min(100, Math.round((shadow / Number(totalArea)) * 100));
};

export const calculateEstimatedDailyGeneration = (capacityKw) => {
  if (!capacityKw || Number(capacityKw) <= 0) return 0;
  return Math.round(Number(capacityKw) * 4.5);
};

export const formatDurationHours = (seconds) => {
  if (!seconds || seconds <= 0) return '0h 00m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export const getTechnicianStatusBadgeVariant = (status) => {
  switch (String(status).toUpperCase()) {
    case 'COMPLETED':
    case 'APPROVED':
    case 'VERIFIED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'SCHEDULED':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'SUBMITTED':
    case 'PENDING_APPROVAL':
    case 'PENDING':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'REJECTED':
    case 'MISMATCH':
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

