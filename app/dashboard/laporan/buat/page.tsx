"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  MapPin,
  AlertTriangle,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

const PRIORITIES = [
  {
    key: "low",
    label: "Low",
    desc: "Minor inconvenience, can wait",
    color: "border-gray-200 text-gray-700",
    activeColor: "border-blue-500 bg-blue-50 text-blue-700",
  },
  {
    key: "medium",
    label: "Medium",
    desc: "Moderate issue, needs attention",
    color: "border-gray-200 text-gray-700",
    activeColor: "border-orange-400 bg-orange-50 text-orange-600",
  },
  {
    key: "high",
    label: "High",
    desc: "Urgent issue, immediate action needed",
    color: "border-gray-200 text-gray-700",
    activeColor: "border-red-400 bg-red-50 text-red-600",
  },
];

export default function CreateLaporanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    priority: "medium",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    apiFetch("/api/laporin/categories").then(({ ok, data }) => {
      if (ok) {
        const cats = Array.isArray(data) ? data : data.data ?? [];
        setCategories(cats.map((c: { name: string }) => c.name));
      }
    });
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter((f) => f.size <= 10 * 1024 * 1024);
    setPhotos((prev) => [...prev, ...valid]);
    valid.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.title.trim()) return setError("Report title is required.");
    if (!form.category) return setError("Please select a category.");
    if (!form.description.trim()) return setError("Detailed description is required.");
    if (!form.location.trim()) return setError("Location is required.");

    setSubmitting(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("category_name", form.category);
    formData.append("description", form.description);
    formData.append("location", form.location);
    formData.append("priority", form.priority);
    photos.forEach((file) => formData.append("image", file));

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${BASE_URL}/api/laporin/laporan`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // jangan set Content-Type — biar browser set boundary multipart otomatis
      },
      body: formData,
    });

    const data = await res.json();
    setSubmitting(false);

    if (res.ok) {
      router.push("/dashboard/laporan");
    } else {
      setError(data?.message ?? "Failed to submit report. Please try again.");
    }
  };

  return (
    <div
      className={`space-y-5 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Create Report</h1>
        <p className="text-xs text-gray-400 mt-0.5">Submit a new public complaint</p>
      </div>

      {/* error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 2-col layout */}
      <div className="grid grid-cols-3 gap-5 items-start">
        {/* LEFT — main form (2/3) */}
        <div className="col-span-2 space-y-4">
          {/* Report Details */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease 100ms, transform 0.4s ease 100ms" }}>
          <Section icon={<FileText size={15} className="text-blue-500" />} title="Report Details">
            <Field label="Report Title" required>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Brief description of the issue..."
                className="h-9 text-sm border-gray-200 focus:border-blue-400 transition-colors"
              />
            </Field>

            <Field label="Category" required>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-blue-400 transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </Field>

            <Field label="Detailed Description" required>
              <div className="relative">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={7}
                  placeholder="Please provide a detailed description of the issue. Include when it started, how it affects you, and any other relevant information..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                />
                <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                  {form.description.length} characters
                </span>
              </div>
            </Field>
          </Section>
          </div>

          {/* Location */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease 200ms, transform 0.4s ease 200ms" }}>
          <Section icon={<MapPin size={15} className="text-blue-500" />} title="Location">
            <Field label="Location / Address" required>
              <Input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Jl. Sudirman No. 45, Jakarta Pusat, near the intersection..."
                className="h-9 text-sm border-gray-200 focus:border-blue-400 transition-colors"
              />
            </Field>
          </Section>
          </div>
        </div>

        {/* RIGHT — priority + photos (1/3) */}
        <div className="col-span-1 space-y-4">
          {/* Priority */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease 150ms, transform 0.4s ease 150ms" }}>
          <Section icon={<AlertTriangle size={15} className="text-blue-500" />} title="Priority Level">
            <div className="space-y-2">
              {PRIORITIES.map((p) => {
                const isActive = form.priority === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, priority: p.key }))}
                    className={`w-full border-2 rounded-xl p-3 text-left transition-all duration-200 hover:scale-[1.01] ${
                      isActive ? p.activeColor : `${p.color} hover:border-gray-300`
                    }`}
                  >
                    <p className={`text-sm font-semibold ${isActive ? "" : "text-gray-700"}`}>
                      {p.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isActive ? "opacity-80" : "text-gray-400"}`}>
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </Section>
          </div>

          {/* Photos */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease 250ms, transform 0.4s ease 250ms" }}>
          <Section icon={<Upload size={15} className="text-blue-500" />} title="Photos (Optional)">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-all duration-200 hover:bg-blue-50/30"
            >
              <ImageIcon size={26} className="opacity-50" />
              <span className="text-sm font-medium">Click to upload photos</span>
              <span className="text-xs">PNG, JPG, GIF up to 10MB each</span>
            </button>
          </Section>
          </div>
        </div>
      </div>

      {/* actions — full width bottom */}
      <div className="flex gap-3 pb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-32 h-10 text-sm border-gray-200 hover:bg-gray-50 transition-colors"
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 h-10 text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-[1.005]"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Report"
          )}
        </Button>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4 shadow-none">
      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
