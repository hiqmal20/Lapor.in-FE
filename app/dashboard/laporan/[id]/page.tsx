"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Tag,
  MessageSquare,
  Pencil,
  X,
  Save,
  ImageIcon,
  Trash2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

interface LaporanDetail {
  id: number;
  title: string;
  description: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  category_name: string;
  priority: "low" | "medium" | "high";
  location: string;
  created_at: string;
  updated_at: string;
  admin_note?: string;
  image?: string;
  image_url?: string;
  images?: string[];
  photo_url?: string;
}

interface Comment {
  id: number;
  user_id: number;
  laporan_id: number;
  comment: string;
  user_name: string;
  created_at: string;
}

const CATEGORIES = [
  "Road & Infrastructure",
  "Water & Sanitation",
  "Public Safety",
  "Environment",
  "Public Services",
  "Transportation",
];

const PRIORITIES = ["low", "medium", "high"] as const;

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-orange-100 text-orange-700",
  low: "bg-gray-100 text-gray-600",
};

const PRIORITY_ACTIVE: Record<string, string> = {
  low: "border-blue-500 bg-blue-50 text-blue-700",
  medium: "border-orange-400 bg-orange-50 text-orange-600",
  high: "border-red-400 bg-red-50 text-red-600",
};

const STATUS_STYLE: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: {
    color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: <Clock size={14} className="text-yellow-500" />,
    label: "Pending",
  },
  under_review: {
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: <Clock size={14} className="text-blue-500" />,
    label: "Under Review",
  },
  approved: {
    color: "bg-green-50 text-green-700 border border-green-200",
    icon: <CheckCircle size={14} className="text-green-500" />,
    label: "Approved",
  },
  rejected: {
    color: "bg-red-50 text-red-700 border border-red-200",
    icon: <XCircle size={14} className="text-red-500" />,
    label: "Rejected",
  },
};

