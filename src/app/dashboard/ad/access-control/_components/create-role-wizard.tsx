import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Loader2, LayoutTemplate, RotateCcw, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const roleSchema = z.object({
    name: z.string().min(3, "Role name must be at least 3 characters"),
    code: z.string().optional(),
    department: z.string().optional(),
    tierLevel: z.string().optional(),
    description: z.string().min(5, "Description must be at least 5 characters"),
    permissions: z.array(z.string()).min(1, "Select at least one permission"),

    // SLA
    stdResponseTime: z.string().optional(),
    stdResponseUnit: z.string().optional(),
    highResponseTime: z.string().optional(),
    highResponseUnit: z.string().optional(),
    resolutionTime: z.string().optional(),
    resolutionUnit: z.string().optional(),
    notifyEmail: z.boolean().optional(),
    notifyInApp: z.boolean().optional(),
    notifySms: z.boolean().optional(),

    // Security
    auth2fa: z.boolean().optional(),
    authBio: z.boolean().optional(),
    authToken: z.boolean().optional(),
    sessionTimeout: z.string().optional(),
    singleSession: z.boolean().optional(),
    autoLogout: z.boolean().optional(),
    enableIpWhitelist: z.boolean().optional(),
    ipAddresses: z.string().optional(),
    businessHoursOnly: z.boolean().optional(),
    allowedDays: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof roleSchema>;

interface CreateRoleWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormValues) => void;
    availablePermissions: string[];
    isLoading?: boolean;
}

const CATEGORIES: Record<string, string> = {
    "USR": "User Management",
    "DSR": "Dispute Management",
    "FIN": "Finance Operations",
    "SEC": "Security Settings",
    "ROLES": "Role Configuration"
};

const getCategory = (perm: string) => {
    const prefix = perm.split('-')[0] || perm.split('_')[0];
    return CATEGORIES[prefix] || "General Permissions";
};

