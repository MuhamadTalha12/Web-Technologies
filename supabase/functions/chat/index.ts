import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, services } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about available services
    let servicesContext = "";
    if (services && services.length > 0) {
      servicesContext = `\n\nAvailable services on our platform:\n${services.map((s: any) => 
        `- ${s.title} (${s.category}): $${s.price} - ${s.description.substring(0, 100)}...`
      ).join('\n')}`;
    }

    const systemPrompt = `You are a helpful assistant for LocalConnect, a service marketplace platform that connects customers with local service providers.

Your role is to:
1. Help users find the right services for their needs
2. Answer questions about how the platform works
3. Provide information about service categories (web development, mobile development, UI/UX design, graphic design, digital marketing, content writing, video editing, photography, consulting)
4. Explain the booking process
5. Give tips on choosing the right service provider

Platform features:
- Users can browse and book services from verified providers
- Providers can list their services with pricing and descriptions
- Rating and review system for quality assurance
- Secure booking system
- Categories include: Web Development, Mobile Development, UI/UX Design, Graphic Design, Digital Marketing, Content Writing, Video Editing, Photography, Consulting
${servicesContext}

Be friendly, helpful, and concise. If asked about specific services, refer to the available services listed above.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
