export function parseConvexError(error: any): string {
  if (!error) return "An unexpected error occurred.";
  
  const msg = typeof error === 'string' ? error : error.message || error.toString();
  
  // If it's a standard Convex error string containing "Uncaught Error:"
  if (msg.includes("Uncaught Error:")) {
    const parts = msg.split("Uncaught Error:");
    if (parts.length > 1) {
      let extracted = parts[1].trim();
      
      // Strip off the stack trace parts like "at handler (...)"
      const atHandlerIndex = extracted.indexOf(" at handler");
      if (atHandlerIndex !== -1) {
        extracted = extracted.substring(0, atHandlerIndex).trim();
      }
      
      // Also check for " at " generally
      const atIndex = extracted.indexOf(" at ");
      if (atIndex !== -1) {
        extracted = extracted.substring(0, atIndex).trim();
      }

      return extracted;
    }
  }

  // Fallback for cleanly thrown ConvexErrors or basic strings
  return msg;
}
