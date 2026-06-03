"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Pencil, X, Save, Lock, CheckCircle, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getUser, setAuth } from "@/lib/auth";

interface ProfileData { 
  id: number; 
  name: string; 
  email: string; 
  role: string; 
  phone?: string; 
  address?: string; 
  created_at?: string; 
}

export default function SuperAdminProfilPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    // 1. Load data awal dari Local Storage (Fast interaction)
    const localUser = getUser();
    if (localUser) { 
      const p = localUser as ProfileData; 
      setProfile(p); 
      setEditForm({ name: p.name, phone: p.phone ?? "", address: p.address ?? "" }); 
    }
    
    // 2. Sinkronisasi data terbaru dengan server
    apiFetch("/api/laporin/auth/me").then(({ ok, data }) => {
      if (ok) { 
        const freshData = data?.data ?? data; 
        setProfile(freshData); 
        setEditForm({ 
          name: freshData.name, 
          phone: freshData.phone ?? "", 
          address: freshData.address ?? "" 
        }); 
        
        const token = localStorage.getItem("token") ?? ""; 
        setAuth({ ...freshData, role: (freshData.role ?? "super_admin") as "user" | "admin" | "super_admin" }, token); 
      }
    });
    
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleSave = async () => {
    setSaveError(""); 
    if (!editForm.name.trim()) return setSaveError("Name is required."); 
    setSaving(true);
    
    const { ok, data } = await apiFetch("/api/laporin/auth/profile", { 
      method: "PUT", 
      body: JSON.stringify(editForm) 
    }); 
    
    setSaving(false);
    
    if (ok) { 
      const updated = { ...profile!, ...editForm }; 
      setProfile(updated); 
      
      const token = localStorage.getItem("token") ?? ""; 
      setAuth({ ...updated, role: (updated.role ?? "super_admin") as "user" | "admin" | "super_admin" }, token); 
      
      setEditing(false); 
      setSaveSuccess(true); 
      setTimeout(() => setSaveSuccess(false), 3000); 
    } else {
      setSaveError(data?.message ?? "Failed to update profile.");
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!passwordForm.current_password) return setPasswordError("Current password is required.");
    if (!passwordForm.new_password) return setPasswordError("New password is required.");
    if (passwordForm.new_password.length < 6) return setPasswordError("Min. 6 characters.");
    if (passwordForm.new_password !== passwordForm.confirm_password) return setPasswordError("Passwords do not match.");
    
    setSavingPassword(true);
    const { ok, data } = await apiFetch("/api/laporin/auth/change-password", { 
      method: "PUT", 
      body: JSON.stringify({ 
        current_password: passwordForm.current_password, 
        new_password: passwordForm.new_password 
      }) 
    }); 
    
    setSavingPassword(false);
    
    if (ok) { 
      setPasswordSuccess(true); 
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" }); 
      setTimeout(() => { 
        setPasswordSuccess(false); 
        setShowPasswordForm(false); 
      }, 2500); 
    } else {
      setPasswordError(data?.message ?? "Failed to change password.");
    }
  };

  // Failsafe parser tanggal untuk menghindari crash 'Invalid Date'
  const formatDate = (d?: string) => {
    if (!d) return null;
    const date = new Date(d);
    return isNaN(date.getTime()) 
      ? null 
      : date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (!profile) {
    return (
      <div className="space-y-4 animate-pulse max-w-2xl">
        <div className="h-24 bg-gray-100 rounded-xl" />
        <div className="h-40 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className={`space-y-5 max-w-2xl transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage your account information</p>
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle size={13} />Profile updated successfully.
        </div>
      )}

      {/* Profile Card Header */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-violet-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {profile.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{profile.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium flex items-center gap-1">
                  <User size={10} />Super Admin
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">Active</span>
              </div>
              {formatDate(profile.created_at) && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Calendar size={11} />Member since {formatDate(profile.created_at)}
                </p>
              )}
            </div>
          </div>
          
          {!editing ? (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="text-xs gap-1.5 border-gray-200 hover:border-violet-400 hover:text-violet-600 transition-all shrink-0">
              <Pencil size={13} />Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => { if (profile) setEditForm({ name: profile.name, phone: profile.phone ?? "", address: profile.address ?? "" }); setSaveError(""); setEditing(false); }} disabled={saving} className="text-xs gap-1.5 border-gray-200">
                <X size={13} />Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="text-xs gap-1.5 bg-violet-600 hover:bg-violet-700 text-white">
                {saving ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...
                  </span>
                ) : (
                  <><Save size={13} />Save</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information Form Section */}
      <div className={`bg-white border rounded-xl p-5 transition-all duration-200 ${editing ? "border-violet-200 shadow-sm" : "border-gray-100"}`}>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
        {saveError && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg mb-4">{saveError}</div>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {[
            { label: "Full Name", key: "name", icon: User, placeholder: "", fullWidth: false },
            { label: "Phone Number", key: "phone", icon: Phone, placeholder: "+62 812-0000-0000", fullWidth: false },
            { label: "Address", key: "address", icon: MapPin, placeholder: "Jl. ...", fullWidth: true },
          ].map(({ label, key, icon: Icon, placeholder, fullWidth }) => (
            <div key={key} className={fullWidth ? "col-span-1 sm:col-span-2" : "col-span-1"}>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{label}</p>
              {editing ? (
                <Input 
                  name={key} 
                  value={editForm[key as keyof typeof editForm]} 
                  onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder} 
                  className="h-9 text-sm border-gray-200 focus:border-violet-400 bg-gray-50 rounded-lg transition-colors" 
                />
              ) : (
                <p className="text-sm text-gray-800 flex items-center gap-2">
                  <Icon size={13} className="text-gray-400 shrink-0" />
                  <span className="break-words">{editForm[key as keyof typeof editForm] || <span className="text-gray-400">-</span>}</span>
                </p>
              )}
            </div>
          ))}
          
          <div className="col-span-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Email Address</p>
            <p className="text-sm text-gray-800 flex items-center gap-2">
              <Mail size={13} className="text-gray-400 shrink-0" />{profile.email}
            </p>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Lock size={14} className="text-violet-500" />Security
          </h3>
          <button 
            onClick={() => { setShowPasswordForm((v) => !v); setPasswordError(""); setPasswordSuccess(false); }} 
            className="text-xs text-violet-600 hover:underline transition-colors"
          >
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>
        </div>
        
        {!showPasswordForm && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-3">
            <Lock size={11} />Password last changed on account creation
          </p>
        )}
        
        {showPasswordForm && (
          <div className="mt-4 space-y-3 animate-fade-in">
            {passwordError && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">{passwordError}</div>}
            {passwordSuccess && <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2"><CheckCircle size={12} />Password changed successfully.</div>}
            
            {[
              ["Current Password", "current_password"], 
              ["New Password", "new_password"], 
              ["Confirm New Password", "confirm_password"]
            ].map(([label, key]) => (
              <div key={key}>
                <p className="text-xs text-gray-500 mb-1.5">{label}</p>
                <Input 
                  type="password" 
                  value={passwordForm[key as keyof typeof passwordForm]} 
                  onChange={(e) => setPasswordForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="h-9 text-sm border-gray-200 focus:border-violet-400 bg-gray-50 transition-colors" 
                />
              </div>
            ))}
            
            <Button onClick={handleChangePassword} disabled={savingPassword} className="w-full h-9 text-sm bg-violet-600 hover:bg-violet-700 text-white transition-all mt-2">
              {savingPassword ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...
                </span>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}