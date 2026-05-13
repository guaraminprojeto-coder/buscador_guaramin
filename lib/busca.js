import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

export async function buscarCadastros(servico) {
  const { rows } = await pool.query(`
    SELECT nome, telefone, descricao, plano,
      similarity(categoria, $1) AS score
    FROM cadastros
    WHERE ativo = true
      AND (
        similarity(categoria, $1) > 0.2
        OR categoria ILIKE $2
      )
    ORDER BY plano DESC, score DESC
    LIMIT 5
  `, [servico, `%${servico}%`]);
  return rows;
}