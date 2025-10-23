import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const companySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Company name is required").max(100),
  domain: z.string().trim().max(100).optional().or(z.literal("")),
  website_url: z.string().trim().url("Invalid URL").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(20).regex(/^[0-9\s\-\+\(\)]*$/).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  industry: z.string().trim().max(100).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url().refine(
    (url) => !url || url.includes("linkedin.com"),
    "Must be a LinkedIn URL"
  ).optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

function normalizeDomain(domain: string): string {
  let normalized = domain.toLowerCase().trim();
  // Remove protocol
  normalized = normalized.replace(/^https?:\/\//, '');
  // Remove www.
  normalized = normalized.replace(/^www\./, '');
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  // Extract just domain if full URL provided
  const match = normalized.match(/^([^\/]+)/);
  return match ? match[1] : normalized;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      throw new Error('Unauthorized');
    }

    // Parse and validate request
    const body = await req.json();
    const validation = companySchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation errors:', validation.error.errors);
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validation.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const companyData = validation.data;
    
    // Normalize domain if provided
    let normalizedDomain: string | null = null;
    if (companyData.domain) {
      normalizedDomain = normalizeDomain(companyData.domain);
      console.log('Normalized domain:', normalizedDomain);

      // Check for duplicate domain (only for new companies)
      if (!companyData.id) {
        const { data: existingDomain } = await supabase
          .from('company_domains')
          .select('company_id')
          .eq('domain', normalizedDomain)
          .eq('owner_user_id', user.id)
          .single();

        if (existingDomain) {
          return new Response(
            JSON.stringify({ 
              error: 'A company with this domain already exists',
              existing_company_id: existingDomain.company_id 
            }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Upsert company
    const companyPayload = {
      ...(companyData.id ? { id: companyData.id } : {}),
      owner_user_id: user.id,
      name: companyData.name,
      domain: normalizedDomain,
      website_url: companyData.website_url || null,
      phone: companyData.phone || null,
      city: companyData.city || null,
      state: companyData.state || null,
      country: companyData.country || null,
      industry: companyData.industry || null,
      linkedin_url: companyData.linkedin_url || null,
      notes: companyData.notes || null,
    };

    const { data: company, error: upsertError } = await supabase
      .from('companies')
      .upsert(companyPayload)
      .select()
      .single();

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      throw upsertError;
    }

    // Create or update company_domains entry if domain provided
    if (normalizedDomain) {
      const { error: domainError } = await supabase
        .from('company_domains')
        .upsert({
          company_id: company.id,
          domain: normalizedDomain,
          owner_user_id: user.id,
        }, {
          onConflict: 'company_id,domain'
        });

      if (domainError) {
        console.error('Error upserting company domain:', domainError);
      }
    }

    console.log('Company upserted successfully:', company.id);

    return new Response(
      JSON.stringify({ company }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in company-upsert function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
