import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
// Helpers for distance calculation
function toRad(n) {
  return n * Math.PI / 180;
}
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
serve(async (req)=>{
  try {
    const body = await req.json();
    const { reportId } = body;
    console.log('[EdgeFunction] Received request for reportId:', reportId);
    if (!reportId) return new Response('missing reportId', {
      status: 400
    });
    // Check internal token
    const INTERNAL_TOKEN = Deno.env.get('MY_INTERNAL_TOKEN');
    const token = req.headers.get('X-Internal-Token');
    if (!token || token !== INTERNAL_TOKEN) {
      console.warn('[EdgeFunction] Unauthorized request, token invalid:', token);
      return new Response('unauthorized', {
        status: 401
      });
    }
    console.log('[EdgeFunction] Valid internal token, processing request');
    // Read service role key from environment
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('[EdgeFunction] Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response('missing env', {
        status: 500
      });
    }
    // Fetch the report from Supabase
    const reportResp = await fetch(`${SUPABASE_URL}/rest/v1/reports?reportid=eq.${reportId}&select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    const reports = await reportResp.json();
    const reportRow = reports?.[0];
    if (!reportRow) {
      console.warn(`[EdgeFunction] Report not found: ${reportId}`);
      return new Response('report not found', {
        status: 404
      });
    }
    console.log("[EdgeFunction] ReportRow:", reportRow);
    function parsePoint(pointStr) {
      // "(x,y)" → [x, y]
      const match = pointStr.match(/\(?([-\d.]+),([-\d.]+)\)?/);
      if (!match) return {
        x: 0,
        y: 0
      };
      return {
        x: parseFloat(match[1]),
        y: parseFloat(match[2])
      };
    }
    const point = parsePoint(reportRow.location);
    const report = {
      id: String(reportRow.reportid),
      type: reportRow.category,
      title: reportRow.category,
      description: reportRow.description,
      lat: point.y,
      lon: point.x // longitude
    };

    console.log(`[EdgeFunction] Report loaded: ${JSON.stringify(report)}`);
    // Fetch users with matching notification preferences
    console.log("Type:", report.type);

    const filter = encodeURIComponent(`["${report.type}"]`);
    const usersResp = await fetch(`${SUPABASE_URL}/rest/v1/notification_preferences?expo_push_token=not.is.null&notify_types=cs.${filter}&select=user_id,expo_push_token,notify_radius_m,last_location_lat,last_location_lon`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    console.log("[EdgeFunction] Users response status:", usersResp.status);
    const text = await usersResp.text();
    console.log("[EdgeFunction] Users response body:", text);
    let users = [];
    try {
      users = JSON.parse(text);
    } catch (e) {
      console.error("[EdgeFunction] Failed to parse users JSON:", e);
    }
    console.log(`[EdgeFunction] Found ${users.length} users with notify type ${report.type}`);
    const messages = [];
    for (const u of users){
      if (!u.last_location_lat || !u.last_location_lon) continue;
      const dist = haversineDistance(report.lat, report.lon, Number(u.last_location_lat), Number(u.last_location_lon));
      const radius = u.notify_radius_m || 1000;
      if (dist <= radius) {
        messages.push({
          to: u.expo_push_token,
          sound: 'default',
          title: `Nearby ${report.type}`,
          body: report.description || `New ${report.type} reported nearby`,
          data: {
            reportId: report.id
          }
        });
        console.log(`[EdgeFunction] Will notify user ${u.user_id}, distance=${dist.toFixed(0)}m`);
      } else {
        console.log(`[EdgeFunction] Skipping user ${u.user_id}, out of range (${dist.toFixed(0)}m)`);
      }
    }
    // Send notifications in batches of 100
    for(let i = 0; i < messages.length; i += 100){
      const batch = messages.slice(i, i + 100);
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(batch)
      });
      const result = await res.json();
      console.log('[EdgeFunction] Expo push result batch:', result);
    }
    console.log(`[EdgeFunction] Total notifications sent: ${messages.length}`);
    return new Response(JSON.stringify({
      sent: messages.length
    }), {
      status: 200
    });
  } catch (e) {
    console.error('[EdgeFunction] Error:', e);
    return new Response('internal error', {
      status: 500
    });
  }
});
