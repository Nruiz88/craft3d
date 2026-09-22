import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ ok: false, message: "Falta email o password" }, { status: 400 });
    const sql = `SELECT id FROM \`default\`.users WHERE email='${email.replace(/'/g,"''")}' AND password='${password.replace(/'/g,"''")}' LIMIT 1;`;
    try {
      const out = execSync(`mysql -h ikhtk2iuum3lvqyz9pvih46v -P 3306 -u mariadb -p'${process.env.MARIADB_PASSWORD || ""}' default -e "${sql}" --batch --skip-column-names`, { encoding: "utf-8", timeout: 3000 });
      if (out.trim().length > 0) return NextResponse.json({ ok: true, message: "Login ok", userId: out.trim() });
    } catch {}
    return NextResponse.json({ ok: false, message: "Credenciales incorrectas" }, { status: 401 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message }, { status: 500 });
  }
}
