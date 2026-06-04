"use client";

import { useEffect, useState } from "react";
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
  User,
  Send,
  Trash2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

interface LaporanDetail {
  id: number;
  title: string;
  description: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  category_name: string;
  priority: "low" | "medium" | "high";
  location: string;
  user_name: string;
  created_at: string;
  updated_at: string;
  admin_note?: string;
  image?: string;
  image_url?: string;
  admin_id?: number | null;
}

interface Comment {
  id: number;
  user_id: number;
  laporan_id: number;
  comment: string;
  user_name: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  pending: {
    color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    label: "Pending",
  },
  under_review: {
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    label: "Under Review",
  },
  approved: {
    color: "bg-green-50 text-green-700 border border-green-200",
    label: "Approved",
  },
  rejected: {
    color: "bg-red-50 text-red-700 border border-red-200",
    label: "Rejected",
  },
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-orange-100 text-orange-700",
  low: "bg-gray-100 text-gray-600",
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", dot: "bg-yellow-400" },
  { value: "under_review", label: "Under Review", dot: "bg-blue-400" },
  { value: "approved", label: "Approved", dot: "bg-green-500" },
  { value: "rejected", label: "Rejected", dot: "bg-red-500" },
];

export default function AdminLaporanDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [laporan, setLaporan] = useState<LaporanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  // TAMBAHAN STATE
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const [lRes, cRes] = await Promise.all([
        apiFetch(`/api/laporin/laporan/${id}`),
        apiFetch(`/api/laporin/laporan/${id}/comments`),
      ]);
      if (lRes.ok) {
        const d: LaporanDetail = lRes.data?.data ?? lRes.data;
        setLaporan(d);
        setSelectedStatus(d.status);
        setAdminNote(d.admin_note ?? "");
        setTimeout(() => setVisible(true), 50);
      }
      if (cRes.ok) setComments(Array.isArray(cRes.data) ? cRes.data : []);
      setLoading(false);
    };
    fetchAll();
  }, [id]);

  // FUNGSI AMBIL TUGAS
  const handleAssignTask = async () => {
    setAssigning(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const { ok } = await apiFetch(`/api/laporin/laporan/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: "under_review", admin_id: user.id }),
    });
    if (ok) {
      setLaporan((prev) =>
        prev ? { ...prev, admin_id: user.id, status: "under_review" } : prev,
      );
      setSelectedStatus("under_review");
    }
    setAssigning(false);
  };

  // REVISI FUNGSI UPDATE STATUS
  const handleUpdateStatus = async (
    newStatus?: "approved" | "rejected" | "under_review",
  ) => {
    // Gunakan parameter status jika dikirim, atau gunakan default dari state selectedStatus
    const statusToUpdate = newStatus || selectedStatus;

    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess(false);

    const response = await apiFetch(
      `/api/laporin/laporan/${laporan?.id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({
          status: statusToUpdate,
          admin_note: adminNote, 
        }),
      },
    );

    setUpdating(false);

    if (response.ok) {
      setUpdateSuccess(true);
      alert(`Laporan berhasil diperbarui ke status: ${statusToUpdate}!`);
      router.refresh();
    } else {
      const msg = response.data?.message || "Gagal memperbarui status laporan";
      setUpdateError(msg);
      alert(msg);
    }
  };

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
      setComments((prev) => [
        ...prev,
        {
          ...data.comment,
          user_name: data.comment.user_name ?? user.name ?? "Admin",
          created_at: new Date().toISOString(),
        },
      ]);
      setCommentText("");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const { ok } = await apiFetch(
      `/api/laporin/laporan/comments/${commentId}`,
      { method: "DELETE" },
    );
    if (ok) setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatShort = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-24" />
        <div className="h-32 bg-gray-100 rounded-xl" />
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">Report not found.</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-emerald-600"
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  // ====================================================================
  // 🔥 LOGIKA PROTEKSI ADMIN UTAMA (Ditaruh setelah dipastikan laporan ada)
  // ====================================================================
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const isAssignedToOthers = laporan.admin_id !== null && laporan.admin_id !== undefined && Number(laporan.admin_id) !== Number(user?.id);
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "superadmin";
  const cannotUpdate = isAssignedToOthers && !isSuperAdmin;

  const statusInfo = STATUS_STYLE[laporan.status] ?? STATUS_STYLE.pending;
  const rawImg = laporan.image || laporan.image_url;
  const imgUrl = rawImg
    ? rawImg.startsWith("http")
      ? rawImg
      : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${rawImg}`
    : null;

  const statusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle size={13} />;
    if (status === "rejected") return <XCircle size={13} />;
    return <Clock size={13} />;
  };

  return (
    <div
      className={`transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
    >
      <div className="grid grid-cols-3 gap-5 items-start">
        {/* LEFT — 2/3 */}
        <div className="col-span-2 space-y-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Manage Reports
          </button>

          {/* Banner Peringatan jika dipegang Admin Lain */}
          {cannotUpdate && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-800 animate-fadeIn">
              <Lock className="mt-0.5 text-amber-600 shrink-0" size={16} />
              <div>
                <h4 className="text-xs font-bold">Mode Pratinjau (Read-Only)</h4>
                <p className="text-[11px] text-amber-600 mt-0.5 leading-relaxed">
                  Laporan ini sedang ditangani oleh admin lain. Anda hanya diperbolehkan melihat detail laporan tanpa mengubah alur data penanganan.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  {laporan.category_name || "General"}
                </span>
                {laporan.priority && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLOR[laporan.priority]}`}
                  >
                    {laporan.priority}
                  </span>
                )}
              </div>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.color}`}
              >
                {statusIcon(laporan.status)} {statusInfo.label}
              </div>
            </div>
            <h1 className="text-lg font-bold text-gray-900 mt-3">
              {laporan.title}
            </h1>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <User size={12} /> {laporan.user_name}
              </span>
              {laporan.location && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={12} /> {laporan.location}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={12} /> {formatDate(laporan.created_at)}
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Tag size={14} className="text-emerald-500" /> Description
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {laporan.description}
            </p>
          </div>

          {imgUrl && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Attached Photo
              </h2>
              <img
                src={imgUrl}
                alt="Report"
                className="rounded-lg w-full max-h-72 object-cover"
              />
            </div>
          )}

          {laporan.admin_note && (
            <div
              className={`border rounded-xl p-4 flex gap-3 ${laporan.status === "rejected" ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"}`}
            >
              <MessageSquare
                size={16}
                className={
                  laporan.status === "rejected"
                    ? "text-red-400 shrink-0 mt-0.5"
                    : "text-blue-400 shrink-0 mt-0.5"
                }
              />
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-0.5">
                  Admin Note
                </p>
                <p className="text-xs text-gray-600">{laporan.admin_note}</p>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={14} className="text-emerald-500" />
              Comments & Updates
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-normal">
                {comments.length}
              </span>
            </h2>

            <div className="space-y-3 mb-4">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  No comments yet.
                </p>
              ) : (
                comments.map((c) => {
                  const currentUser = JSON.parse(
                    localStorage.getItem("user") || "{}",
                  );
                  const isOwn = c.user_id === currentUser.id;
                  return (
                    <div key={c.id} className="flex gap-3 group">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                        {c.user_name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-800">
                            {c.user_name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatShort(c.created_at)}
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
                        <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                          {c.comment}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex gap-2 items-center">
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {typeof window !== "undefined"
                  ? (JSON.parse(localStorage.getItem("user") || "{}")
                      .name?.charAt(0)
                      ?.toUpperCase() ?? "A")
                  : "A"}
              </div>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSendComment()
                }
                placeholder="Add a comment or update..."
                className="flex-1 h-9 px-3 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-emerald-400 transition-colors"
              />
              <button
                onClick={handleSendComment}
                disabled={sendingComment || !commentText.trim()}
                className="w-9 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-300 text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                {sendingComment ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={13} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — 1/3 */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-emerald-500" /> Update Status
            </h2>

            {/* BUTTON AMBIL TUGAS */}
            {!laporan?.admin_id && (
              <div className="mb-4">
                <Button
                  onClick={handleAssignTask}
                  disabled={assigning}
                  className="w-full h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {assigning ? "Memproses..." : "Ambil Tugas Ini"}
                </Button>
              </div>
            )}

            {updateSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2 rounded-lg mb-3 flex items-center gap-2">
                <CheckCircle size={12} /> Status updated successfully.
              </div>
            )}
            {updateError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg mb-3">
                {updateError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-2">Status</p>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      disabled={cannotUpdate} // Matikan pilihan jika terkunci admin lain
                      onClick={() => setSelectedStatus(opt.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all duration-150 ${
                        selectedStatus === opt.value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-100 text-gray-600 hover:border-gray-200"
                      } ${cannotUpdate ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`}
                      />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">
                  Admin Note (optional)
                </p>
                <textarea
                  value={adminNote}
                  disabled={cannotUpdate} // Matikan textarea jika terkunci admin lain
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="Add a note for the reporter..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-emerald-400 transition-colors resize-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <Button
                onClick={() => handleUpdateStatus()}
                disabled={updating || selectedStatus === laporan.status || cannotUpdate}
                className={`w-full h-9 text-xs text-white transition-all duration-200 disabled:opacity-50 ${
                  cannotUpdate 
                    ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400" 
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {updating 
                  ? "Updating..." 
                  : cannotUpdate 
                  ? "Akses Terkunci (Milik Admin Lain)" 
                  : "Update Status"
                }
              </Button>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User size={14} className="text-emerald-500" /> Reporter
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                {laporan.user_name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {laporan.user_name}
                </p>
                <p className="text-xs text-gray-400">Citizen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}