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
    SELECT * FROM buscas ORDER BY criado_em DESC LIMIT 100
  `);
  return Response.json(rows);
}