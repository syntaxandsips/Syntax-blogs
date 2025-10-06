import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SubscribePayload = {
  email?: string;
  source?: string;
  metadata?: Record<string, unknown> | null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  let body: SubscribePayload;

  try {
    body = (await req.json()) as SubscribePayload;
  } catch (_error) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const email = body.email?.trim().toLowerCase();

  if (!email || !EMAIL_REGEX.test(email)) {
    return new Response(
      JSON.stringify({ error: "Please provide a valid email address." }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Supabase credentials are not configured." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const metadata = body.metadata ?? {};
  const source = body.source?.slice(0, 120) ?? null;

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      {
        email,
        source,
        unsubscribed_at: null,
        metadata,
      },
      {
        onConflict: "newsletter_subscribers_email_idx",
        ignoreDuplicates: false,
      },
    )
    .select("id, email, subscribed_at")
    .single();

  if (error) {
    const status = error.code === "23505" ? 200 : 500;

    if (status === 200) {
      return new Response(
        JSON.stringify({
          message: "You are already subscribed!",
          email,
        }),
        {
          status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.error("Newsletter subscribe error", error);
    return new Response(
      JSON.stringify({ error: "Unable to subscribe at this time." }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({
      message: "Successfully subscribed",
      email: data?.email ?? email,
      subscribedAt: data?.subscribed_at ?? new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
});
