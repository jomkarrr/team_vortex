// PensionSaarthi — Edge Function: pincode lookup (DRAFT, not deployed yet)
// Purpose: pincode -> district/state + post offices, via the free Postal Pincode API.
// Deploy ONLY after the shared Supabase project exists:
//   supabase functions deploy pincode
// Until then the frontend keeps its manual state/district dropdown fallback.
// This function needs NO secret key (Postal Pincode API is free, no key).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { pincode } = await req.json();
    if (!/^\d{6}$/.test(String(pincode || ""))) {
      return Response.json(
        { ok: false, error: "Enter a valid 6-digit pincode." },
        { headers: corsHeaders },
      );
    }
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const json = await res.json();
    const first = json?.[0];
    if (first?.Status !== "Success" || !first?.PostOffice?.length) {
      return Response.json(
        { ok: false, error: "No post office found for this pincode." },
        { headers: corsHeaders },
      );
    }
    const po = first.PostOffice[0];
    return Response.json(
      {
        ok: true,
        data: {
          pincode: String(pincode),
          district: po.District,
          state: po.State,
          postOffices: first.PostOffice.map((p: { Name: string }) => p.Name),
        },
      },
      { headers: corsHeaders },
    );
  } catch {
    return Response.json(
      { ok: false, error: "Pincode lookup is unavailable right now. Please select your district manually." },
      { headers: corsHeaders },
    );
  }
});
