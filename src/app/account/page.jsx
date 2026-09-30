'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTinge } from '@/context/TingeContext';
import {
  User,
  GraduationCap,
  Shield,
  Key,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Save,
  Edit2,
  Zap,
} from 'lucide-react';

const PROFILE_STORAGE_KEY = 'rootnexus_student_profile_v1';

const DEFAULT_PROFILE = {
  name: 'Utkarsh Mishra',
  enrollmentNo: '241030188',
  batch: '128-B3',
  branch: 'Computer Science & Engineering',
  year: '1st Year (Semester 1)',
  campus: 'Jaypee Institute of Information Technology, Sector-128 Noida',
  collegeEmail: 'utkarsh.241030188@mail.jiit.ac.in',
  personalEmail: 'utkarshmishra.work@gmail.com',
  phone: '+91 98765 43210',
  residence: 'Day Scholar (Noida / Delhi NCR)',
  bloodGroup: 'B+',
  mentorName: 'Dr. Manish K. Thakur',
  mentorEmail: 'manish.thakur@jiit.ac.in',
  cyberoamId: '241030188',
  cyberoamPass: '••••••••',
  webkioskUser: '241030188',
  webkioskDob: '2006-08-15',
  attendanceCutoff: 75,
};

export default function AccountPage() {
  const { tinge } = useTinge();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(DEFAULT_PROFILE);
  const [showWifiPass, setShowWifiPass] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setEditForm(parsed);
      }
    } catch {}
    setMounted(true);
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile(editForm);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(editForm));
    } catch {}
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportData = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      profile,
      todos: localStorage.getItem('rootnexus_todos_v1'),
      attendance: localStorage.getItem('rootnexus_attendance_v1'),
      marks: localStorage.getItem('rootnexus_marks_v1'),
      quickNote: localStorage.getItem('rootnexus_markdown_notes_v1'),
      tingeTheme: localStorage.getItem('rootnexus_tinge_color'),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rootnexus_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.profile) {
          setProfile(parsed.profile);
          setEditForm(parsed.profile);
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(parsed.profile));
        }
        if (parsed.todos) localStorage.setItem('rootnexus_todos_v1', parsed.todos);
        if (parsed.attendance) localStorage.setItem('rootnexus_attendance_v1', parsed.attendance);
        if (parsed.marks) localStorage.setItem('rootnexus_marks_v1', parsed.marks);
        if (parsed.quickNote) localStorage.setItem('rootnexus_markdown_notes_v1', parsed.quickNote);
        alert('Data imported and restored successfully! Reloading...');
        window.location.reload();
      } catch (err) {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetProfile = () => {
    if (confirm('Reset profile details to JIIT Sector-128 default student seeds?')) {
      setProfile(DEFAULT_PROFILE);
      setEditForm(DEFAULT_PROFILE);
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      } catch {}
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div
              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-md"
              style={{ color: tinge.hex }}
            >
              <User className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Student Account & Identity</h1>
          </div>
          <p className="text-xs text-zinc-400">
            JIIT Sector-128 verified student cockpit profile, institutional credentials, and data controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved!
            </span>
          )}
          <button
            onClick={() => {
              if (isEditing) setEditForm(profile);
              setIsEditing(!isEditing);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Main Student ID Card */}
      <div className="relative overflow-hidden bg-zinc-900/70 backdrop-blur-2xl border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20"
          style={{ backgroundColor: tinge.hex }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar Pill */}
            <div
              className="w-20 h-20 rounded-2xl p-[2px] shadow-xl flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${tinge.hex}, #6366f1)` }}
            >
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex flex-col items-center justify-center text-white">
                <span className="text-2xl font-bold tracking-tight">
                  {profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono mt-0.5">CSE</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{profile.name}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Student
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-zinc-300">Enr: {profile.enrollmentNo}</span>
                <span>•</span>
                <span className="text-zinc-300">Batch {profile.batch}</span>
                <span>•</span>
                <span>{profile.branch}</span>
              </p>
              <p className="text-[11px] text-zinc-500">{profile.campus}</p>
            </div>
          </div>

          <div className="flex md:flex-col items-end gap-2 w-full md:w-auto justify-between border-t md:border-t-0 border-zinc-800/80 pt-4 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Academic Term</span>
              <div className="text-sm font-bold text-white">{profile.year}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Residence</span>
              <div className="text-xs text-zinc-300">{profile.residence}</div>
            </div>
          </div>
        </div>

        {/* Profile Edit Form Drawer (if editing) */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-zinc-800/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">Edit Student Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-400">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-400">Enrollment Number</label>
                <input
                  type="text"
                  value={editForm.enrollmentNo}
                  onChange={(e) => setEditForm({ ...editForm, enrollmentNo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-violet-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-400">Batch Code</label>
                <input
                  type="text"
                  value={editForm.batch}
                  onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-400">Official College Email</label>
                <input
                  type="email"
                  value={editForm.collegeEmail}
                  onChange={(e) => setEditForm({ ...editForm, collegeEmail: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-400">Personal Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-violet-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-400">Hostel / Day Scholar</label>
                <input
                  type="text"
                  value={editForm.residence}
                  onChange={(e) => setEditForm({ ...editForm, residence: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Grid of Credentials, Mentorship & Campus Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Institutional Web Portals */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Campus Portals</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">JIIT Auth</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200">Webkiosk / JPortal</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Verified
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>User: {profile.enrollmentNo}</span>
                <span className="text-zinc-500 font-mono">DOB: {profile.webkioskDob}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200">Campus Wi-Fi (Cyberoam)</span>
                <button
                  onClick={() => setShowWifiPass(!showWifiPass)}
                  className="text-zinc-400 hover:text-zinc-200 p-1 rounded"
                  title={showWifiPass ? 'Hide Password' : 'Show Password'}
                >
                  {showWifiPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-[11px] text-zinc-400 flex items-center justify-between font-mono">
                <span>User: {profile.cyberoamId}</span>
                <span>Pass: {showWifiPass ? 'Jiit@2026' : profile.cyberoamPass}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200">Official Microsoft 365</span>
                <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                  Active
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 truncate">{profile.collegeEmail}</div>
            </div>
          </div>
        </div>

        {/* Faculty Mentorship & Advisory */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Faculty Mentor</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Proctor</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70 space-y-2">
              <div className="text-sm font-bold text-white">{profile.mentorName}</div>
              <p className="text-[11px] text-zinc-400">Associate Professor, Department of CSE & IT</p>
              <div className="pt-1 flex items-center gap-2 text-[11px] text-zinc-300">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span className="truncate">{profile.mentorEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <Building className="w-3.5 h-3.5 text-zinc-500" />
                <span>Cabin: Abb-III, 2nd Floor (Faculty Block)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50 text-[11px] text-zinc-400 space-y-1">
              <span className="font-semibold text-zinc-300">Office Consultation Hours:</span>
              <p>Tuesday & Thursday: 03:00 PM – 04:30 PM</p>
            </div>
          </div>
        </div>

        {/* Emergency & Campus Helplines */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Emergency & Helplines</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
              Sec-128
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70 flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-200">Main Security Gate</span>
                <p className="text-[10px] text-zinc-500">Gate No. 1, Sector-128</p>
              </div>
              <span className="font-mono text-zinc-300 text-xs">+91 120 4195900</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70 flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-200">Medical Dispensary</span>
                <p className="text-[10px] text-zinc-500">Ground Floor, Abb-III</p>
              </div>
              <span className="font-mono text-zinc-300 text-xs">Ext: 5932</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70 flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-200">Anti-Ragging Squad</span>
                <p className="text-[10px] text-zinc-500">Toll-Free Helpline</p>
              </div>
              <span className="font-mono text-emerald-400 text-xs">1800-180-5522</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Backup, Import & Factory Reset Section */}
      <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              <span>Data Sovereignty & Local Backups</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Root Nexus runs 100% offline-first. Export or import your personal academic workspace anytime.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-zinc-400 font-mono">Local Storage Healthy</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Export JSON */}
          <button
            onClick={handleExportData}
            className="p-4 rounded-xl bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex items-center gap-3.5 text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20 group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Export Workspace</div>
              <p className="text-[11px] text-zinc-400">Download complete JSON backup</p>
            </div>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-xl bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex items-center gap-3.5 text-left transition-all group cursor-pointer">
            <div className="p-2.5 rounded-xl bg-sky-600/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Restore Backup</div>
              <p className="text-[11px] text-zinc-400">Upload existing JSON file</p>
            </div>
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>

          {/* Reset Seeds */}
          <button
            onClick={handleResetProfile}
            className="p-4 rounded-xl bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 flex items-center gap-3.5 text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-rose-600/10 text-rose-400 border border-rose-500/20 group-hover:scale-105 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Reset Profile</div>
              <p className="text-[11px] text-zinc-400">Restore default CSE seeds</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
