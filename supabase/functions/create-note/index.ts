import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL validation regex patterns
const URL_PATTERN = /^\/mock-(audio|photo)-\d+(-\d+)?\.(mp3|jpg)$/;
const MAX_PHOTOS = 10;

interface CreateNoteRequest {
  contact_id: string | null;
  conference_id?: string | null;
  audio_url: string;
  photo_urls: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body: CreateNoteRequest = await req.json();

    // Validate audio_url
    if (!body.audio_url || typeof body.audio_url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'audio_url is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!URL_PATTERN.test(body.audio_url)) {
      return new Response(
        JSON.stringify({ error: 'Invalid audio_url format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate photo_urls
    if (!Array.isArray(body.photo_urls)) {
      return new Response(
        JSON.stringify({ error: 'photo_urls must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.photo_urls.length > MAX_PHOTOS) {
      return new Response(
        JSON.stringify({ error: `Maximum ${MAX_PHOTOS} photos allowed` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    for (const url of body.photo_urls) {
      if (typeof url !== 'string' || !URL_PATTERN.test(url)) {
        return new Response(
          JSON.stringify({ error: 'Invalid photo_url format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate contact_id if provided
    if (body.contact_id !== null) {
      if (typeof body.contact_id !== 'string') {
        return new Response(
          JSON.stringify({ error: 'contact_id must be a string or null' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify contact belongs to user
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('id')
        .eq('id', body.contact_id)
        .eq('user_id', user.id)
        .single();

      if (contactError || !contact) {
        console.error('Contact validation error:', contactError);
        return new Response(
          JSON.stringify({ error: 'Invalid contact_id or contact does not belong to user' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate conference_id if provided
    if (body.conference_id) {
      if (typeof body.conference_id !== 'string') {
        return new Response(
          JSON.stringify({ error: 'conference_id must be a string UUID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const { data: conf, error: confError } = await supabase
        .from('conferences')
        .select('id')
        .eq('id', body.conference_id)
        .eq('owner_user_id', user.id)
        .single();
      if (confError || !conf) {
        return new Response(
          JSON.stringify({ error: 'Invalid conference_id or access denied' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Prepare tags (annotate with conference if provided)
    const tags: string[] = [];
    if (body.conference_id) tags.push(`conference:${body.conference_id}`);

    // Create note in database
    const { data: note, error: insertError } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        contact_id: body.contact_id,
        audio_url: body.audio_url,
        photo_urls: body.photo_urls,
        tags,
        status: 'processing',
        transcript: 'Processing...',
        summary: ['Processing audio...'],
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create note' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Note created successfully:', note.id);
    return new Response(
      JSON.stringify({ note }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-note function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
