import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Free email domains that should not trigger company auto-linking
const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
  'aol.com', 'protonmail.com', 'mail.com', 'zoho.com', 'yandex.com',
  'gmx.com', 'inbox.com', 'live.com', 'msn.com', 'me.com'
];

const contactSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().trim().min(1, "Name is required").max(100),
  company: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(20).regex(/^[0-9\s\-\+\(\)]*$/).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url().refine(
    (url) => !url || url.includes("linkedin.com"),
    "Must be a LinkedIn URL"
  ).optional().or(z.literal("")),
  avatar_url: z.string().trim().url().optional().or(z.literal("")),
  title: z.string().trim().max(100).optional().or(z.literal("")),
});

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
    const validation = contactSchema.safeParse(body);

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

    const contactData = validation.data;
    let company_id: string | null = null;

    // Auto-link to company based on email domain
    if (contactData.email && contactData.email.includes('@')) {
      const emailDomain = contactData.email.split('@')[1].toLowerCase();
      
      if (!FREE_EMAIL_DOMAINS.includes(emailDomain)) {
        console.log('Attempting to link contact to company with domain:', emailDomain);
        
        // Check if company already exists with this domain
        const { data: existingDomain } = await supabase
          .from('company_domains')
          .select('company_id')
          .eq('domain', emailDomain)
          .eq('owner_user_id', user.id)
          .single();

        if (existingDomain) {
          company_id = existingDomain.company_id;
          console.log('Found existing company:', company_id);
        } else {
          // Create new company from domain
          const companyName = contactData.company || emailDomain.split('.')[0];
          const { data: newCompany, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: companyName,
              domain: emailDomain,
              owner_user_id: user.id,
            })
            .select()
            .single();

          if (!companyError && newCompany) {
            company_id = newCompany.id;
            console.log('Created new company:', company_id);

            // Create company_domain entry
            await supabase.from('company_domains').insert({
              company_id: company_id,
              domain: emailDomain,
              owner_user_id: user.id,
            });
          } else {
            console.error('Error creating company:', companyError);
          }
        }
      }
    }

    // Upsert contact
    const contactPayload = {
      ...(contactData.id ? { id: contactData.id } : {}),
      user_id: user.id,
      full_name: contactData.full_name,
      company: contactData.company || null,
      email: contactData.email || null,
      phone: contactData.phone || null,
      linkedin_url: contactData.linkedin_url || null,
      avatar_url: contactData.avatar_url || null,
      title: contactData.title || null,
      company_id: company_id,
    };

    const { data: contact, error: upsertError } = await supabase
      .from('contacts')
      .upsert(contactPayload)
      .select()
      .single();

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      throw upsertError;
    }

    console.log('Contact upserted successfully:', contact.id);

    return new Response(
      JSON.stringify({ contact }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in contact-upsert function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
