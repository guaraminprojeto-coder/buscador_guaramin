import { getServerSession } from "next-auth";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

export async function GET() {
  const session = await getServerSession();
  if (!session) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const { rows } = await pool.query(`
    SELECT * FROM cadastros ORDER BY criado_em DESC
  `);
  return Response.json(rows);
}

export async function PATCH(req) {
  const session = await getServerSession();
  if (!session) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const { id, campo, valor } = await req.json();
  const camposPermitidos = ["ativo", "plano"];
  if (!camposPermitidos.includes(campo)) {
    return Response.json({ error: "Campo inválido" }, { status: 400 });
  }

  await pool.query(
    `UPDATE cadastros SET ${campo} = $1 WHERE id = $2`,
    [valor, id]
  );
  return Response.json({ ok: true });
}

export async function DELETE(req) {
  const session = await getServerSession();
  if (!session) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await req.json();
  await pool.query("DELETE FROM cadastros WHERE id = $1", [id]);
  return Response.json({ ok: true });
}