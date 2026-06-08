import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `Eres EcoBot, el asistente inteligente de EcoReEngine — una plataforma de aprendizaje sobre electrónica sostenible y reciclaje de e-waste.

Tu rol es ayudar a los usuarios a:
- Identificar componentes electrónicos (resistencias, capacitores, transistores, ICs, etc.)
- Aprender electrónica básica y avanzada (Ley de Ohm, circuitos, leyes de Kirchhoff, etc.)
- Entender cómo reciclar y reutilizar componentes de aparatos electrónicos desechados
- Diseñar proyectos creativos con componentes recuperados
- Resolver dudas sobre código de colores, datasheets, multímetros, y herramientas
- Dar consejos de seguridad al trabajar con electrónica

Responde siempre en español, de forma clara, educativa y motivadora. Usa términos técnicos correctos pero explícalos de forma accesible. Cuando sea útil, da ejemplos prácticos y pasos concretos. Sé conciso pero completo. Puedes usar emojis ocasionalmente para hacer la respuesta más amigable.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json() as {
      messages: { role: string; content: string }[];
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${response.status}`, detail: errBody }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const reply = data?.content?.[0]?.text ?? "Lo siento, no pude generar una respuesta.";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
