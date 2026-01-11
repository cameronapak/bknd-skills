---
title: "Build Your First API - Test Checklist"
description: "Validation checklist to verify the Build Your First API tutorial works end-to-end."
---

# Build Your First API - Test Checklist

Use this checklist to validate that the tutorial works end-to-end.

## Prerequisites Check

- [ ] Node.js 22+ is installed (`node -v`)
- [ ] npm is available (`npm -v`)

## Step 1: Create Vite + React Project

- [ ] Project created successfully
- [ ] Dependencies installed without errors
- [ ] `bknd` and `@hono/vite-dev-server` are in `package.json`

## Step 2: Configure Bknd with Schema

- [ ] `bknd.config.ts` file exists
- [ ] Schema is defined with `todos` entity
- [ ] `title` field is defined (text, required)
- [ ] `done` field is defined (boolean)
- [ ] `server.ts` file exists
- [ ] `vite.config.ts` updated with devServer plugin
- [ ] No TypeScript errors

## Step 3: Start Backend

- [ ] `npm run dev` starts successfully
- [ ] Server runs on `http://localhost:5174`
- [ ] `http://localhost:5174/api/system/config` returns valid JSON

## Step 4: Add Admin UI

- [ ] `App.tsx` renders Admin component
- [ ] `http://localhost:5174/` shows Admin UI
- [ ] Admin UI is interactive (no console errors)

## Step 5: Access Admin UI

- [ ] `App.tsx` renders Admin component
- [ ] `http://localhost:5174/` shows Admin UI
- [ ] Admin UI is interactive (no console errors)
- [ ] Can see `todos` entity in sidebar
- [ ] Can view existing todos (empty list initially)
- [ ] Can add new todo via Admin UI
- [ ] Can edit existing todos
- [ ] Can delete todos
- [ ] Changes persist in database

## Step 6: Enable Auth Module

**CANNOT TEST - User creation workflow unknown**

- [ ] Auth module is enabled in config
- [ ] Can create first admin user
- [ ] Can log in to Admin UI
- [ ] JWT tokens are generated

## Step 7: Build React UI

- [ ] Types are generated (`bknd-types.d.ts` exists)
- [ ] React component renders without errors
- [ ] Can fetch data from API (`api.data.readMany`)
- [ ] Can create data (`api.data.createOne`)
- [ ] UI updates after data changes

## End-to-End Test

**CANNOT TEST COMPLETELY - Missing steps**

- [ ] Complete todo app works:
  - [ ] Can view todos
  - [ ] Can add new todo
  - [ ] Can mark todo as done
  - [ ] Can delete todo
  - [ ] Data persists across page reloads

## Known Issues

- Entity creation workflow in Admin UI is not documented
- First admin user creation process is unclear
- CLI user command syntax needs verification

## Notes

This tutorial is incomplete. The critical missing pieces are:
1. How to create entities in the Admin UI (exact UI flow)
2. How to create the first admin user (Admin UI vs CLI)
3. What field types are available in the UI

These issues should be resolved before considering this tutorial complete.
