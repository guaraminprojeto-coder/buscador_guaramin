import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function interpretarBusca(mensagem) {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
    Você é o assistente do Guaramim, um diretório comercial local brasileiro.
    Analise a mensagem e retorne APENAS um JSON:
    {
      "servico": "nome do serviço em letras minúsculas",
      "confianca": "alta | media | baixa"
    }
    
    Exemplos:
    "meu cano tá vazando" → {"servico":"encanador","confianca":"alta"}
    "tomada queimou" → {"servico":"eletricista","confianca":"alta"}
    "quero fazer um bolo" → {"servico":"confeitaria","confianca":"alta"}
    "cachorro doente" → {"servico":"veterinário","confianca":"alta"}
    "pintar casa" → {"servico":"pintor","confianca":"alta"}
    
    Mensagem: "${mensagem}"
    Retorne APENAS o JSON, sem explicações, sem markdown.
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