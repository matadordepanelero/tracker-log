export default async function handler(req, res) {
  const { id } = req.query;

  const destinos = {
    promo1: "https://google.com",
  };

  const destino = destinos[id] || "https://google.com";

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Redirecionando...</title></head>
<body>
<script>
async function coletarDados() {
  const dados = {
    id: "${id}",
    resolucaoTela: screen.width + "x" + screen.height,
    plataforma: navigator.platform,
    idiomas: navigator.languages ? navigator.languages.join(", ") : navigator.language,
    fusoHorario: Intl.DateTimeFormat().resolvedOptions().timeZone,
    nucleosCPU: navigator.hardwareConcurrency || "desconhecido",
    memoriaRAM: navigator.deviceMemory ? navigator.deviceMemory + "GB" : "desconhecido",
    tipoConexao: (navigator.connection && navigator.connection.effectiveType) || "desconhecido",
    referrerDocumento: document.referrer || "Direto",
  };

  try {
    await fetch("/api/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
  } catch (e) {}

  window.location.href = "${destino}";
}
coletarDados();
</script>
</body>
</html>
  `);
}
