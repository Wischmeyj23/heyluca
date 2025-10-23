import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const recapSchema = z.object({
  conference_id: z.string().uuid("Invalid conference ID"),
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
    const validation = recapSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validation.error.errors,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { conference_id } = validation.data;

    // Fetch conference details
    const { data: conference, error: confError } = await supabase
      .from('conferences')
      .select('*')
      .eq('id', conference_id)
      .eq('owner_user_id', user.id)
      .single();

    if (confError || !conference) {
      return new Response(
        JSON.stringify({ error: 'Conference not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all sessions with related data
    const { data: sessions, error: sessionsError } = await supabase
      .from('conference_sessions')
      .select(`
        *,
        contact:contacts(*),
        meeting:meetings(*)
      `)
      .eq('conference_id', conference_id)
      .eq('owner_user_id', user.id)
      .order('started_at', { ascending: true });

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      throw sessionsError;
    }

    // Generate recap content (plain text for now, can be enhanced to .docx)
    let recapContent = `CONFERENCE RECAP: ${conference.name}\n`;
    recapContent += `Location: ${conference.location || 'N/A'}\n`;
    recapContent += `Dates: ${conference.start_date || 'N/A'} - ${conference.end_date || 'N/A'}\n\n`;
    recapContent += `Total Sessions: ${sessions?.length || 0}\n\n`;
    recapContent += `SESSIONS:\n\n`;

    if (sessions && sessions.length > 0) {
      sessions.forEach((session: any, index: number) => {
        recapContent += `${index + 1}. ${session.title || 'Untitled Session'}\n`;
        recapContent += `   Date: ${new Date(session.started_at).toLocaleString()}\n`;
        
        if (session.contact) {
          recapContent += `   Contact: ${session.contact.full_name}`;
          if (session.contact.company) {
            recapContent += ` (${session.contact.company})`;
          }
          recapContent += `\n`;
        }
        
        if (session.meeting?.summary) {
          recapContent += `   Summary: ${session.meeting.summary}\n`;
        }
        
        recapContent += `\n`;
      });
    } else {
      recapContent += `No sessions recorded.\n`;
    }

    if (conference.notes) {
      recapContent += `\nNOTES:\n${conference.notes}\n`;
    }

    // Create a simple text file (can be enhanced to .docx using docx library)
    const fileName = `conference-recap-${conference_id}-${Date.now()}.txt`;
    const filePath = `${user.id}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('conference_recaps')
      .upload(filePath, new Blob([recapContent], { type: 'text/plain' }), {
        contentType: 'text/plain',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Create conference_recaps entry
    const { data: recap, error: recapError } = await supabase
      .from('conference_recaps')
      .insert({
        conference_id: conference_id,
        storage_path: filePath,
        owner_user_id: user.id,
      })
      .select()
      .single();

    if (recapError) {
      console.error('Error creating recap entry:', recapError);
      throw recapError;
    }

    // Get signed URL (valid for 1 hour)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('conference_recaps')
      .createSignedUrl(filePath, 3600);

    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      throw urlError;
    }

    console.log('Conference recap generated successfully:', recap.id);

    return new Response(
      JSON.stringify({ 
        recap,
        download_url: signedUrlData.signedUrl,
        expires_in: 3600,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in conference-recap function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
