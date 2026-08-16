export default async function handler(req, res) {
  const { id } = req.query;

  const ip = (req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim() || req.socket?.remoteAddress;

  const userAgent = req.headers["user-agent"] || "Desconhecido";
  const referer = req.headers["referer"] || "Direto (sem origem)";
  const timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  let localizacao = "Não identificada";
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,isp`);
    const geo = await geoRes.json();
    if (geo && geo.city) {
      localizacao = `${geo.city} - ${geo.regionName}, ${geo.country} (${geo.isp})`;
    }
  } catch (e) {
    console.error("Erro na geolocalização:", e);
  }

  const dispositivo = /mobile/i.test(userAgent) ? "📱 Celular" : "💻 Computador";

  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: "🔗 Novo clique registrado",
        color: 0x5865f2,
        fields: [
          { name: "Link", value: `\`${id}\``, inline: true },
          { name: "Dispositivo", value: dispositivo, inline: true },
          { name: "IP", value: ip || "Desconhecido", inline: true },
          { name: "Localização", value: localizacao, inline: false },
          { name: "Origem", value: referer, inline: false },
          { name: "Navegador", value: userAgent.slice(0, 200), inline: false },
        ],
        footer: { text: timestamp }
      }]
    })
  }).catch(err => console.error("Erro no webhook:", err));

  const destinos = {
    promo1: "https://google.com",
  };

  res.redirect(302, destinos[id] || "https://google.com");
}
