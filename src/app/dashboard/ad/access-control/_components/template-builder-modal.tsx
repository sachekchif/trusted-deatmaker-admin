import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

interface TemplateBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TemplateBuilderModal({ isOpen, onClose }: TemplateBuilderModalProps) {
    const [step, setStep] = useState(1);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); setStep(1); }}>
            <DialogContent className="sm:max-w-[480px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white">

                {/* Header */}
                <div className="bg-white px-6 pt-6 pb-4 border-b">
                    <DialogHeader>
                        <DialogTitle className="flex flex-col items-center gap-1">
                            <span className="text-lg font-semibold text-gray-900 tracking-tight">Template Builder</span>
                            <span className="text-xs font-normal text-gray-400">Create reusable role templates for efficient role management</span>
                            <div className="flex items-center gap-1.5 w-full mt-2">
                                {[1, 2].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-cyan-500' : 'bg-gray-200'}`} />
                                ))}
                                {/* extra faded segments to match style */}
                                <div className="h-1 flex-1 rounded-full bg-gray-200" />
                                <div className="h-1 flex-1 rounded-full bg-gray-200" />
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 space-y-4">

                        {/* Step 1 */}
                        <div className={step === 1 ? "block space-y-4" : "hidden"}>

                            {/* Info Banner */}
                            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                                <svg className="mt-0.5 h-4 w-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                                </svg>
                                <p className="text-xs text-blue-700">Required fields are marked with <span className="font-bold">*</span></p>
                            </div>

                            {/* Role Name */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-800">*Role Name</label>
                                <Select>
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
                                <p className="text-[11px] text-gray-400">Role name should be descriptive and unique</p>
                            </div>

                            {/* Role Code */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-800">Role Code</label>
                                <Input placeholder="Select One" readOnly className="bg-white text-gray-700" />
                                <p className="text-[11px] text-gray-400">Generated from role name</p>
                            </div>

                            {/* Department */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-800">*Department</label>
                                <Select>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Operations">Operations</SelectItem>
                                        <SelectItem value="Finance">Finance</SelectItem>
                                        <SelectItem value="Support">Customer Support</SelectItem>
                                        <SelectItem value="Compliance">Compliance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Level */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-800">*Level</label>
                                <RadioGroup defaultValue="Level 1" className="flex flex-col gap-2 mt-1">
                                    {[
                                        { value: "Level 1", label: "Level 1 - Support User" },
                                        { value: "Level 2", label: "Level 2 - Specialist" },
                                        { value: "Level 3", label: "Level 3 - Manager" },
                                        { value: "Level 4", label: "Level 4 - Vice President" },
                                        { value: "Level 5", label: "Level 5 - Global Admin" },
                                    ].map(({ value, label }) => (
                                        <div key={value} className="flex items-center gap-2.5">
                                            <RadioGroupItem value={value} id={`tpl-${value}`} className="border-gray-400" />
                                            <label htmlFor={`tpl-${value}`} className="text-sm font-normal text-gray-700 cursor-pointer">{label}</label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* Max Users */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-800">*Max Users</label>
                                <Select defaultValue="10">
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 15, 20, 25, 50, 100].map(n => (
                                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-800">Description</label>
                                <Textarea className="bg-white resize-none h-24" placeholder="Enter Role Description" />
                                <p className="text-[11px] text-gray-400">Detailed description of role responsibilities</p>
                            </div>
                        </div>

                        {/* Step 2: Permissions placeholder */}
                        <div className={step === 2 ? "flex flex-col items-center justify-center py-16 text-center" : "hidden"}>
                            <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-bold text-gray-800">Select Permissions</h3>
                            <p className="text-sm text-gray-400 mt-1 max-w-xs">Choose the default permissions that will be pre-configured for this template.</p>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="shrink-0 px-6 py-[14px] bg-white border-t flex justify-between items-center">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 w-36 border border-gray-300 text-gray-700 font-medium rounded-none text-sm hover:bg-gray-50"
                            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
                        >
                            {step > 1 ? "Back" : "Cancel"}
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 w-36 border border-cyan-500 text-cyan-600 font-medium rounded-none text-sm hover:bg-cyan-50"
                                onClick={onClose}
                            >
                                Save as Draft
                            </Button>
                            {step === 1 ? (
                                <Button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="h-10 w-36 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-none text-sm"
                                >
                                    Next: Select Permissions
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    className="h-10 w-36 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-none text-sm"
                                >
                                    Create Template
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
