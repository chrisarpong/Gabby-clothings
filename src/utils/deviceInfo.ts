export async function getDeviceInfo() {
  const ua = navigator.userAgent;
  let deviceName = "Unknown Device";
  let ipAddress = "Unknown IP";

  // Parse User Agent
  const browserMatch = ua.match(/(firefox|msie|chrome|safari|trident|edge)\/?\s*(\d+)/i) || [];
  const browser = browserMatch[1] || "Browser";
  const isMobile = /Mobi|Android/i.test(ua);
  const osMatch = ua.match(/(mac os x|windows nt|linux|android|iphone|ipad)/i) || [];
  const os = osMatch[1] || "OS";

  deviceName = `${browser} on ${os}${isMobile ? " (Mobile)" : ""}`;

  // Call our Convex HTTP endpoint to get the IP address
  try {
    const convexUrl = import.meta.env.VITE_CONVEX_URL;
    if (convexUrl) {
      // The HTTP endpoint is typically served from the .site domain instead of .cloud
      // but in local development it's just the same URL.
      const siteUrl = convexUrl.includes('.cloud') 
        ? convexUrl.replace('.cloud', '.site')
        : convexUrl;
        
      const res = await fetch(`${siteUrl}/client-info`);
      if (res.ok) {
        const data = await res.json();
        if (data.ipAddress) {
          ipAddress = data.ipAddress.split(',')[0].trim(); // Handle multiple IPs in X-Forwarded-For
        }
      }
    }
  } catch (error) {
    console.error("Failed to get IP address", error);
  }

  return { ipAddress, userAgent: ua, deviceName };
}