export default function LaporanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [laporan, setLaporan] = useState<LaporanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  // edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    category_name: "",
    description: "",
    location: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  // photo edit state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);

  // comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [laporanRes, commentsRes] = await Promise.all([
          apiFetch(`/api/laporin/laporan/${id}`),
          apiFetch(`/api/laporin/laporan/${id}/comments`),
        ]);

        if (laporanRes.ok) {
          const d: LaporanDetail = laporanRes.data?.data ?? laporanRes.data;
          setLaporan(d);
          setEditForm({
            title: d.title ?? "",
            category_name: d.category_name ?? "",
            description: d.description ?? "",
            location: d.location ?? "",
            priority: d.priority ?? "medium",
          });
          setTimeout(() => setVisible(true), 50);
        }
        if (commentsRes.ok) {
          setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
        }
      } catch (error) {
        console.error("Error fetching detail data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    const { ok, data } = await apiFetch(`/api/laporin/laporan/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ comment: commentText.trim() }),
    });
    setSendingComment(false);
    if (ok) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const newComment: Comment = {
        ...data.comment,
        user_name: data.comment.user_name ?? user.name ?? "You",
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const { ok } = await apiFetch(`/api/laporin/laporan/comments/${commentId}`, {
      method: "DELETE",
    });
    if (ok) setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDeleteLaporan = async () => {
    const konfirmasi = window.confirm("Apakah Anda yakin ingin menghapus laporan ini?");
    if (!konfirmasi) return;

    try {
      const { ok, data } = await apiFetch(`/api/laporin/laporan/${id}`, {
        method: "DELETE",
      });

      if (ok) {
        alert("Laporan berhasil dihapus!");
        router.push("/dashboard");
        router.refresh();
      } else {
        alert(data?.message || "Gagal menghapus laporan");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Terjadi kesalahan jaringan saat menghapus laporan.");
    }
  };

  const handleSave = async () => {
    setSaveError("");
    if (!editForm.title?.trim()) return setSaveError("Title is required.");
    if (!editForm.description?.trim()) return setSaveError("Description is required.");
    if (!editForm.location?.trim()) return setSaveError("Location is required.");

    setSaving(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      let res: Response;

      if (newPhotos.length > 0) {
        const formData = new FormData();
        Object.entries(editForm).forEach(([k, v]) => formData.append(k, v));
        newPhotos.forEach((f) => formData.append("image", f));

        res = await fetch(`${BASE_URL}/api/laporin/laporan/${id}`, {
          method: "PUT",
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: formData,
        });
      } else {
        const body: Record<string, string> = { ...editForm };
        if (removeExistingPhoto) body.remove_image = "true";

        res = await fetch(`${BASE_URL}/api/laporin/laporan/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      setSaving(false);

      if (res.ok) {
        const updated = data?.data ?? data;
        setLaporan((prev) =>
          prev
            ? {
                ...prev,
                ...editForm,
                ...updated,
                ...(removeExistingPhoto ? { image_url: undefined, images: [], photo_url: undefined } : {}),
              }
            : prev
        );
        setEditing(false);
        setNewPhotos([]);
        setNewPreviews([]);
        setRemoveExistingPhoto(false);
      } else {
        setSaveError(data?.message ?? data?.error ?? `Error ${res.status}: Failed to save changes.`);
      }
    } catch {
      setSaving(false);
      setSaveError("Network error. Please check your connection and try again.");
    }
  };

  const handleCancelEdit = () => {
    if (laporan) {
      setEditForm({
        title: laporan.title,
        category_name: laporan.category_name,
        description: laporan.description,
        location: laporan.location,
        priority: laporan.priority,
      });
    }
    setSaveError("");
    setNewPhotos([]); // -> Di sini yang tadi typo
    setNewPreviews([]);
    setRemoveExistingPhoto(false);
    setEditing(false);
  };

  const handleNewPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.size <= 10 * 1024 * 1024);
    setNewPhotos((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeNewPhoto = (idx: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-24" />
        <div className="h-6 bg-gray-100 rounded w-2/3" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">Report not found.</p>
        <Button variant="ghost" size="sm" className="mt-3 text-blue-600" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const statusInfo = STATUS_STYLE[laporan.status] ?? STATUS_STYLE.pending;
  const canEdit = laporan.status === "pending";

  return (
    <div
      className={`space-y-5 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {/* back + edit actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to My Reports
        </button>

        {canEdit && !editing && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
              className="text-xs gap-1.5 border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
            >
              <Pencil size={13} />
              Edit Report
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeleteLaporan}
              className="text-xs gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-all duration-200"
            >
              <Trash2 size={13} />
              Delete Report
            </Button>
          </div>
        )}

        {editing && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelEdit}
              disabled={saving}
              className="text-xs gap-1.5 border-gray-200"
            >
              <X size={13} />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save size={13} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* save error */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-lg">
          {saveError}
        </div>
      )}

      {/* header card */}
      <div className={`bg-white border rounded-xl p-5 transition-all duration-200 ${editing ? "border-blue-200 shadow-sm" : "border-gray-100"}`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {editing ? (
              <select
                name="category_name"
                value={editForm.category_name}
                onChange={handleEditChange}
                className="h-7 px-2 text-xs border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-blue-400 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                {laporan.category_name || "General"}
              </span>
            )}

            {!editing && laporan.priority && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLOR[laporan.priority]}`}>
                {laporan.priority}
              </span>
            )}
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </div>
        </div>

        {/* title */}
        {editing ? (
          <Input
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
            className="mt-3 text-base font-bold border-blue-200 focus:border-blue-400 transition-colors"
          />
        ) : (
          <h1 className="text-lg font-bold text-gray-900 mt-3">{laporan.title}</h1>
        )}

        {/* location */}
        <div className="flex flex-wrap gap-4 mt-3">
          {editing ? (
            <div className="flex items-center gap-1.5 flex-1">
              <MapPin size={12} className="text-gray-400 shrink-0" />
              <Input
                name="location"
                value={editForm.location}
                onChange={handleEditChange}
                placeholder="Location / Address"
                className="h-7 text-xs border-blue-200 focus:border-blue-400 transition-colors"
              />
            </div>
          ) : (
            <>
              {laporan.location && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={12} />
                  {laporan.location}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={12} />
                {formatDate(laporan.created_at)}
              </span>
            </>
          )}
        </div>

        {/* priority selector in edit mode */}
        {editing && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Priority</p>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setEditForm((prev) => ({ ...prev, priority: p }))}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border-2 capitalize transition-all duration-150 ${
                    editForm.priority === p
                      ? PRIORITY_ACTIVE[p]
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* description */}
      <div className={`bg-white border rounded-xl p-5 transition-all duration-200 ${editing ? "border-blue-200 shadow-sm" : "border-gray-100"}`}>
        <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Tag size={14} className="text-blue-500" />
          Description
        </h2>
        {editing ? (
          <div className="relative">
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              rows={6}
              className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-blue-400 transition-colors resize-none"
            />
            <span className="absolute bottom-2 right-3 text-xs text-gray-400">
              {editForm.description.length} characters
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed">{laporan.description}</p>
        )}
      </div>

      {/* image */}
      {(() => {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
        const rawImg = laporan.image || laporan.image_url || laporan.photo_url;
        const imgSrc = rawImg
          ? rawImg.startsWith("http")
            ? rawImg
            : `${BASE_URL}/uploads/${rawImg}`
          : null;
        const imgList = laporan.images;
        const hasExisting = (imgSrc || (imgList && imgList.length > 0)) && !removeExistingPhoto;

        if (!editing && !hasExisting && newPreviews.length === 0) return null;

        return (
          <div className={`bg-white border rounded-xl p-5 transition-all duration-200 ${editing ? "border-blue-200 shadow-sm" : "border-gray-100"}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon size={14} className="text-blue-500" />
                Attached Photo
              </h2>
            </div>

            {/* existing photo */}
            {hasExisting && (
              <div className="relative group mb-3">
                {imgSrc && (
                  <img src={imgSrc} alt="Report" className="rounded-lg w-full max-h-64 object-cover" />
                )}
                {imgList && imgList.length > 0 && (
                  <div className={`grid gap-2 ${imgList.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {imgList.map((url, i) => (
                      <img key={i} src={url} alt={`photo ${i + 1}`} className="rounded-lg w-full max-h-56 object-cover" />
                    ))}
                  </div>
                )}
                {editing && (
                  <button
                    onClick={() => setRemoveExistingPhoto(true)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove photo"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            )}

            {/* removed notice */}
            {editing && removeExistingPhoto && (
              <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-red-500">Existing photo will be removed on save.</p>
                <button
                  onClick={() => setRemoveExistingPhoto(false)}
                  className="text-xs text-red-600 font-medium hover:underline"
                >
                  Undo
                </button>
              </div>
            )}

            {/* new photo previews */}
            {newPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {editing && (
                      <button
                        onClick={() => removeNewPhoto(i)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* upload button in edit mode */}
            {editing && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif"
                  multiple
                  className="hidden"
                  onChange={handleNewPhoto}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-5 flex flex-col items-center gap-1.5 text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-all duration-200 hover:bg-blue-50/30"
                >
                  <ImageIcon size={22} className="opacity-50" />
                  <span className="text-xs font-medium">Click to add / replace photo</span>
                  <span className="text-xs opacity-70">PNG, JPG, GIF up to 10MB</span>
                </button>
              </>
            )}
          </div>
        );
      })()}

      {/* not editable notice */}
      {!canEdit && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-2">
          <Pencil size={13} className="text-gray-400" />
          <p className="text-xs text-gray-400">
            This report can no longer be edited because its status is <span className="font-semibold capitalize">{laporan.status.replace("_", " ")}</span>.
          </p>
        </div>
      )}

      {/* admin note */}
      {laporan.admin_note && (
        <div className={`border rounded-xl p-4 flex gap-3 ${laporan.status === "rejected" ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"}`}>
          <MessageSquare size={16} className={laporan.status === "rejected" ? "text-red-400 shrink-0 mt-0.5" : "text-blue-400 shrink-0 mt-0.5"} />
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-0.5">Admin Note</p>
            <p className="text-xs text-gray-600">{laporan.admin_note}</p>
          </div>
        </div>
      )}

      {/* timeline */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={14} className="text-blue-500" />
          Timeline
        </h2>
        <div className="space-y-3">
          <TimelineItem
            icon={<CheckCircle size={13} className="text-blue-500" />}
            label="Report Submitted"
            date={formatDate(laporan.created_at)}
            active
          />
          <TimelineItem
            icon={<Clock size={13} className="text-yellow-500" />}
            label="Under Review"
            date={laporan.status !== "pending" ? formatDate(laporan.updated_at) : undefined}
            active={laporan.status !== "pending"}
          />
          <TimelineItem
            icon={
              laporan.status === "rejected"
                ? <XCircle size={13} className="text-red-500" />
                : <CheckCircle size={13} className="text-green-500" />
            }
            label={laporan.status === "rejected" ? "Rejected" : "Approved"}
            date={
              laporan.status === "approved" || laporan.status === "rejected"
                ? formatDate(laporan.updated_at)
                : undefined
            }
            active={laporan.status === "approved" || laporan.status === "rejected"}
          />
        </div>
      </div>

      {/* comments */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare size={14} className="text-blue-500" />
          Comments & Updates
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-normal">
            {comments.length}
          </span>
        </h2>

        <div className="space-y-3 mb-4">
          {comments.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No comments yet. Be the first to comment.</p>
          ) : (
            comments.map((c) => {
              const currentUser = typeof window !== "undefined"
                ? JSON.parse(localStorage.getItem("user") || "{}")
                : {};
              const isOwn = c.user_id === currentUser.id;
              return (
                <div key={c.id} className="flex gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    {c.user_name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-800">{c.user_name}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                      {isOwn && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-3 py-2">
                      {c.comment}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* input */}
        <div className="flex gap-2 items-center">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {typeof window !== "undefined"
              ? JSON.parse(localStorage.getItem("user") || "{}").name?.charAt(0)?.toUpperCase() ?? "U"
              : "U"}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendComment()}
              placeholder="Add a comment or update..."
              className="flex-1 h-9 px-3 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 transition-colors"
            />
            <button
              onClick={handleSendComment}
              disabled={sendingComment || !commentText.trim()}
              className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-300 text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              {sendingComment
                ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send size={13} />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  icon, label, date, active,
}: {
  icon: React.ReactNode;
  label: string;
  date?: string;
  active: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 ${active ? "" : "opacity-40"}`}>
      <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-700">{label}</p>
        {date && <p className="text-xs text-gray-400 mt-0.5">{date}</p>}
      </div>
    </div>
  );
}