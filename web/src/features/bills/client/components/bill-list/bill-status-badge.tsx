import { Badge } from "@/components/ui/badge";
import type { BillStatusEnum } from "../../../shared/types";
import {
  getCardStatusLabel,
  getStatusVariant,
} from "../../../shared/utils/bill-status";

interface BillStatusBadgeProps {
  status: BillStatusEnum;
  statusNote?: string | null;
  className?: string;
}

export function BillStatusBadge({
  status,
  statusNote,
  className,
}: BillStatusBadgeProps) {
  return (
    <Badge variant={getStatusVariant(status)} className={className}>
      {getCardStatusLabel(status, statusNote)}
    </Badge>
  );
}
