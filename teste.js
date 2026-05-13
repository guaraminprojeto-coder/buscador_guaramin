import { GoogleGenerativeAI } from "@google/generative-ai";
import pg from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: true 
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function interpretarBusca(mensagem) {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
    Você é o assistente do Guaramim, um diretório comercial local brasileiro.
    Analise a mensagem e retorne APENAS um JSON:
    {
      "servico": "nome do serviço em letras minúsculas",
      "confianca": "alta | media | baixa"
    }
    
    Mensagem: "${mensagem}"
    Retorne APENAS o JSON, sem explicações.
  `;

  const result = await model.generateContent(prompt);
  const texto = result.response.text().trim();
  
  try {
    const limpo = texto.replace(/```json|```/g, "").trim();
    return JSON.parse(limpo);
  } catch {
    return { servico: mensagem.toLowerCase(), confianca: "baixa" };
  }
}

async function buscarCadastros(servico) {
  const { rows } = await pool.query(`
    SELECT nome, telefone, descricao, plano,
      similarity(categoria, $1) AS score
    FROM cadastros
    WHERE similarity(categoria, $1) > 0.2
      OR categoria ILIKE $2
    ORDER BY plano DESC, score DESC
    LIMIT 5
  `, [servico, `%${servico}%`]);
  return rows;
}

// ✅ Simulação de mensagens reais
const testes = [
  "preciso do serviço de um encanador",
  "contato de eletricistas",
  "contato de confeiteira",
  "tem numero de veterinario?",
  "pintor"
];

console.log("🐦 Iniciando testes do Guaramim...\n");

for (const mensagem of testes) {
  console.log(`💬 Usuário: "${mensagem}"`);
  
  const intencao = await interpretarBusca(mensagem);
  console.log(`🧠 Gemini interpretou: ${intencao.servico} (confiança: ${intencao.confianca})`);
  
  const resultados = await buscarCadastros(intencao.servico);
  
  if (resultados.length === 0) {
    console.log(`❌ Nenhum cadastro encontrado\n`);
  } else {
    console.log(`✅ ${resultados.length} resultado(s) encontrado(s):`);
    resultados.forEach(r => {
      const badge = r.plano === "premium" ? "⭐" : "📋";
      console.log(`   ${badge} ${r.nome} — ${r.telefone}`);
    });
    console.log();
  }
}

await pool.end();