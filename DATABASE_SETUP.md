# Database Setup for Update & Delete Functionality

The backend functions for updating and deleting reports are already implemented in `services/reportService.ts` and use Supabase to connect to your database. However, you need to set up Row Level Security (RLS) policies in your Supabase database.

## ✅ What's Already Done

1. **Backend Functions** - Fully implemented in `services/reportService.ts`:
   - `updateReport()` - Updates reports via Supabase
   - `deleteReport()` - Deletes reports via Supabase

2. **Frontend Integration** - Complete:
   - `useReports` hook with `updateReportData()` and `removeReport()`
   - `ReportActions` component for UI
   - Integrated into `report-details.tsx`

3. **Database Schema** - Has `ON DELETE CASCADE` set up correctly

## 🔧 What You Need to Do

### Step 1: Check Current RLS Status

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the queries in `CHECK_AND_FIX_RLS.sql` to see existing policies

### Step 2: Apply RLS Policies

1. In the **SQL Editor**, run all the policies from `UPDATE_DELETE_RLS_POLICIES.sql`
2. This will create policies that allow users to:
   - Update only their own reports
   - Delete only their own reports
   - Update/delete related data (events, hazards, etc.) for their reports

### Step 3: Verify

After running the policies, verify they were created:

```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('reports', 'events', 'hazards', 'lostitems', 'founditems')
ORDER BY tablename, cmd;
```

You should see UPDATE and DELETE policies for each table.

## 🧪 Testing

### Test Update:
1. Create a report in your app
2. Go to that report's details page
3. Click "Edit Report"
4. Change the description
5. Click "Save"
6. Check console for logs: "Updating report: X" and "Update result: true"

### Test Delete:
1. Go to one of your reports
2. Click "Delete Report"
3. Confirm deletion
4. Check console for logs: "Deleting report: X" and "Delete result: true"
5. Should navigate back and report should be gone

## 🔍 Troubleshooting

### If update/delete fails:

1. **Check Console Logs** - Look for error messages in the browser/app console
2. **Verify User Authentication** - Make sure `currentUserId` is set correctly
3. **Check RLS Policies** - Run the verification query to ensure policies exist
4. **Check Database Logs** - In Supabase dashboard, go to Database > Logs

### Common Issues:

1. **"Failed to update report"**
   - RLS policy not created → Run `UPDATE_DELETE_RLS_POLICIES.sql`
   - User not authenticated → Check auth state
   - Wrong user trying to update → Only owner can update

2. **"Failed to delete report"**
   - RLS policy not created → Run `UPDATE_DELETE_RLS_POLICIES.sql`
   - CASCADE not set up → Should be in your schema already

3. **Nothing happens when clicking buttons**
   - Check console for errors
   - Verify `useReports` hook is imported correctly
   - Check if `currentUserId` matches `report.userid`

## 📝 Key Security Features

- ✅ **Owner-only updates**: Users can only update their own reports
- ✅ **Owner-only deletes**: Users can only delete their own reports
- ✅ **Automatic cascade**: Deleting a report automatically removes related data
- ✅ **Client-side validation**: UI only shows buttons to report owners
- ✅ **Server-side validation**: RLS policies enforce ownership at database level

## 🎯 How It Works

```
User clicks "Edit" or "Delete"
    ↓
ReportActions component
    ↓
useReports hook
    ↓
reportService (updateReport/deleteReport)
    ↓
Supabase Client
    ↓
PostgreSQL Database with RLS
    ↓
Checks: Is auth.uid() = report.userid?
    ↓ YES
Success! ✅
    ↓ NO
Permission Denied ❌
```

## 📚 Files Reference

- `services/reportService.ts` - Backend functions
- `hooks/useReports.ts` - State management
- `components/ReportActions.tsx` - UI component
- `app/report-details.tsx` - Integration example
- `UPDATE_DELETE_RLS_POLICIES.sql` - Database policies to run
- `CHECK_AND_FIX_RLS.sql` - Diagnostic queries

