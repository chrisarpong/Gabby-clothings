/**
 * Transforms any Convex error (ConvexError instance, RPC string, JSON payload, or Error)
 * into a clear, concise, user-friendly error message without technical noise.
 */
export function parseConvexError(error: any, fallback = "An unexpected error occurred."): string {
  if (!error) return fallback;

  // 1. Direct ConvexError data object or string
  if (error.data) {
    if (typeof error.data === 'string' && error.data.trim()) {
      return formatFriendlyMessage(error.data);
    }
    if (typeof error.data === 'object') {
      if (typeof error.data.message === 'string' && error.data.message.trim()) {
        return formatFriendlyMessage(error.data.message);
      }
      if (error.data.code) {
        return codeToFriendlyMessage(error.data.code);
      }
    }
  }

  // 2. Extract string message from error or string representation
  let msg = typeof error === 'string' ? error : error.message || error.toString() || '';

  // 3. Look for embedded JSON in Convex error strings (e.g. Uncaught ConvexError: {"code":"...","message":"..."})
  const jsonMatch = msg.match(/Uncaught ConvexError:\s*(\{[\s\S]*?\})/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.message) return formatFriendlyMessage(parsed.message);
      if (parsed.code) return codeToFriendlyMessage(parsed.code);
    } catch {
      // Ignore JSON parse failure and proceed
    }
  }

  // Also check for any JSON object { "code": ..., "message": ... } in the string
  const generalJsonMatch = msg.match(/\{[\s\n\r]*"(?:code|message)"[\s\S]*?\}/);
  if (generalJsonMatch) {
    try {
      const parsed = JSON.parse(generalJsonMatch[0]);
      if (parsed.message) return formatFriendlyMessage(parsed.message);
      if (parsed.code) return codeToFriendlyMessage(parsed.code);
    } catch {
      // Ignore
    }
  }

  // 4. Look for Uncaught ConvexError: "..."
  const quotedMatch = msg.match(/Uncaught ConvexError:\s*"([^"]+)"/);
  if (quotedMatch) {
    return formatFriendlyMessage(quotedMatch[1]);
  }

  // 5. Look for Uncaught Error: ...
  if (msg.includes("Uncaught Error:")) {
    const parts = msg.split("Uncaught Error:");
    if (parts.length > 1) {
      msg = parts[1];
    }
  } else if (msg.includes("Uncaught ConvexError:")) {
    const parts = msg.split("Uncaught ConvexError:");
    if (parts.length > 1) {
      msg = parts[1];
    }
  }

  // 6. Clean away RPC wrappers and stack traces
  msg = msg
    .replace(/^\[CONVEX [^\]]*\]\s*/gi, '')
    .replace(/^\[Request ID:[^\]]*\]\s*/gi, '')
    .replace(/^Server Error\s*/gi, '')
    .replace(/\s+at handler[\s\S]*$/i, '')
    .replace(/\s+at\s+[\w\.\/\\:<>-]+[\s\S]*$/i, '')
    .replace(/\s+Called by client[\s\S]*$/i, '')
    .trim();

  // Strip leading "Error: "
  msg = msg.replace(/^Error:\s*/i, '').trim();

  if (!msg) return fallback;

  return formatFriendlyMessage(msg);
}

function codeToFriendlyMessage(code: string): string {
  switch (code.toUpperCase()) {
    case 'UNAUTHENTICATED':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'FORBIDDEN':
    case 'UNAUTHORIZED':
      return 'You do not have permission to perform this action.';
    case 'TOO_MANY_REQUESTS':
      return 'Too many login attempts. Please wait a few moments and try again.';
    case 'SETUP_REQUIRED':
      return 'Account setup required. Please complete password setup or two-factor authentication.';
    case 'NOT_FOUND':
      return 'The requested account or resource was not found.';
    case 'BAD_REQUEST':
      return 'Invalid request. Please check the entered information.';
    default:
      return 'An authentication error occurred. Please try again.';
  }
}

function formatFriendlyMessage(msg: string): string {
  const trimmed = msg.trim();
  const lower = trimmed.toLowerCase();

  // Known messages that benefit from extra friendly context
  if (lower === 'invalid email or password') {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (lower.includes('account is deactivated')) {
    return 'This staff account has been deactivated. Please contact your administrator.';
  }
  if (lower.includes('account is locked')) {
    return 'This account is temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.';
  }
  if (lower === 'invalid session' || lower === 'no session') {
    return 'Your session has expired. Please sign in again.';
  }
  if (lower.includes('only ceo can manage staff')) {
    return 'Only the CEO has permission to manage staff accounts.';
  }

  // Ensure first character is capitalized and ends with clean formatting
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return capitalized;
}
