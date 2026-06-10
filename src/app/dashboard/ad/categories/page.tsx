"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistoryTable } from "@/components/dashboard/tables";
import { CategoriesColumns, Category } from "../_columns/categories-table-column";
import { CategoryDialog } from "./category-dialog";
import { toast } from "sonner";

// Mock data matching the screenshot
const initialCategories: Category[] = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  name: "FINTECH",
  description: "They often disrupt traditional finance by offering innovative solutions, expanding access, and improving efficiency. This can include everything from digital banking apps and peer-to-peer payment services to robo-advisors and cryptocurrency platforms.",
  status: i % 2 === 0 ? "enabled" : "disabled",
}));

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Handle custom events from the table columns
  useEffect(() => {
    const handleEditCategory = (event: CustomEvent) => {
      setEditingCategory(event.detail);
      setDialogOpen(true);
    };

    const handleToggleStatus = (event: CustomEvent) => {
      const categoryId = event.detail;
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, status: cat.status === "enabled" ? "disabled" : "enabled" }
            : cat
        )
      );
      toast.success("Category status updated successfully");
    };

    const handleDeleteCategory = (event: CustomEvent) => {
      const categoryId = event.detail;
      if (confirm("Are you sure you want to delete this category?")) {
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
        toast.success("Category deleted successfully");
      }
    };

    const handleDuplicateCategory = (event: CustomEvent) => {
      const category = event.detail as Category;
      const newCategory = {
        ...category,
        id: Math.max(...categories.map((c) => c.id)) + 1,
        name: `${category.name} (Copy)`,
      };
      setCategories((prev) => [...prev, newCategory]);
      toast.success("Category duplicated successfully");
    };

    window.addEventListener("editCategory", handleEditCategory as EventListener);
    window.addEventListener("toggleStatus", handleToggleStatus as EventListener);
    window.addEventListener("deleteCategory", handleDeleteCategory as EventListener);
    window.addEventListener("duplicateCategory", handleDuplicateCategory as EventListener);

    return () => {
      window.removeEventListener("editCategory", handleEditCategory as EventListener);
      window.removeEventListener("toggleStatus", handleToggleStatus as EventListener);
      window.removeEventListener("deleteCategory", handleDeleteCategory as EventListener);
      window.removeEventListener("duplicateCategory", handleDuplicateCategory as EventListener);
    };
  }, [categories]);

  const handleCreateNew = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleSaveCategory = (categoryData: Omit<Category, "id">) => {
    if (editingCategory) {
      // Update existing
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat
        )
      );
      toast.success("Category updated successfully");
    } else {
      // Create new
      const newCategory = {
        ...categoryData,
        id: Math.max(...categories.map((c) => c.id)) + 1,
      };
      setCategories((prev) => [...prev, newCategory]);
      toast.success("Category created successfully");
    }
    setDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-1">

        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
            All Categories
          </h1>
          <Button 
            onClick={handleCreateNew}
            className="bg-[#0092ca] hover:bg-[#007ba8] text-white px-8 h-12 rounded-full font-bold text-[16px] shadow-sm transition-all duration-200"
          >
            Create New
          </Button>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <HistoryTable
          columns={CategoriesColumns}
          data={categories}
        />
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        onSave={handleSaveCategory}
      />
    </div>
  );
}