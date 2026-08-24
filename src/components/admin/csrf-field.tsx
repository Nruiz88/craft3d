import { generateCsrfToken } from "@/lib/utils/csrf";

/**
 * Hidden input that injects a CSRF token into any form.
 * Use inside <form> elements in admin pages.
 */
export default async function CsrfField() {
  const token = await generateCsrfToken();
  return <input type="hidden" name="csrf_token" value={token} />;
}
