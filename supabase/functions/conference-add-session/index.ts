import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sessionSchema = z.object({
  conference_id: z.string().uuid("Invalid conference ID"),
  contact_id: z.string().uuid("Invalid contact ID").optional(),
  meeting_id: z.string().uuid("Invalid meeting ID").optional(),
  title: z.string().trim().max(200).optional(),
  started_at: z.string().datetime().optional(),
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
    const validation = sessionSchema.safeParse(body);

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

    const sessionData = validation.data;

    // Verify conference ownership
    const { data: conference, error: confError } = await supabase
      .from('conferences')
      .select('id')
      .eq('id', sessionData.conference_id)
      .eq('owner_user_id', user.id)
      .single();

    if (confError || !conference) {
      return new Response(
        JSON.stringify({ error: 'Conference not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify contact ownership if provided
    if (sessionData.contact_id) {
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('id')
        .eq('id', sessionData.contact_id)
        .eq('user_id', user.id)
        .single();

      if (contactError || !contact) {
        return new Response(
          JSON.stringify({ error: 'Contact not found or access denied' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Verify meeting ownership if provided
    if (sessionData.meeting_id) {
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('id')
        .eq('id', sessionData.meeting_id)
        .eq('owner_user_id', user.id)
        .single();

      if (meetingError || !meeting) {
        return new Response(
          JSON.stringify({ error: 'Meeting not found or access denied' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create conference session
    const { data: session, error: sessionError } = await supabase
      .from('conference_sessions')
      .insert({
        conference_id: sessionData.conference_id,
        contact_id: sessionData.contact_id || null,
        meeting_id: sessionData.meeting_id || null,
        title: sessionData.title || null,
        started_at: sessionData.started_at || new Date().toISOString(),
        owner_user_id: user.id,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      throw sessionError;
    }

    console.log('Conference session created successfully:', session.id);

    return new Response(
      JSON.stringify({ session }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in conference-add-session function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
