"use client";

import React, { useState, useMemo } from "react";
import { Plus, Shield, RefreshCw, Loader2, Search, FileText, LayoutTemplate, History, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    useGetRolesQuery,
    useGetPermissionsQuery,
    useCreateRoleMutation
} from "@/lib/store/features/adminDashboardApi/adminDashboardApi";
import { CreateRoleWizard } from "../_components/create-role-wizard";
import { TemplateBuilderModal } from "../_components/template-builder-modal";
import { AdminRole } from "@/lib/store/features/adminDashboardApi/adminDashboardTypes";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { HistoryTable } from "@/components/dashboard/tables";
import { createRoleColumns } from "../../_columns/roles-table-columns";
import { RolesStats } from "./_components/roles-stats";
import { useRouter } from "next/navigation";

export default function RolesPermissionsPage() {
    const router = useRouter();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isTemplateOpen, setIsTemplateOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: rolesData, isLoading, refetch } = useGetRolesQuery();
    const { data: permissionsData } = useGetPermissionsQuery();
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();

    const handleCreateRole = async (values: any) => {
        try {
            // Note: backend only expects name, description, permissions right now
            await createRole({
                name: values.name,
                description: values.description || values.name,
                permissions: values.permissions
            }).unwrap();
            toast.success("Role created successfully.");
            setIsWizardOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to create role");
        }
    };

    const handleEditRole = (role: AdminRole) => {
        router.push(`/dashboard/ad/access-control/roles/${role.id}`);
    };

    const handleDeleteRole = (role: AdminRole) => {
        toast.error(`Delete functionality for ${role.name} is coming soon.`);
    };

    const columns = useMemo(() =>
        createRoleColumns(handleEditRole, handleDeleteRole),
        [rolesData]);

    const filteredRoles = useMemo(() => {
        if (!rolesData?.data) return [];
        return rolesData.data.filter(role =>
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [rolesData, searchTerm]);

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
            {/* Breadcrumbs & Header */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 font-outfit">Roles & Permissions Management</h1>
                        <p className="text-gray-500 max-w-2xl leading-relaxed">
                            Control system access by defining granular roles. Assign specific permissions to ensure security and organizational efficiency.
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <RolesStats
                totalRoles={rolesData?.data?.length || 0}
                totalPermissions={permissionsData?.data?.length || 0}
            />

            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/50 p-4 rounded-2xl border border-gray-100 backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={() => setIsWizardOpen(true)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 shadow-lg shadow-cyan-100"
                    >
                        <Plus className="mr-2 h-4.5 w-4.5" /> Create New Role
                    </Button>
                    <Button variant="outline" onClick={() => setIsTemplateOpen(true)} className="font-semibold border-gray-200 hover:bg-gray-50 flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-cyan-600" />
                        Role Templates
                    </Button>
                    <Button variant="outline" className="font-semibold border-gray-200 hover:bg-gray-50 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        Audit Report
                    </Button>
                </div>

                <div className="relative w-full lg:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder="Search roles..."
                        className="pl-10 h-11 border-gray-200 focus:ring-cyan-500 rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Table Area */}
            <Card className="border-none shadow-xl shadow-gray-100/50 overflow-hidden ring-1 ring-gray-100">
                <CardContent className="p-0">
                    <HistoryTable
                        columns={columns}
                        data={filteredRoles}
                        isLoading={isLoading}
                        emptyState={
                            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                                <div className="p-6 bg-gray-50 rounded-full">
                                    <Shield className="w-12 h-12 text-gray-200" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900">No roles match your search</h3>
                                    <p className="text-gray-500">Try adjusting your search terms or filters.</p>
                                </div>
                                <Button variant="link" onClick={() => setSearchTerm("")}>Clear search</Button>
                            </div>
                        }
                    />
                </CardContent>
            </Card>

            {/* Role Creation Dialog */}
            <CreateRoleWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onSubmit={handleCreateRole}
                availablePermissions={permissionsData?.data || []}
                isLoading={isCreating}
            />

            {/* Template Builder Dialog */}
            <TemplateBuilderModal
                isOpen={isTemplateOpen}
                onClose={() => setIsTemplateOpen(false)}
            />
        </div>
    );
}
