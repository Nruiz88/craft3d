import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ ok: false, message: "Falta email o password" }, { status: 400 });
    const sql = `INSERT IGNORE INTO \`default\`.users (email, password) VALUES ('${String(email).replace(/'/g,"''")}', '${String(password).replace(/'/g,"''")}');`;
    try {
      execSync(`mysql -h ikhtk2iuum3lvqyz9pvih46v -P 3306 -u mariadb -p'${process.env.MARIADB_PASSWORD || ""}' default -e "${sql}" 2>&1`, { stdio: "pipe", encoding: "utf-8", timeout: 3000 });
      return NextResponse.json({ ok: true, message: "Cuenta creada" });
    } catch (e: any) {
      return NextResponse.json({ ok: true, message: "Ejecuta en DB: " + sql, note: "mysql CLI error: " + (e.message || "") });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message }, { status: 500 });
  }
}