export function CreateRoleWizard({ isOpen, onClose, onSubmit, availablePermissions, isLoading }: CreateRoleWizardProps) {
    const [step, setStep] = useState(1);
    const [activeCategory, setActiveCategory] = useState<string>("All Permissions");
    const [initMethod, setInitMethod] = useState<"template" | "clone" | "custom">("template");

    const form = useForm<FormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: "", code: "", department: "", tierLevel: "Level 1", description: "",
            permissions: [],
            stdResponseTime: "1", stdResponseUnit: "Hours",
            highResponseTime: "15", highResponseUnit: "Minutes",
            resolutionTime: "24", resolutionUnit: "Hours",
            notifyEmail: true, notifyInApp: true, notifySms: false,
            auth2fa: true, authBio: false, authToken: false,
            sessionTimeout: "30", singleSession: true, autoLogout: true,
            enableIpWhitelist: false, ipAddresses: "",
            businessHoursOnly: false, allowedDays: ["Mo", "Tu", "We", "Th", "Fr"]
        },
    });

    const categoriesMap = useMemo(() => {
        const map = new Map<string, string[]>();
        availablePermissions.forEach(p => {
            const cat = getCategory(p);
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(p);
        });
        return map;
    }, [availablePermissions]);

    const handleNext = async () => {
        let valid = false;
        if (step === 1) valid = await form.trigger(["name", "description"]);
        else if (step === 2) valid = await form.trigger(["permissions"]);
        else valid = true; // steps 3 and 4 are optional fields

        if (valid) setStep(s => s + 1);
    };

    const handleSaveDraft = () => {
        // Just mock behaviour
        onClose();
        setStep(1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); setStep(1); }}>
            <DialogContent className="sm:max-w-[580px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white">
                <div className="bg-white px-6 pt-6 pb-4 border-b">
                    <DialogHeader>
                        <DialogTitle className="flex flex-col items-center gap-3">
                            <span className="text-lg font-semibold text-gray-900 tracking-tight">
                                Create New Role
                                <span className="text-gray-400 font-normal text-base ml-2">· Step {step} of 4</span>
                            </span>
                            <div className="flex items-center gap-1.5 w-full">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-cyan-500' : 'bg-gray-200'}`} />
                                ))}
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <Form {...form} className="flex-1 flex flex-col overflow-hidden">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4">

                            {/* STEP 1: Basic Details */}
                            <div className={step === 1 ? "block space-y-4" : "hidden"}>

                                {/* Info Banner */}
                                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                                    <svg className="mt-0.5 h-4 w-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" /></svg>
                                    <p className="text-xs text-blue-700">Required fields are marked with <span className="font-bold">*</span></p>
                                </div>

                                {/* Role Name */}
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-800"><span className="text-gray-800">*</span>Role Name</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange}>
                                                <SelectTrigger className="bg-white text-gray-500">
                                                    <SelectValue placeholder="Enter Role Name" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="custom">Custom Role</SelectItem>
                                                    <SelectItem value="finance-manager">Finance Manager</SelectItem>
                                                    <SelectItem value="support-agent">Support Agent</SelectItem>
                                                    <SelectItem value="operations-lead">Operations Lead</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <p className="text-[11px] text-gray-400 mt-1">Role name should be descriptive and unique</p>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* Role Code */}
                                <FormField control={form.control} name="code" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-800">Role Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Select One" {...field} className="bg-white text-gray-700" readOnly />
                                        </FormControl>
                                        <p className="text-[11px] text-gray-400 mt-1">Generated from role name</p>
                                    </FormItem>
                                )} />

                                {/* Department */}
                                <FormField control={form.control} name="department" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-800"><span className="text-gray-800">*</span>Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select Department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Operations">Operations</SelectItem>
                                                <SelectItem value="Finance">Finance</SelectItem>
                                                <SelectItem value="Support">Customer Support</SelectItem>
                                                <SelectItem value="Compliance">Compliance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />

                                {/* Level */}
                                <FormField control={form.control} name="tierLevel" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-800"><span className="text-gray-800">*</span>Level</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-2 mt-1">
                                                {[
                                                    { value: "Level 1", label: "Level 1 - Support User" },
                                                    { value: "Level 2", label: "Level 2 - Specialist" },
                                                    { value: "Level 3", label: "Level 3 - Manager" },
                                                    { value: "Level 4", label: "Level 4 - Vice President" },
                                                    { value: "Level 5", label: "Level 5 - Global Admin" },
                                                ].map(({ value, label }) => (
                                                    <div key={value} className="flex items-center gap-2.5">
                                                        <RadioGroupItem value={value} id={`level-${value}`} className="border-gray-400" />
                                                        <FormLabel htmlFor={`level-${value}`} className="text-sm font-normal text-gray-700 cursor-pointer">{label}</FormLabel>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )} />

                                {/* Max Users */}
                                <FormField control={form.control} name="sessionTimeout" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-800"><span className="text-gray-800">*</span>Max Users</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue="10">
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="10" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {[5, 10, 15, 20, 25, 50, 100].map(n => (
                                                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />

                                {/* Description */}
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-800">Description</FormLabel>
                                        <FormControl>
                                            <Textarea className="bg-white resize-none h-24" placeholder="Enter Role Description" {...field} />
                                        </FormControl>
                                        <p className="text-[11px] text-gray-400 mt-1">Detailed description of role responsibilities</p>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            {/* STEP 2: Permissions */}
                            <div className={step === 2 ? "flex flex-col gap-3" : "hidden"}>

                                {/* Top Toolbar */}
                                <div className="flex items-center justify-center gap-2">
                                    <Button type="button" variant="outline" size="sm" className="border-gray-300 text-gray-600 text-xs font-medium gap-1.5 px-3 h-8">
                                        <LayoutTemplate className="h-3.5 w-3.5" />
                                        Use Template
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" className="border-gray-300 text-gray-600 text-xs font-medium gap-1.5 px-3 h-8" onClick={() => form.setValue('permissions', [])}>
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Reset
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" className="border-gray-300 text-gray-600 text-xs font-medium gap-1.5 px-3 h-8">
                                        <Search className="h-3.5 w-3.5" />
                                        Search
                                    </Button>
                                </div>

                                {/* Two-panel permission picker */}
                                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white" style={{ height: '340px' }}>

                                    {/* Left: Categories */}
                                    <div className="w-[42%] border-r border-gray-200 flex flex-col">
                                        <div className="px-4 py-2.5 border-b border-gray-200">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Permission Categories</span>
                                        </div>
                                        <ScrollArea className="flex-1">
                                            <div className="py-1">
                                                {(["All Permissions", ...Array.from(categoriesMap.keys())]).map(cat => (
                                                    <div
                                                        key={cat}
                                                        onClick={() => setActiveCategory(cat)}
                                                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${activeCategory === cat
                                                            ? 'bg-cyan-50'
                                                            : 'hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {/* Radio dot */}
                                                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${activeCategory === cat
                                                            ? 'border-cyan-600 bg-cyan-600'
                                                            : 'border-gray-300 bg-white'
                                                            }`}>
                                                            {activeCategory === cat && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                                                            )}
                                                        </span>
                                                        <span className={`text-sm ${activeCategory === cat
                                                            ? 'font-semibold text-gray-900'
                                                            : 'font-normal text-gray-600'
                                                            }`}>{cat}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    {/* Right: Permissions list */}
                                    <div className="flex-1 flex flex-col">
                                        <div className="px-4 py-2.5 border-b border-gray-200">
                                            <span className="text-sm font-bold text-gray-800">Selected Permissions: {form.watch('permissions').length}</span>
                                        </div>
                                        <ScrollArea className="flex-1">
                                            <FormField control={form.control} name="permissions" render={() => (
                                                <FormItem className="divide-y divide-gray-100">
                                                    {availablePermissions
                                                        .filter(p => activeCategory === "All Permissions" || getCategory(p) === activeCategory)
                                                        .map(p => (
                                                            <FormField key={p} control={form.control} name="permissions" render={({ field }) => (
                                                                <FormItem className="flex flex-row items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors space-y-0">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(p)}
                                                                            onCheckedChange={(c) => c ? field.onChange([...field.value, p]) : field.onChange(field.value?.filter((v) => v !== p))}
                                                                            className="rounded border-gray-300"
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="text-sm font-normal text-gray-700 cursor-pointer leading-tight">{p}</FormLabel>
                                                                </FormItem>
                                                            )} />
                                                        ))}
                                                </FormItem>
                                            )} />
                                        </ScrollArea>
                                        {form.formState.errors.permissions && (
                                            <p className="text-xs text-red-500 px-4 pb-2 font-medium">{form.formState.errors.permissions.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Permission Summary */}
                                {form.watch('permissions').length > 0 && (
                                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                                        <p className="text-xs font-bold text-gray-700 mb-2">Permission Summary:</p>
                                        <div className="space-y-1">
                                            {Array.from(categoriesMap.entries()).map(([cat, perms]) => {
                                                const selected = perms.filter(p => form.watch('permissions').includes(p)).length;
                                                if (selected === 0) return null;
                                                return (
                                                    <p key={cat} className="text-xs text-gray-500">{cat}: <span className="font-medium text-gray-700">{selected}</span></p>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* STEP 3: SLA */}
                            <div className={step === 3 ? "grid grid-cols-2 gap-4" : "hidden"}>

                                {/* Top-left: Response Time SLA */}
                                <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white">
                                    <h4 className="text-sm font-bold text-gray-800">Response Time SLA</h4>

                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500">Standard Response Time</p>
                                        <div className="flex gap-2">
                                            <FormField control={form.control} name="stdResponseTime" render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl><Input type="number" {...field} className="h-9 bg-white" /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="stdResponseUnit" render={({ field }) => (
                                                <FormItem className="w-32">
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Minutes">Minutes</SelectItem>
                                                            <SelectItem value="Hours">Hours</SelectItem>
                                                            <SelectItem value="Days">Days</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500">High Priority Response Time</p>
                                        <div className="flex gap-2">
                                            <FormField control={form.control} name="highResponseTime" render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl><Input type="number" {...field} className="h-9 bg-white" /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="highResponseUnit" render={({ field }) => (
                                                <FormItem className="w-32">
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Minutes">Minutes</SelectItem>
                                                            <SelectItem value="Hours">Hours</SelectItem>
                                                            <SelectItem value="Days">Days</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>
                                </div>

                                {/* Top-right: Response Time SLA (escalation) */}
                                <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white">
                                    <h4 className="text-sm font-bold text-gray-800">Response Time SLA</h4>

                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500">Standard Response Time</p>
                                        <div className="flex gap-2">
                                            <FormField control={form.control} name="stdResponseTime" render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl><Input type="number" {...field} className="h-9 bg-white" /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="stdResponseUnit" render={({ field }) => (
                                                <FormItem className="w-32">
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Minutes">Minutes</SelectItem>
                                                            <SelectItem value="Hours">Hours</SelectItem>
                                                            <SelectItem value="Days">Days</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500">High Priority Response Time</p>
                                        <div className="flex gap-2">
                                            <FormField control={form.control} name="highResponseTime" render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl><Input type="number" {...field} className="h-9 bg-white" /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="highResponseUnit" render={({ field }) => (
                                                <FormItem className="w-32">
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Minutes">Minutes</SelectItem>
                                                            <SelectItem value="Hours">Hours</SelectItem>
                                                            <SelectItem value="Days">Days</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom-left: Resolution Time Requirements */}
                                <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white">
                                    <h4 className="text-sm font-bold text-gray-800">Resolution Time Requirements</h4>

                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500">Auto-Escalate After</p>
                                        <div className="flex gap-2">
                                            <FormField control={form.control} name="resolutionTime" render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl><Input type="number" {...field} className="h-9 bg-white" /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="resolutionUnit" render={({ field }) => (
                                                <FormItem className="w-32">
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Minutes">Minutes</SelectItem>
                                                            <SelectItem value="Hours">Hours</SelectItem>
                                                            <SelectItem value="Days">Days</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500">Escalate To Level</p>
                                        <Select defaultValue="Level 5">
                                            <SelectTrigger className="h-9 bg-white w-full"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Level 1">Level 1 (Support User)</SelectItem>
                                                <SelectItem value="Level 2">Level 2 (Specialist)</SelectItem>
                                                <SelectItem value="Level 3">Level 3 (Manager)</SelectItem>
                                                <SelectItem value="Level 4">Level 4 (Vice President)</SelectItem>
                                                <SelectItem value="Level 5">Level 5 (C-Suite)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Bottom-right: Notification Settings */}
                                <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
                                    <h4 className="text-sm font-bold text-gray-800">Notification Settings</h4>
                                    {[
                                        { name: "notifyEmail" as const, label: "At 50% of SLA time" },
                                        { name: "notifyInApp" as const, label: "At 80% of SLA time" },
                                        { name: "notifySms" as const,   label: "When SLA is breached" },
                                    ].map(({ name, label }) => (
                                        <FormField key={name} control={form.control} name={name} render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={!!field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="rounded border-gray-300"
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal text-gray-700 cursor-pointer">{label}</FormLabel>
                                            </FormItem>
                                        )} />
                                    ))}
                                    <div className="flex items-center gap-3">
                                        <Checkbox className="rounded border-gray-300" />
                                        <label className="text-sm font-normal text-gray-700 cursor-pointer">Daily summary email</label>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 4: Security Settings */}
                            <div className={step === 4 ? "grid grid-cols-2 gap-4" : "hidden"}>

                                {/* Top-left: Authentication Requirements */}
                                <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white">
                                    <h4 className="text-sm font-bold text-gray-800">Authentication Requirements</h4>
                                    <div className="space-y-3">
                                        <FormField control={form.control} name="auth2fa" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <FormLabel className="text-sm font-normal text-gray-700">2FA Required</FormLabel>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="authBio" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <FormLabel className="text-sm font-normal text-gray-700">Biometrics Required</FormLabel>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="authToken" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <FormLabel className="text-sm font-normal text-gray-700">Hardware Token</FormLabel>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                {/* Top-right: IP Restrictions */}
                                <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white">
                                    <h4 className="text-sm font-bold text-gray-800">IP Restrictions</h4>
                                    <FormField control={form.control} name="enableIpWhitelist" render={({ field }) => (
                                        <FormItem className="flex items-center justify-between space-y-0">
                                            <FormLabel className="text-sm font-normal text-gray-700">Enable IP Whitelist</FormLabel>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )} />
                                    {form.watch("enableIpWhitelist") && (
                                        <FormField control={form.control} name="ipAddresses" render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-xs text-gray-500 font-normal">Allowed IP Addresses</FormLabel>
                                                <FormControl><Textarea className="h-20 bg-white resize-none text-xs" placeholder="e.g. 192.168.1.1" {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                    )}
                                </div>

                                {/* Bottom-left: Session Management */}
                                <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white">
                                    <h4 className="text-sm font-bold text-gray-800">Session Management</h4>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500">Session Timeout (minutes)</p>
                                        <FormField control={form.control} name="sessionTimeout" render={({ field }) => (
                                            <FormItem><FormControl><Input type="number" {...field} className="h-9 bg-white" /></FormControl></FormItem>
                                        )} />
                                    </div>
                                    <div className="space-y-3 pt-1">
                                        <FormField control={form.control} name="singleSession" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <FormLabel className="text-sm font-normal text-gray-700">Single Session Only</FormLabel>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="autoLogout" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <FormLabel className="text-sm font-normal text-gray-700">Auto Logout on Inactivity</FormLabel>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                {/* Bottom-right: Time-Based Access */}
                                <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white">
                                    <h4 className="text-sm font-bold text-gray-800">Time-Based Access</h4>
                                    <FormField control={form.control} name="businessHoursOnly" render={({ field }) => (
                                        <FormItem className="flex items-center justify-between space-y-0">
                                            <FormLabel className="text-sm font-normal text-gray-700">Business Hours Only</FormLabel>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )} />
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-500">Active Days</p>
                                        <div className="flex gap-2">
                                            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(day => (
                                                <div key={day} className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-bold border transition-colors ${["Mo", "Tu", "We", "Th", "Fr"].includes(day) ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-gray-50 text-gray-300 border-gray-200'}`}>
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer — outside scroll area, always visible */}
                        <div className="shrink-0 px-6 py-[14px] bg-white border-t flex justify-between items-center">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 w-36 border border-gray-300 text-gray-700 font-medium rounded-none text-sm hover:bg-gray-50"
                                onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
                            >
                                {step > 1 ? "Back" : "Cancel"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSaveDraft}
                                className="h-10 w-36 border border-cyan-500 text-cyan-600 font-medium rounded-none text-sm hover:bg-cyan-50"
                            >
                                Save as Draft
                            </Button>
                            {step < 4 ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="h-10 w-36 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-none text-sm"
                                >
                                    {["Next: Permissions", "Next: Configure SLA", "Next: Security"][step - 1]}
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="h-10 w-36 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-none text-sm"
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Role
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
