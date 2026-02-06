import { createClient } from "npm:@blinkdotnew/sdk@2.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) throw new Error("URL is required");

    const projectId = Deno.env.get("BLINK_PROJECT_ID");
    const secretKey = Deno.env.get("BLINK_SECRET_KEY");

    if (!projectId || !secretKey) {
      throw new Error("Missing configuration");
    }

    const blink = createClient({ projectId, secretKey });

    const response = await fetch(url);
    const html = await response.text();
    const truncatedHtml = html.substring(0, 15000);

    const extractedData = await blink.ai.generateObject({
      schema: {
        projects: [
          {
            title: "string",
            description: "string",
            category: "string",
            imageUrl: "string",
            demoUrl: "string"
          }
        ]
      },
      prompt: `Extract up to 5 portfolio projects from this HTML content: ${truncatedHtml}. 
      Return project titles, descriptions, categories, and image URLs. 
      The source is likely a portfolio site like Behance or Dribbble.`
    });

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
}

Deno.serve(handler);