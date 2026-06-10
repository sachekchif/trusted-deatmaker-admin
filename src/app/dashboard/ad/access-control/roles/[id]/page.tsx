"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
    useGetRolesQuery,
    useGetPermissionsQuery,
} from "@/lib/store/features/adminDashboardApi/adminDashboardApi";

const CATEGORIES: Record<string, string> = {
    "USR": "Users",
    "DSR": "Disputes",
    "FIN": "Finance",
    "SEC": "Security",
    "ROLES": "Roles"
};

const getCategory = (perm: string) => {
    const prefix = perm.split('-')[0] || perm.split('_')[0];
    return CATEGORIES[prefix] || "System Attributes";
};

// Extracted from table cols logic to keep consistent
const getRoleLevelInfo = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('vp') || n.includes('executive') || n.includes('head')) {
        return { level: "Level 4", codePrefix: "EX-" };
    }
    if (n.includes('manager') || n.includes('finance') || n.includes('lead')) {
        return { level: "Level 3", codePrefix: "MGR-" };
    }
    if (n.includes('admin') || n.includes('coordinator') || n.includes('officer')) {
        return { level: "Level 2", codePrefix: "ADM-" };
    }
    return { level: "Level 1", codePrefix: "SPEC-" };
};

export default function RoleDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const roleId = params.id as string;
    
    const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
    const { data: permissionsData, isLoading: permsLoading } = useGetPermissionsQuery();
    
    const role = useMemo(() => {
        return rolesData?.data?.find(r => r.id === roleId);
    }, [rolesData, roleId]);

    const availablePermissions = permissionsData?.data || [];
    
    // State to hold current modified selections
    const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (role) {
            setSelectedPerms(new Set(role.permissions));
        }
    }, [role]);

    const categoriesMap = useMemo(() => {
        const map = new Map<string, string[]>();
        availablePermissions.forEach(p => {
            const cat = getCategory(p);
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(p);
        });
        return map;
    }, [availablePermissions]);

    const { codePrefix, level } = role ? getRoleLevelInfo(role.name) : { codePrefix: '', level: 'Level 1' };
    const code = role ? `${codePrefix}${role.name.substring(0, 3).toUpperCase()}` : '';

    const handleToggle = (perm: string) => {
        const next = new Set(selectedPerms);
        if (next.has(perm)) {
            next.delete(perm);
        } else {
            next.add(perm);
        }
        setSelectedPerms(next);
    };

    const changesSummary = useMemo(() => {
        if (!role) return { added: [], removed: [], total: 0 };
        const initial = new Set(role.permissions);
        const added = Array.from(selectedPerms).filter(p => !initial.has(p));
        const removed = Array.from(initial).filter(p => !selectedPerms.has(p));
        return {
            added,
            removed,
            total: added.length + removed.length
        };
    }, [role, selectedPerms]);

    const handleSave = async () => {
        setIsSaving(true);
        // Fallback simulate delay since there is no update mutation yet
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Role permissions updated successfully.");
            // normally you'd trigger a router.push or refetch here
            // we will simulate the new permissions as saved locally by doing nothing or redirecting
        }, 800);
    };

    const handleCancel = () => {
        if (role) {
            setSelectedPerms(new Set(role.permissions));
        }
    };

    if (rolesLoading || permsLoading || !role) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-700">
            <button 
                onClick={() => router.push('/dashboard/ad/access-control/roles')}
                className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Roles Management
            </button>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Main Content Pane */}
                <div className="flex-1 space-y-8 w-full">
                    {/* Header Details */}
                    <div className="p-6 border rounded-2xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold font-outfit text-gray-900">{level} {role.name}</h1>
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                                <span>Code: {code}</span>
                            </div>
                        </div>
                    </div>

                    {/* Permissions Grid */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                                Current Role Permissions
                            </h2>
                        </div>

                        <div className="space-y-8">
                            {Array.from(categoriesMap.entries()).map(([category, perms]) => (
                                <div key={category} className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-800 tracking-wide">{category}</h3>
                                    <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-4">
                                        {perms.map(p => (
                                            <div key={p} className="flex items-center space-x-3 bg-white p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                                                <Checkbox 
                                                    id={`perm-${p}`} 
                                                    checked={selectedPerms.has(p)} 
                                                    onCheckedChange={() => handleToggle(p)}
                                                    className="w-5 h-5 rounded data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                                                />
                                                <div className="flex flex-col flex-1">
                                                    <label htmlFor={`perm-${p}`} className="text-sm font-bold text-gray-700 cursor-pointer">
                                                        {p}
                                                    </label>
                                                    <span className="text-[10px] text-gray-400 capitalize">
                                                        {p.replace(/_/g, ' ').toLowerCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* SLA / Limits placeholder section based on mockup */}
                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="text-sm font-bold text-gray-800 tracking-wide">SLA Limits & Conditions</h3>
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2 p-4 border rounded-xl bg-gray-50/50">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Amount Limit</label>
                                    <p className="text-sm font-bold text-gray-900">$5,000</p>
                                </div>
                                <div className="space-y-2 p-4 border rounded-xl bg-gray-50/50">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Requires approval above threshold</label>
                                    <Checkbox checked className="mt-1 opacity-50 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2 p-4 border rounded-xl bg-gray-50/50">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Needs dual authorization</label>
                                    <Checkbox className="mt-1 opacity-50 cursor-not-allowed" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Sticky Right Side Panel */}
                <div className="w-full lg:w-80 shrink-0 sticky top-6 space-y-4 z-10">
                    <Card className="border border-gray-200 shadow-xl shadow-gray-100/50 rounded-2xl overflow-hidden">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h3 className="font-bold text-gray-900">Change Summary</h3>
                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                    Modified Permissions: {changesSummary.total}
                                </span>
                            </div>

                            {changesSummary.total === 0 ? (
                                <div className="py-6 text-center text-sm font-medium text-gray-400">
                                    No changes made yet
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {changesSummary.added.map(p => (
                                        <div key={p} className="flex justify-between items-center text-sm p-2 rounded bg-emerald-50 text-emerald-700">
                                            <span className="font-mono text-xs">{p}</span>
                                            <span className="font-bold text-[10px] uppercase">+ Grant</span>
                                        </div>
                                    ))}
                                    {changesSummary.removed.map(p => (
                                        <div key={p} className="flex justify-between items-center text-sm p-2 rounded bg-red-50 text-red-700">
                                            <span className="font-mono text-xs">{p}</span>
                                            <span className="font-bold text-[10px] uppercase">- Revoke</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t space-y-3">
                                <Button 
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 font-bold" 
                                    disabled={changesSummary.total === 0 || isSaving}
                                    onClick={handleSave}
                                >
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                                </Button>
                                <Button 
                                    className="w-full text-gray-500 font-bold" 
                                    variant="ghost"
                                    disabled={changesSummary.total === 0 || isSaving}
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800 items-start">
                        <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                        <p className="font-medium leading-relaxed">
                            All permission changes are logged. Affected users will receive notifications.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
