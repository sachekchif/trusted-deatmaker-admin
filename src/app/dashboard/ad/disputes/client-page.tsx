"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Search, Download, Filter, XCircle, Loader2,
    AlertTriangle, RefreshCw, FileText, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { HistoryTable } from "@/components/dashboard/tables";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker, ConfigProvider } from "antd";
import dayjs from "dayjs";
import { SortingState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import { Dispute, getDisputesColumns } from "../_columns/disputes-table-column";
import { DisputeDetailsDrawer } from "./dispute-details-drawer";
import {
    useGetDisputeDashboardQuery,
    useGetDisputesQuery,
} from "@/lib/store/features/adminDashboardApi/adminDashboardApi";
import { AdminDisputeDashboardListItem } from "@/lib/store/features/adminDashboardApi/adminDashboardTypes";

const { RangePicker } = DatePicker;

// ── Inline Stats ─────────────────────────────────────────────────────────────
function DisputeStatsRow() {
    const { data: totalRes } = useGetDisputesQuery({ size: 1 });
    const { data: unassignedRes } = useGetDisputeDashboardQuery({ filter: 'UNASSIGNED', size: 1 });
    const { data: myCasesRes } = useGetDisputeDashboardQuery({ filter: 'MY_CASES', size: 1 });
    const { data: criticalRes } = useGetDisputeDashboardQuery({ filter: 'AT_RISK', size: 1 });
    const { data: breachedRes } = useGetDisputeDashboardQuery({ filter: 'BREACHED', size: 1 });

    const stats = [
        { title: "total cases", value: totalRes?.data?.totalElements ?? 0, color: "text-gray-900" },
        { title: "unassigned", value: unassignedRes?.data?.disputes?.totalElements ?? 0, color: "text-amber-600" },
        { title: "my cases", value: myCasesRes?.data?.disputes?.totalElements ?? 0, color: "text-cyan-600" },
        { title: "critical", value: criticalRes?.data?.disputes?.totalElements ?? 0, color: "text-red-600" },
        { title: "sla breach risk", value: breachedRes?.data?.disputes?.totalElements ?? 0, color: "text-orange-600" },
    ];

    const isLoading = !totalRes || !unassignedRes || !myCasesRes || !criticalRes || !breachedRes;

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-5 rounded-2xl border bg-white shadow-sm space-y-3">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-8 w-14" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.title}
                    className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow space-y-2"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold tracking-widest text-gray-400">{stat.title}</p>
                    </div>
                    <p className={`text-3xl font-black tabular-nums ${stat.color}`}>{stat.value.toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientDisputesPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [priority, setPriority] = useState("all");
    const [tier, setTier] = useState("TIER_2");
    const [dashboardFilter, setDashboardFilter] = useState("ALL");
    const [dateRange, setDateRange] = useState<[string, string]>(["", ""]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPagination(p => ({ ...p, pageIndex: 0 }));
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const handleAction = (dispute: Dispute, actionType: "VIEW" | "CLAIM" | "REVIEW") => {
        if (actionType === "VIEW" || actionType === "CLAIM") {
            setSelectedDispute(dispute);
            setIsDrawerOpen(true);
        } else {
            router.push(`/dashboard/ad/disputes/${dispute.id}`);
        }
    };

    const columns = useMemo(() => getDisputesColumns(handleAction), []);

    const { data: dashboardResponse, isLoading, isFetching, refetch } = useGetDisputeDashboardQuery({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
        status: status === "all" ? undefined : status,
        priority: priority === "all" ? undefined : priority,
        tier: tier === "all" ? undefined : tier,
        filter: dashboardFilter as any,
        startDate: dateRange[0] || undefined,
        endDate: dateRange[1] || undefined,
        sort: sorting.length > 0
            ? sorting.map(s => `${s.id === "dateTime" ? "created_at" : s.id},${s.desc ? "DESC" : "ASC"}`)
            : undefined,
    });

    const mapDispute = (item: AdminDisputeDashboardListItem): Dispute => ({
        id: item.id,
        disputeReference: item.disputeReference,
        dealReference: item.dealReference,
        dealId: item.dealId,
        dateTime: new Date(item.createdAt).toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric",
        }),
        dealAmount: item.dealAmount,
        preferredResolution: item.preferredResolution,
        currencyCode: item.currencyCode,
        buyerName: item.claimant.name,
        sellerName: item.respondent.name,
        priority: item.priority,
        status: item.status,
        tier: item.tier,
        sla: item.sla,
        assignedAdmin: item.assignedAdmin
            ? { name: item.assignedAdmin.name, email: item.assignedAdmin.email }
            : null,
    });

    const disputes: Dispute[] = dashboardResponse?.data?.disputes?.content?.map(mapDispute) || [];

    const handleClearFilters = () => {
        setSearch("");
        setStatus("all");
        setPriority("all");
        setTier("TIER_2");
        setDashboardFilter("ALL");
        setDateRange(["", ""]);
        setPagination(p => ({ ...p, pageIndex: 0 }));
    };

    const hasFilters = search || status !== "all" || priority !== "all" || tier !== "TIER_2" || dashboardFilter !== "ALL" || dateRange[0];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: "#0891b2", borderRadius: 8 } }}>
            <div className="container mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 font-outfit">
                            Dispute Management
                        </h1>
                        <p className="text-gray-500 max-w-2xl leading-relaxed">
                            Monitor, assign and resolve disputes across all tiers. Use filters to drill into specific cases and track SLA compliance.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            variant="outline"
                            className="font-semibold border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => refetch()}
                        >
                            <RefreshCw className="w-4 h-4 text-cyan-600" />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            className="font-semibold border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4 text-amber-600" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Statistics */}
                <DisputeStatsRow />

                {/* Action Bar */}
                <div className="bg-white/50 border border-gray-100 rounded-2xl backdrop-blur-sm overflow-hidden">
                    {/* Tier selector + Tabs */}
                    <div className="px-4 pt-4 flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-100 pb-0">
                        <div className="flex items-center gap-2 shrink-0">
                            <Select value={tier} onValueChange={(v) => { setTier(v); setPagination(p => ({ ...p, pageIndex: 0 })); }}>
                                <SelectTrigger className="w-auto border-none bg-transparent hover:bg-transparent p-0 text-base font-bold shadow-none focus:ring-0 gap-1">
                                    <SelectValue placeholder="Select Tier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Tiers</SelectItem>
                                    <SelectItem value="TIER_1">Tier 1</SelectItem>
                                    <SelectItem value="TIER_2">Tier 2</SelectItem>
                                    <SelectItem value="TIER_3">Tier 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Tabs value={dashboardFilter} onValueChange={(v) => { setDashboardFilter(v); setPagination(p => ({ ...p, pageIndex: 0 })); }} className="flex-1">
                            <TabsList className="bg-transparent h-auto p-0 gap-6 justify-start">
                                {[
                                    { value: "ALL", label: "All Cases" },
                                    { value: "UNASSIGNED", label: "Unassigned" },
                                    { value: "MONITORING", label: "Monitoring" },
                                    { value: "MY_CASES", label: "My Cases" },
                                ].map(tab => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-600 data-[state=active]:bg-transparent data-[state=active]:text-cyan-700 px-0 pb-4 h-full text-sm font-semibold text-gray-500"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Filters row */}
                    <div className="flex flex-wrap items-center gap-3 p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            <Input
                                placeholder="Search reference, name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10 w-[220px] lg:w-[260px] border-gray-200 rounded-xl focus:ring-cyan-500"
                            />
                        </div>

                        <Select value={status} onValueChange={(v) => { setStatus(v); setPagination(p => ({ ...p, pageIndex: 0 })); }}>
                            <SelectTrigger className="w-[140px] border-gray-200 rounded-xl h-10">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="OPEN">Open</SelectItem>
                                <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                                <SelectItem value="ARBITRATION">Arbitration</SelectItem>
                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                                <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                                <SelectItem value="MONITORING">Monitoring</SelectItem>
                                <SelectItem value="RESOLUTION_FAILED">Failed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={priority} onValueChange={(v) => { setPriority(v); setPagination(p => ({ ...p, pageIndex: 0 })); }}>
                            <SelectTrigger className="w-[130px] border-gray-200 rounded-xl h-10">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="STANDARD">Standard</SelectItem>
                                <SelectItem value="CRITICAL">Critical</SelectItem>
                            </SelectContent>
                        </Select>

                        <RangePicker
                            value={dateRange[0] ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
                            onChange={(_dates, strings) => {
                                setDateRange(strings);
                                setPagination(p => ({ ...p, pageIndex: 0 }));
                            }}
                            className="h-10 border-gray-200"
                            style={{ borderRadius: "12px", width: "240px" }}
                        />

                        {hasFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold"
                            >
                                <XCircle className="h-4 w-4 mr-1.5" />
                                Clear Filters
                            </Button>
                        )}

                        {isFetching && !isLoading && (
                            <Loader2 className="h-4 w-4 animate-spin text-cyan-600 ml-auto" />
                        )}
                    </div>
                </div>

                {/* Table */}
                <Card className="border-none shadow-xl shadow-gray-100/50 overflow-hidden ring-1 ring-gray-100">
                    <CardContent className="p-0">
                        <HistoryTable
                            columns={columns}
                            data={disputes}
                            isLoading={isLoading}
                            pagination={pagination}
                            onPaginationChange={setPagination}
                            pageCount={dashboardResponse?.data?.pagination?.totalPages ?? -1}
                            onSortingChange={setSorting}
                            state={{ sorting }}
                            emptyState={
                                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                                    <div className="p-6 bg-gray-50 rounded-full">
                                        <ShieldAlert className="w-12 h-12 text-gray-200" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-gray-900">No disputes found</h3>
                                        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                                    </div>
                                    {hasFilters && (
                                        <Button variant="link" onClick={handleClearFilters}>Clear filters</Button>
                                    )}
                                </div>
                            }
                        />
                    </CardContent>
                </Card>

                {/* Drawer */}
                <DisputeDetailsDrawer
                    dispute={selectedDispute}
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                />
            </div>
        </ConfigProvider>
    );
}

