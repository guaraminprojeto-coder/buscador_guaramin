export async function enviarMensagem(telefone, texto) {
  const url = `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
  },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: telefone,
      type: "text",
      text: { body: texto }
    })
  });

  if (!response.ok) {
    const erro = await response.json();
    console.error("Erro ao enviar mensagem:", erro);
  }
}

export function formatarResultados(cadastros, servico) {
  if (cadastros.length === 0) {
    return (
      `😕 Não encontrei nenhum *${servico}* cadastrado ainda.\n\n` +
      `Quer cadastrar seu negócio? Digite */cadastrar*`
    );
  }

  let resposta = `🔍 Encontrei *${cadastros.length}* resultado(s) para *${servico}*:\n\n`;

  cadastros.forEach((c, i) => {
    const badge = c.plano === "premium" ? "⭐ Destaque" : "📋 Básico";
    resposta += `${badge}\n`;
    resposta += `*${c.nome}*\n`;
    resposta += `📞 ${c.telefone}\n`;
    if (c.descricao) resposta += `📝 ${c.descricao}\n`;
    if (i < cadastros.length - 1) resposta += `\n`;
  });

  return resposta;
}