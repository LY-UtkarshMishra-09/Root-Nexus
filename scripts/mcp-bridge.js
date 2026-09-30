#!/usr/bin/env node

/**
 * Root Nexus - Local Model Context Protocol (MCP) Server Bridge
 *
 * Implements the official MCP standard (@modelcontextprotocol/sdk) to expose
 * JIIT Sector-128 academic data (daily schedule & attendance warnings) directly
 * to LLMs, Claude Desktop, Antigravity, and AI coding agents.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// JIIT Sector-128 Academic Schedule Data (Batch 128-B3)
const TIMETABLE = {
  Monday: [
    { time: '09:00 - 09:50', code: '24B11CS111', subject: 'SDF-1 (Control Structures)', type: 'Lecture', room: 'LT-1', faculty: 'Dr. MKT' },
    { time: '10:00 - 10:50', code: '24B11MA111', subject: 'Maths-1 (Eigenvalues)', type: 'Lecture', room: 'LT-2', faculty: 'Prof. AT' },
    { time: '11:00 - 11:50', code: '24B11PH111', subject: 'Engineering Physics', type: 'Lecture', room: 'LT-1', faculty: 'Dr. NG' },
    { time: '12:00 - 12:50', code: '24B11HS111', subject: 'Professional Communication', type: 'Tutorial', room: 'G-12', faculty: 'Dr. MM' },
    { time: '14:00 - 15:50', code: '24B17CS171', subject: 'SDF Lab (Pointers & Arrays)', type: 'Lab', room: 'Computer Lab 2', faculty: 'Er. PM' },
  ],
  Tuesday: [
    { time: '09:00 - 09:50', code: '24B11ME111', subject: 'Workshop Practice (Carpentry)', type: 'Lecture', room: 'TS-1', faculty: 'Er. VKS' },
    { time: '10:00 - 10:50', code: '24B11CS111', subject: 'SDF-1 (Functions & Recursion)', type: 'Lecture', room: 'LT-1', faculty: 'Dr. MKT' },
    { time: '11:00 - 11:50', code: '24B11MA111', subject: 'Maths-1 (Calculus)', type: 'Lecture', room: 'LT-2', faculty: 'Prof. AT' },
    { time: '14:00 - 15:50', code: '24B17PH171', subject: 'Physics Lab (Laser & Optics)', type: 'Lab', room: 'TS-1 Physics Lab', faculty: 'Dr. AP' },
  ],
  Wednesday: [
    { time: '09:00 - 09:50', code: '24B11PH111', subject: 'Engineering Physics (Electromagnetics)', type: 'Lecture', room: 'LT-1', faculty: 'Dr. NG' },
    { time: '10:00 - 10:50', code: '24B11CS111', subject: 'SDF-1 (Pointers in C)', type: 'Lecture', room: 'LT-2', faculty: 'Dr. MKT' },
    { time: '11:00 - 11:50', code: '24B11HS111', subject: 'Soft Skills (Interview Etiquette)', type: 'Lecture', room: 'G-12', faculty: 'Dr. MM' },
    { time: '14:00 - 15:50', code: '24B11ME111', subject: 'Workshop Lab (Machining)', type: 'Lab', room: 'Mechanical Workshop', faculty: 'Er. VKS' },
  ],
  Thursday: [
    { time: '09:00 - 09:50', code: '24B11PH111', subject: 'Engineering Physics (Laser & Optics)', type: 'Lecture', room: 'LT-1', faculty: 'Dr. NG' },
    { time: '10:00 - 10:50', code: '24B11MA111', subject: 'Maths-1 (Lagrange Multipliers)', type: 'Lecture', room: 'LT-2', faculty: 'Prof. AT' },
    { time: '11:00 - 11:50', code: '24B11CS111', subject: 'SDF-1 Tutorial (Pointers Sheet)', type: 'Tutorial', room: 'TS-1', faculty: 'Er. PM' },
    { time: '14:00 - 15:50', code: '24B17CS171', subject: 'SDF Lab (Recursion & File IO)', type: 'Lab', room: 'Computer Lab 2', faculty: 'Er. PM' },
  ],
  Friday: [
    { time: '09:00 - 09:50', code: '24B11CS111', subject: 'SDF-1 (Structures & Unions)', type: 'Lecture', room: 'LT-1', faculty: 'Dr. MKT' },
    { time: '10:00 - 10:50', code: '24B11MA111', subject: 'Maths-1 Tutorial (Calculus Problems)', type: 'Tutorial', room: 'LT-2', faculty: 'Prof. AT' },
    { time: '11:00 - 11:50', code: '24B11PH111', subject: 'Physics Tutorial (Wave Optics Sheet)', type: 'Tutorial', room: 'TS-1', faculty: 'Dr. AP' },
    { time: '14:00 - 15:50', code: '24B17PH171', subject: 'Physics Lab (Diffraction Grating Viva)', type: 'Lab', room: 'TS-1 Physics Lab', faculty: 'Dr. AP' },
  ],
  Saturday: [
    { time: '09:00 - 09:50', code: '24B11MA111', subject: 'Maths-1 (Remedial & Problem Solving)', type: 'Tutorial', room: 'LT-1', faculty: 'Prof. AT' },
    { time: '10:00 - 10:50', code: '24B11CS111', subject: 'SDF-1 (Doubt Clearing & Tracing)', type: 'Lecture', room: 'LT-2', faculty: 'Dr. MKT' },
    { time: '11:00 - 12:50', code: '24B17CS171', subject: 'SDF Lab (Make-up Practical & Evaluation)', type: 'Lab', room: 'Computer Lab 3', faculty: 'Er. PM' },
    { time: '14:00 - 15:50', code: '24B11HS111', subject: 'Soft Skills Workshop & Aptitude Prep', type: 'Tutorial', room: 'G-12', faculty: 'Dr. MM' },
  ],
};

// Seed Attendance Data for 75% rule analysis
const SUBJECTS_ATTENDANCE = [
  { code: '24B11CS111', name: 'SDF-1', attended: 28, total: 32 },
  { code: '24B11MA111', name: 'Maths-1', attended: 22, total: 28 },
  { code: '24B11PH111', name: 'Physics', attended: 18, total: 26 },
  { code: '24B11ME111', name: 'Workshop', attended: 9, total: 10 },
  { code: '24B11HS111', name: 'Soft Skills', attended: 15, total: 16 },
  { code: '24B17CS171', name: 'SDF Lab', attended: 11, total: 12 },
  { code: '24B17PH171', name: 'Physics Lab', attended: 7, total: 10 },
];

async function main() {
  const server = new Server(
    {
      name: 'root-nexus-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List all available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_daily_schedule',
          description: "Get today's class schedule and room venues for a JIIT Sector-128 1st year CSE student.",
          inputSchema: {
            type: 'object',
            properties: {
              day: {
                type: 'string',
                description: 'Optional weekday name (Monday, Tuesday, etc.). Defaults to current day.',
              },
            },
          },
        },
        {
          name: 'get_attendance_alerts',
          description: 'Calculates the 75% official attendance cutoff across all enrolled subjects, identifying subjects at risk of debarment and calculating safe bunk buffers.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  });

  // Call Tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'get_daily_schedule') {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDay = args?.day || dayNames[new Date().getDay()] || 'Monday';
      const schedule = TIMETABLE[targetDay] || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                day: targetDay,
                campus: 'JIIT Sector-128',
                batch: '128-B3 CSE',
                totalSessions: schedule.length,
                schedule,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === 'get_attendance_alerts') {
      const results = SUBJECTS_ATTENDANCE.map((sub) => {
        const percentage = ((sub.attended / sub.total) * 100).toFixed(1);
        const isDebarred = percentage < 75;
        const safeBunks = percentage >= 75 ? Math.floor((sub.attended - 0.75 * sub.total) / 0.75) : 0;
        const deficit = isDebarred ? Math.ceil((0.75 * sub.total - sub.attended) / 0.25) : 0;

        return {
          subject: sub.name,
          code: sub.code,
          attended: `${sub.attended}/${sub.total}`,
          percentage: `${percentage}%`,
          status: isDebarred ? 'CRITICAL - DEBARRED (<75%)' : 'SAFE (>=75%)',
          safeBunksAvailable: safeBunks,
          classesNeededToRecover: deficit,
        };
      });

      const debarred = results.filter((r) => r.status.includes('CRITICAL'));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                campus: 'JIIT Sector-128',
                rule: '75% Official Debarment Threshold',
                totalSubjects: results.length,
                atRiskCount: debarred.length,
                allClear: debarred.length === 0,
                subjects: results,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Root Nexus MCP Server Bridge running on stdio');
}

main().catch((err) => {
  console.error('Fatal MCP Server error:', err);
  process.exit(1);
});

