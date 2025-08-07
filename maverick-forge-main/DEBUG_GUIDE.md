# Debug Guide: Real-Time Dashboard Updates

## Issue
When updating fresher details in the admin dashboard, the changes are not reflecting in the fresher's dashboard automatically.

## Debugging Steps

### Step 1: Check Browser Console
1. Open the fresher dashboard in one tab
2. Open the admin dashboard in another tab
3. Open browser developer tools (F12) on both tabs
4. Look for console messages when you update a fresher

### Step 2: Test Manual Trigger
1. In the fresher dashboard, click the "Test Trigger" button
2. Check if you see the "Dashboard Updated" notification
3. Check console for debug messages

### Step 3: Verify localStorage
1. In browser dev tools, go to Application tab
2. Check localStorage for the current domain
3. Look for `dashboardRefresh` and `lastDashboardRefresh` keys
4. Verify they change when you update a fresher

### Step 4: Test Admin Update
1. In admin dashboard, edit a fresher's scores
2. Check console for "Admin: Triggered dashboard refresh" message
3. Go to fresher dashboard and check for "Refresh detected!" message

## Expected Console Messages

### Admin Dashboard (when updating):
```
Admin: Triggered dashboard refresh with timestamp: 1234567890
```

### Fresher Dashboard (every 2 seconds):
```
Checking for refresh: {refreshTimestamp: "1234567890", lastRefresh: "1234567880"}
```

### Fresher Dashboard (when refresh detected):
```
Refresh detected! Updating dashboard...
Storage event detected! Updating dashboard...
```

## Common Issues

### Issue 1: No console messages
- Check if both servers are running
- Verify browser console is open
- Check for JavaScript errors

### Issue 2: Admin messages but no fresher messages
- Check if fresher dashboard is in a different tab
- Verify localStorage is working
- Check if there are any JavaScript errors in fresher dashboard

### Issue 3: Messages but no data update
- Check if the API endpoint is working
- Verify the fresher ID is correct
- Check network tab for failed requests

## Manual Testing

### Test 1: Direct API Call
```javascript
// In browser console, test the API directly
fetch('http://localhost:5000/api/fresher/profile/1')
  .then(response => response.json())
  .then(data => console.log('Fresher data:', data))
  .catch(error => console.error('API error:', error));
```

### Test 2: localStorage Test
```javascript
// In browser console, test localStorage
localStorage.setItem('dashboardRefresh', Date.now().toString());
console.log('localStorage set:', localStorage.getItem('dashboardRefresh'));
```

### Test 3: Manual Refresh Test
```javascript
// In browser console, trigger manual refresh
const timestamp = Date.now().toString();
localStorage.setItem('dashboardRefresh', timestamp);
console.log('Manual trigger set:', timestamp);
```

## Troubleshooting Commands

### Check if servers are running:
```bash
# Backend
curl http://localhost:5000/health

# Frontend
curl http://localhost:5173
```

### Check database connection:
```bash
# Test database connection
mysql -u root -p maverick -e "SELECT * FROM freshers LIMIT 1;"
```

## Expected Behavior

1. **Admin updates fresher** → Console shows admin message
2. **Within 2 seconds** → Fresher dashboard detects change
3. **Fresher dashboard** → Shows "Dashboard Updated" notification
4. **Scores update** → New scores appear in training status cards
5. **Overall progress** → Updates to reflect new average

## If Still Not Working

1. **Clear browser cache** and localStorage
2. **Restart both servers**
3. **Check for CORS issues** in network tab
4. **Verify database** has the updated data
5. **Test with different browser** or incognito mode

## Contact Support

If the issue persists, please provide:
- Browser console logs
- Network tab screenshots
- Database query results
- Steps to reproduce the issue 