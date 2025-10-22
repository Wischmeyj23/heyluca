import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema for extracted business card data
const extractedDataSchema = z.object({
  name: z.string().trim().max(100, "Name must be less than 100 characters").optional(),
  company: z.string().trim().max(100, "Company must be less than 100 characters").optional(),
  email: z.string().trim().email("Invalid email").max(255, "Email must be less than 255 characters").optional().or(z.literal("")),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").regex(/^[0-9\s\-\+\(\)]*$/, "Invalid phone format").optional().or(z.literal("")),
}).strict();

const requestSchema = z.object({
  card_id: z.string().uuid("Invalid card ID"),
  extracted: extractedDataSchema.optional(),
  ocr_text: z.string().max(5000, "OCR text too long").optional(),
  linkedin_guess: z.string().url("Invalid LinkedIn URL").max(500).optional().or(z.literal("")),
});

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request
    const body = await req.json();
    console.log('Processing card request:', { card_id: body.card_id, user_id: user.id });
    
    const validatedData = requestSchema.parse(body);

    // Verify card ownership
    const { data: card, error: fetchError } = await supabase
      .from('business_cards')
      .select('*')
      .eq('id', validatedData.card_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !card) {
      console.error('Card not found or unauthorized:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Card not found or unauthorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update card with validated data
    const updateData: any = {
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (validatedData.extracted) {
      updateData.extracted = validatedData.extracted;
    }

    if (validatedData.ocr_text) {
      updateData.ocr_text = validatedData.ocr_text;
    }

    if (validatedData.linkedin_guess) {
      updateData.linkedin_guess = validatedData.linkedin_guess;
    }

    const { data: updatedCard, error: updateError } = await supabase
      .from('business_cards')
      .update(updateData)
      .eq('id', validatedData.card_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update card' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Card processed successfully:', updatedCard.id);

    return new Response(
      JSON.stringify({ card: updatedCard }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing card:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
