/**
 * Validation rules for Solar Installation Jobs & Completion
 */
import { MANDATORY_CHECKLIST_ITEMS } from './technicianConstants';

export const validateInstallationChecklist = (checklist) => {
  const incomplete = [];

  MANDATORY_CHECKLIST_ITEMS.forEach((item) => {
    if (!item.optional && !checklist[item.key]) {
      incomplete.push(item.label);
    }
  });

  return {
    isFullyComplete: incomplete.length === 0,
    incompleteItems: incomplete,
    completionPercentage: Math.round(
      (MANDATORY_CHECKLIST_ITEMS.filter((i) => i.optional || checklist[i.key]).length /
        MANDATORY_CHECKLIST_ITEMS.length) *
        100
    ),
  };
};

export const validatePreCompletion = ({ checklist, signoff, verifiedEquipments, activeSession }) => {
  const blockingReasons = [];

  if (activeSession && activeSession.isRunning) {
    blockingReasons.push('Active work session must be ended before completing job.');
  }

  const checklistStatus = validateInstallationChecklist(checklist || {});
  if (!checklistStatus.isFullyComplete) {
    blockingReasons.push(
      `Checklist is incomplete (${checklistStatus.incompleteItems.length} items remaining).`
    );
  }

  if (verifiedEquipments && verifiedEquipments.some((e) => e.status !== 'VERIFIED')) {
    blockingReasons.push('Delivered hardware has unverified serial numbers or discrepancies.');
  }

  if (!signoff || !signoff.signature_path) {
    blockingReasons.push('Customer digital signature sign-off has not been captured.');
  }

  return {
    canComplete: blockingReasons.length === 0,
    blockingReasons,
  };
};
