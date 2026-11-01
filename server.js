import express from "express";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

app.use(express.json({ limit: "20kb" }));
app.use(express.static("."));

app.post("/api/solicitud", async (req, res) => {
  if (!WEBHOOK_URL) {
    return res.status(500).json({ error: "Webhook no configurado en el servidor." });
  }

  const { nombre, edad, usuario, puesto, motivo } = req.body || {};
  if (![nombre, edad, usuario, puesto, motivo].every(v => String(v || "").trim())) {
    return res.status(400).json({ error: "Completa todos los campos." });
  }

  const clean = value => String(value).trim().slice(0, 900);
  const embed = {
    title: "📩 Nueva solicitud de empleo",
    color: 0xED69AA,
    fields: [
      { name: "Nombre", value: clean(nombre), inline: true },
      { name: "Edad", value: clean(edad), inline: true },
      { name: "Usuario", value: clean(usuario), inline: true },
      { name: "Puesto", value: clean(puesto), inline: true },
      { name: "Motivo", value: clean(motivo), inline: false }
    ],
    footer: { text: "Pinky Pussy · By Pepa" },
    timestamp: new Date().toISOString()
  };

  try {
    const discordResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "@everyone",
        embeds: [embed],
        allowed_mentions: { parse: ["everyone"] }
      })
    });

    if (!discordResponse.ok) {
      return res.status(502).json({ error: "Discord rechazó el envío." });
    }
    return res.json({ ok: true });
  } catch {
    return res.status(502).json({ error: "No se pudo conectar con Discord." });
  }
});

app.listen(PORT, () => {
  console.log(`Pinky Pussy disponible en el puerto ${PORT}`);
});
