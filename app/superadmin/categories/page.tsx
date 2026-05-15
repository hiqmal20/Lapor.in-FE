"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

interface Category { id: number; name: string; description?: string; }

export default function SuperAdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/api/laporin/categories").then(({ ok, data }) => {
      if (ok) setCategories(Array.isArray(data) ? data : data.data ?? []);
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    });
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const { ok, data } = await apiFetch("/api/laporin/categories", {
      method: "POST",
      body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
    });
    setAdding(false);
    if (ok) { setCategories((prev) => [...prev, data.category ?? data]); setNewName(""); setNewDesc(""); }
  };

  const handleEdit = async (id: number) => {
    if (!editName.trim()) return;
    setSaving(true);
    const { ok } = await apiFetch(`/api/laporin/categories/${id}`, { method: "PUT", body: JSON.stringify({ name: editName }) });
    setSaving(false);
    if (ok) { setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: editName } : c)); setEditingId(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    const { ok } = await apiFetch(`/api/laporin/categories/${id}`, { method: "DELETE" });
    if (ok) setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className={`space-y-5 max-w-2xl transition-all duration-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Categories</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage report categories</p>
      </div>

      {/* add form */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Plus size={14} className="text-violet-500" />Add New Category
        </h3>
        <div className="flex gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name..."
            className="h-9 text-sm border-gray-200 focus:border-violet-400 transition-colors" />
          <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)"
            className="h-9 text-sm border-gray-200 focus:border-violet-400 transition-colors" />
          <Button onClick={handleAdd} disabled={adding || !newName.trim()}
            className="h-9 text-xs bg-violet-600 hover:bg-violet-700 text-white shrink-0 transition-all hover:scale-105">
            {adding ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Add"}
          </Button>
        </div>
      </div>

      {/* list */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</span>
          <span className="text-xs text-gray-400">{categories.length} total</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />)}</div>
        ) : categories.length === 0 ? (
          <p className="text-center py-10 text-xs text-gray-400">No categories yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {categories.map((cat, i) => (
              <div key={cat.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                style={{ opacity: visible ? 1 : 0, transition: `opacity 0.3s ease ${i * 50}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Tag size={13} className="text-violet-600" />
                  </div>
                  {editingId === cat.id ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-xs border-violet-200 focus:border-violet-400 w-48" autoFocus />
                  ) : (
                    <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId === cat.id ? (
                    <>
                      <button onClick={() => handleEdit(cat.id)} disabled={saving}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                        <Check size={13} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
