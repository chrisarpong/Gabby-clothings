export function getTempPasswordSms(password: string, siteUrl: string): string {
  const loginUrl = `${siteUrl.replace(/\/+$/, "")}/staff/login`;
  return `Gabby Newluk: temp password ${password} (15 min, one use). Log in at ${loginUrl} and set a new one. Not you? Tell your manager.`;
}

export function getPasswordChangedSms(): string {
  return "Gabby Newluk: your staff password was just changed. Not you? Tell your manager now.";
}

