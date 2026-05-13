import { interpretarBusca } from "../../lib/gemini.js";
import { buscarCadastros } from "../../lib/busca.js";
import { enviarMensagem, formatarResultados } from "../../lib/whatsapp.js";

// Remove acentos para comparação
function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const SAUDACOES = ["oi", "ola", "hello", "boa tarde", "bom dia", "boa noite", "boas", "hey", "opa", "tudo bem", "tudo bom"];

export default async function handler(req, res) {

  // Verificação do webhook (Meta exige isso)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  // Recebe mensagens
  if (req.method === "POST") {
    try {
      const body = req.body;
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];

      // Ignora se não for mensagem de texto
      if (!message || message.type !== "text") {
        return res.status(200).json({ status: "ignored" });
      }

      const telefone = message.from;
      const texto = message.text.body.trim();
      const textoNorm = normalizar(texto);

      // Saudações
      const isSaudacao = SAUDACOES.some(s => textoNorm === normalizar(s) || textoNorm.startsWith(normalizar(s)));
      if (isSaudacao) {
        await enviarMensagem(telefone,
          `👋 Olá! Bem-vindo ao *Guaramim* 🐦\n\n` +
          `Sou seu assistente de busca local.\n\n` +
          `Me conta: o que você está precisando?`
        );
        return res.status(200).json({ status: "ok" });
      }

      // Comando de cadastro
      if (textoNorm === "/cadastrar") {
        await enviarMensagem(telefone,
          `📝 Para cadastrar seu negócio no Guaramim, acesse:\nhttps://guaramim.vercel.app/cadastrar`
        );
        return res.status(200).json({ status: "ok" });
      }

      // Interpreta a intenção com Gemini
      const intencao = await interpretarBusca(texto);

      // Confiança baixa — pede para reformular
      if (intencao.confianca === "baixa") {
        await enviarMensagem(telefone,
          `🤔 Não entendi muito bem...\n\n` +
          `Você está procurando por *${intencao.servico}*?\n\n` +
          `Tente descrever melhor o que precisa 😊`
        );
        return res.status(200).json({ status: "ok" });
      }

      // Busca no banco
      const cadastros = await buscarCadastros(intencao.servico);

      // Formata e envia resposta
      const resposta = formatarResultados(cadastros, intencao.servico);
      await enviarMensagem(telefone, resposta);

      return res.status(200).json({ status: "ok" });

    } catch (error) {
      console.error("Erro:", error);
      return res.status(200).json({ status: "error" });
    }
  }

  return res.status(405).end();
}