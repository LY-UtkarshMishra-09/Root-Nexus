'use client';

import React, { useState, useEffect } from 'react';
import { useTinge } from '@/context/TingeContext';
import {
  X,
  RefreshCw,
  FileCode,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Check,
  Building2,
  Lock,
  Globe,
  Radio,
  Layers,
  GraduationCap,
  Calendar,
  User,
  Zap,
  Copy,
  ExternalLink,
} from 'lucide-react';

const PROFILE_KEY = 'rootnexus_student_profile_v1';

export default function WebkioskSyncModal({ isOpen, onClose, currentSubjects, onApplySync }) {
  const { tinge } = useTinge();
  const [activeTab, setActiveTab] = useState('portal'); // 'portal' | 'token' | 'paste'
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [syncResult, setSyncResult] = useState(null);

  // Form inputs for Webportal login
  const [enrollment, setEnrollment] = useState('');
  const [password, setPassword] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [captchaData, setCaptchaData] = useState(null); // { hidden, image }
  const [captchaLoading, setCaptchaLoading] = useState(false);

  // Token input for already logged-in session
  const [sessionToken, setSessionToken] = useState('');

  // Paste form input
  const [rawHtml, setRawHtml] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Fetch fresh captcha when modal opens or user switches to portal tab
  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const res = await fetch('/api/webkiosk/captcha');
      const data = await res.json();
      if (data.success && data.captcha) {
        setCaptchaData(data.captcha);
        setCaptchaText('');
      }
    } catch (e) {
      console.warn('[Captcha Fetch Error]', e);
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCaptcha();
      try {
        const saved = localStorage.getItem(PROFILE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.enrollmentNo && !enrollment) setEnrollment(parsed.enrollmentNo);
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Webportal Login
  const handlePortalLogin = async (e) => {
    e.preventDefault();
    if (!enrollment.trim() || !password.trim()) {
      setErrorMsg('Please enter your Enrollment Number and Password.');
      return;
    }

    if (!captchaText.trim()) {
      setErrorMsg('Please enter the 5-character captcha code shown below.');
      return;
    }

    setLoading(true);
    setLoadingStep('Connecting to webportal.jiit.ac.in:6011 and verifying captcha...');
    setErrorMsg('');
    setSyncResult(null);

    try {
      const res = await fetch('/api/webkiosk/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentNumber: enrollment.trim(),
          password: password,
          captcha: {
            captcha: captchaText.trim(),
            hidden: captchaData?.hidden || '',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Refresh captcha on failure
        fetchCaptcha();
        throw new Error(data.error || 'Failed to authenticate with JIIT Webportal.');
      }

      setSyncResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with Webportal server.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // Handle Token Sync
  const handleTokenSync = async (e) => {
    e.preventDefault();
    if (!sessionToken.trim()) return;

    setLoading(true);
    setLoadingStep('Querying student profile and attendance using session token...');
    setErrorMsg('');
    setSyncResult(null);

    try {
      const res = await fetch('/api/webkiosk/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sessionToken.trim(),
          enrollmentNumber: enrollment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to query Webportal using token.');
      }

      setSyncResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Error using session token.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // Handle HTML Paste Sync
  const handlePasteSync = async (e) => {
    e.preventDefault();
    if (!rawHtml.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSyncResult(null);

    try {
      const res = await fetch('/api/webkiosk/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: rawHtml, enrollmentNumber: enrollment.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract attendance from pasted HTML.');
      }

      setSyncResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Error parsing table HTML.');
    } finally {
      setLoading(false);
    }
  };

  const copyConsoleSnippet = () => {
    const code = "copy(localStorage.getItem('Token') || sessionStorage.getItem('Token')); alert('Webportal Token copied to clipboard!');";
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  const handleApply = () => {
    if (!syncResult?.subjects) return;

    onApplySync(syncResult.subjects, syncResult.message || 'Synchronized live from JIIT Webportal');

    try {
      const savedRaw = localStorage.getItem(PROFILE_KEY);
      const existing = savedRaw ? JSON.parse(savedRaw) : {};
      const updatedProfile = {
        ...existing,
        name: syncResult.studentInfo?.name || syncResult.studentName || existing.name,
        enrollmentNo: syncResult.studentInfo?.enrollmentNo || syncResult.enrollmentNumber || existing.enrollmentNo,
        batch: syncResult.studentInfo?.batch || syncResult.batch || existing.batch,
        branch: syncResult.studentInfo?.branch || syncResult.branch || existing.branch,
        year: syncResult.studentInfo?.year || syncResult.year || existing.year,
        collegeEmail: syncResult.studentInfo?.collegeEmail || existing.collegeEmail,
      };

      localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('rootnexus_profile_updated', { detail: updatedProfile }));
    } catch (e) {
      console.warn('[Profile Save]', e);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-md"
              style={{ color: tinge.hex }}
            >
              <Globe className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>JIIT Student Portal Ingestion</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  CampusLynx API
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Directly extracts attendance, assigned batch, and profile from <code className="text-zinc-300">webportal.jiit.ac.in:6011</code>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-zinc-800/60 bg-zinc-950/40">
          <button
            onClick={() => {
              setActiveTab('portal');
              setErrorMsg('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'portal'
                ? 'border-violet-500 text-white bg-zinc-900/80'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Pathway A: Live Portal Login</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('token');
              setErrorMsg('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'token'
                ? 'border-violet-500 text-white bg-zinc-900/80'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Pathway B: 1-Click Session Token</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('paste');
              setErrorMsg('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'paste'
                ? 'border-violet-500 text-white bg-zinc-900/80'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Pathway C: Paste HTML</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Authentication Failed</span>
              </div>
              <p className="text-[11px] opacity-90">{errorMsg}</p>
            </div>
          )}

          {/* Form Tab 1: Live Portal Login */}
          {!syncResult && activeTab === 'portal' && (
            <form onSubmit={handlePortalLogin} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-400 space-y-1.5">
                <div className="font-semibold text-zinc-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Official JIIT Webportal API Authentication</span>
                  </span>
                  <a
                    href="https://webportal.jiit.ac.in:6011/studentportal/#/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open Webportal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Log in directly with your official JIIT Student Portal credentials. Your password and enrollment are encrypted with university AES-128 keys and sent straight to <code className="text-zinc-300">webportal.jiit.ac.in:6011</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Enrollment Number */}
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enrollment Number</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollment}
                    onChange={(e) => setEnrollment(e.target.value)}
                    placeholder="e.g. 241030188"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:border-violet-500 focus:outline-none"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Portal Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your webportal password"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:border-violet-500 focus:outline-none"
                  />
                </div>

                {/* Live Captcha Image & Input */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-zinc-300">
                      Live Portal Captcha Code
                    </label>
                    <button
                      type="button"
                      onClick={fetchCaptcha}
                      disabled={captchaLoading}
                      className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${captchaLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh Image</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 min-w-[140px] bg-zinc-900 rounded-lg border border-zinc-700 flex items-center justify-center overflow-hidden">
                      {captchaData?.image ? (
                        <img
                          src={captchaData.image}
                          alt="Webportal Captcha"
                          className="h-full w-auto object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-500 animate-pulse">Loading captcha...</span>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={captchaText}
                      onChange={(e) => setCaptchaText(e.target.value)}
                      placeholder="Type the 5 letters"
                      className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-mono tracking-widest uppercase focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {loading && (
                <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 animate-spin text-violet-400 shrink-0" />
                  <span className="font-medium animate-pulse">{loadingStep}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !captchaText.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Authenticating...' : 'Sign In & Pull Attendance'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Form Tab 2: 1-Click Session Token */}
          {!syncResult && activeTab === 'token' && (
            <form onSubmit={handleTokenSync} className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 space-y-2">
                <div className="font-semibold text-emerald-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Zero-Password, Zero-Captcha Session Token Sync</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Already logged into <a href="https://webportal.jiit.ac.in:6011/studentportal/#/" target="_blank" rel="noreferrer" className="text-violet-400 underline">webportal.jiit.ac.in</a> in Chrome/Edge? You can instantly pull your batch & attendance with your active session token:
                </p>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono space-y-2">
                  <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                    <span>Press F12 in your Webportal tab & paste this in Console:</span>
                    <button
                      type="button"
                      onClick={copyConsoleSnippet}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedSnippet ? 'Copied!' : 'Copy Snippet'}</span>
                    </button>
                  </div>
                  <code className="text-emerald-300 block select-all text-[11px] overflow-x-auto py-1">
                    copy(localStorage.getItem('Token') || sessionStorage.getItem('Token'))
                  </code>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400">Paste your Webportal Token</label>
                <textarea
                  rows={3}
                  required
                  value={sessionToken}
                  onChange={(e) => setSessionToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:border-violet-500 focus:outline-none"
                />
              </div>

              {loading && (
                <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 animate-spin text-violet-400 shrink-0" />
                  <span className="font-medium animate-pulse">{loadingStep}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading || !sessionToken.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{loading ? 'Ingesting...' : 'Sync Live Profile via Token'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Form Tab 3: Paste Table HTML */}
          {!syncResult && activeTab === 'paste' && (
            <form onSubmit={handlePasteSync} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Raw Table / Source Ingestion
                </span>
                <p>
                  Copy the attendance table or page source directly from Webkiosk or Student Portal and paste it here.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400">Paste Table HTML or Page Source</label>
                <textarea
                  rows={6}
                  required
                  value={rawHtml}
                  onChange={(e) => setRawHtml(e.target.value)}
                  placeholder="<table>... or paste copied text"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading || !rawHtml.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{loading ? 'Parsing...' : 'Extract & Preview'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Sync Results Preview */}
          {syncResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Synchronized from {syncResult.source || 'JIIT Portal'}!
                  </span>
                  <span className="text-[11px] font-mono">{syncResult.latencyMs}ms</span>
                </div>
                <p className="text-zinc-300 text-[11px]">{syncResult.message}</p>
              </div>

              {/* Student Identity & Batch Card */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase font-medium">Student Name</span>
                  <span className="font-bold text-white truncate block">
                    {syncResult.studentInfo?.name || syncResult.studentName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase font-medium">Enrollment No</span>
                  <span className="font-mono font-bold text-zinc-200 block">
                    {syncResult.studentInfo?.enrollmentNo || syncResult.enrollmentNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase font-medium">Assigned Batch</span>
                  <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block border border-emerald-500/20">
                    {syncResult.studentInfo?.batch || syncResult.batch || '128-B3'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase font-medium">Branch & Year</span>
                  <span className="text-zinc-300 text-[11px] truncate block">
                    {syncResult.studentInfo?.branch || syncResult.branch || 'CSE'}
                  </span>
                </div>
              </div>

              {/* Attendance Table Preview */}
              <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/60">
                <div className="px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex justify-between">
                  <span>Course Code & Details</span>
                  <span>Extracted Attendance</span>
                </div>

                <div className="divide-y divide-zinc-800/60 text-xs max-h-64 overflow-y-auto">
                  {syncResult.subjects.map((sub) => {
                    const current = currentSubjects.find((s) => s.code === sub.code || s.id === sub.id);
                    const pct = sub.percentage || ((sub.attended / sub.total) * 100).toFixed(1);
                    const isSafe = pct >= 75;

                    return (
                      <div key={sub.code} className="p-3 flex items-center justify-between gap-4 hover:bg-zinc-900/40">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                              {sub.code}
                            </span>
                            <span className="font-bold text-white text-[11px]">{sub.shortName || sub.name}</span>
                          </div>
                          {(sub.lecturePercent != null || sub.tutorialPercent != null || sub.practicalPercent != null) && (
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-zinc-400">
                              {sub.lecturePercent != null && <span>L: {sub.lecturePercent}%</span>}
                              {sub.tutorialPercent != null && <span>• T: {sub.tutorialPercent}%</span>}
                              {sub.practicalPercent != null && <span>• P: {sub.practicalPercent}%</span>}
                            </div>
                          )}
                          {current && (
                            <span className="text-[10px] text-zinc-500 mt-0.5 block">
                              Previous: {current.attended}/{current.total} ({((current.attended / current.total) * 100).toFixed(1)}%)
                            </span>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex items-baseline gap-1 justify-end font-mono">
                            <span className="font-bold text-white">{sub.attended}</span>
                            <span className="text-zinc-500">/ {sub.total}</span>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                              isSafe
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {pct}% {isSafe ? 'Safe' : 'Debarment Risk'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSyncResult(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  Back to Form
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Attendance & Update Profile (Batch {syncResult.studentInfo?.batch || syncResult.batch})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
