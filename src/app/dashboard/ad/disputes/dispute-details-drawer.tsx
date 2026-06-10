"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dispute } from "../_columns/disputes-table-column";
import { User, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClaimDisputeMutation } from "@/lib/store/features/adminDashboardApi/adminDashboardApi";
import { toast } from "sonner";

interface DisputeDetailsDrawerProps {
  dispute: Dispute | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DisputeDetailsDrawer({ dispute, isOpen, onClose }: DisputeDetailsDrawerProps) {
  const [claimDispute, { isLoading: isClaiming }] = useClaimDisputeMutation();

  if (!dispute) return null;

  const handleClaim = async () => {
    try {
      await claimDispute(dispute.id).unwrap();
      toast.success("Dispute claimed successfully");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to claim dispute");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="border-b pb-4 mb-6">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            Dispute Details
            <Badge variant="outline" className="text-[10px] font-mono border-cyan-200 text-cyan-600 bg-cyan-50">
              #{dispute.disputeReference}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-8">
          {/* Status & Priority */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Status</p>
              <Badge className="bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100 flex items-center gap-1.5 px-3 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {dispute.status}
              </Badge>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Priority</p>
              <Badge className={cn(
                "border-0 px-3 py-1",
                dispute.priority === "CRITICAL" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
              )}>
                {dispute.priority}
              </Badge>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Transaction ID</span>
              <span className="text-sm font-bold text-slate-900">#{dispute.dealReference}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-3">
              <span className="text-xs text-slate-500">Dispute Amount</span>
              <span className="text-sm font-bold text-slate-900">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: dispute.currencyCode || "NGN",
                }).format(dispute.dealAmount)}
              </span>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Claimant (Buyer)</p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-xs">
                  {dispute.buyerName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700">{dispute.buyerName}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Respondent (Seller)</p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                  {dispute.sellerName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700">{dispute.sellerName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Placeholder (Not available in Dispute interface currently) */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Reason for Dispute</p>
            <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
              {dispute.preferredResolution || "The buyer requested a full refund due to item mismatch."}
            </div>
          </div>

          {/* SLA Info */}
          {dispute.sla && (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-red-600">SLA Breach Risk</span>
                <span className="text-[10px] text-red-400">Resolution required in {Math.floor((dispute.sla.remainingMinutes || 0) / 60)} hours</span>
              </div>
            </div>
          )}

          {/* Action */}
          <div className="pt-6 border-t">
            <Button 
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold h-12 shadow-lg shadow-cyan-100"
                onClick={handleClaim}
                disabled={isClaiming}
            >
              {isClaiming ? "Assigning..." : "Assign to Me"}
            </Button>
            <p className="text-[10px] text-center text-slate-400 mt-3">
              By assigning this dispute, you become responsible for its resolution.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
