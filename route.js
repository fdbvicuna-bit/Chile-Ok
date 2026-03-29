import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  const { tipo } = await request.json();

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `Eres un inspector de limpieza municipal en Chile. Analiza un reporte de basura de tipo "${tipo}".
Responde SOLO con JSON sin markdown, con esta estructura exacta:
{
  "confirmado": true,
  "severidad": "Leve|Moderada|Grave|Muy Grave",
  "descripcion": "descripción breve en español de 1 frase",
  "puntos_negativos": número entre 5 y 30,
  "accion_recomendada": "acción concreta en 1 frase"
}`
      }]
    });

    const texto = message.content[0].text;
    const clean = texto.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return Response.json(parsed);
  } catch {
    return Response.json({
      confirmado: true,
      severidad: "Moderada",
      descripcion: "Punto crítico de basura detectado",
      puntos_negativos: 10,
      accion_recomendada: "Notificar a la municipalidad para retiro inmediato"
    });
  }
}
