-- =========================================================================
-- Root Nexus: Phase 3 Supabase PostgreSQL Schema & Migration Script
-- Execute this script directly in the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ATTENDANCE TABLE
-- Tracks subject-wise attendance numbers, conducted classes, and debarment statistics
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid(),
    subject_code VARCHAR(32) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    attended INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TODOS & DEADLINES TABLE
-- Tracks assignments, lab evaluations, and revision milestones
CREATE TABLE IF NOT EXISTS public.todos (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid(),
    title TEXT NOT NULL,
    subject_tag VARCHAR(64) DEFAULT 'General',
    subject_code VARCHAR(32) DEFAULT '24B11CS111',
    priority VARCHAR(16) DEFAULT 'Med' CHECK (priority IN ('High', 'Med', 'Low')),
    due_date DATE DEFAULT CURRENT_DATE,
    completed BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. QUICK NOTES & REVISION PAD TABLE
-- Stores markdown study scratchpad and lecture revision notes
CREATE TABLE IF NOT EXISTS public.quick_notes (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid(),
    subject_id VARCHAR(64) DEFAULT 'SDF-1',
    content TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AUTO-UPDATE TRIGGER FUNCTION FOR updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS set_attendance_updated_at ON public.attendance;
CREATE TRIGGER set_attendance_updated_at
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_todos_updated_at ON public.todos;
CREATE TRIGGER set_todos_updated_at
    BEFORE UPDATE ON public.todos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_quick_notes_updated_at ON public.quick_notes;
CREATE TRIGGER set_quick_notes_updated_at
    BEFORE UPDATE ON public.quick_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

-- Allow users to read/write their own records, or allow anonymous demo operations
CREATE POLICY "Allow authenticated or anon full access to attendance"
    ON public.attendance
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated or anon full access to todos"
    ON public.todos
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated or anon full access to quick_notes"
    ON public.quick_notes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_attendance_subject ON public.attendance(subject_code);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON public.todos(completed);

