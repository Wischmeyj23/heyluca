import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema matching client-side schema
const noteUpdateSchema = z.object({
  note_id: z.string().uuid({ message: "Invalid note ID format" }),
  transcript: z
    .string()
    .max(50000, { message: "Transcript must be less than 50,000 characters" })
    .optional(),
  summary: z
    .array(z.string().max(500, { message: "Summary item must be less than 500 characters" }))
    .max(10, { message: "Maximum 10 summary items allowed" })
    .optional(),
  next_step: z
    .string()
    .max(500, { message: "Next step must be less than 500 characters" })
    .optional(),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, { message: "Tag cannot be empty" })
        .max(50, { message: "Tag must be less than 50 characters" })
    )
    .max(20, { message: "Maximum 20 tags allowed" })
    .optional(),
  status: z
    .enum(["draft", "processing", "ready", "error"], {
      errorMap: () => ({ message: "Invalid status value" }),
    })
    .optional(),
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with user's auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Authentication error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('Processing note update for user:', user.id);

    // Parse and validate request body
    const body = await req.json();
    const validation = noteUpdateSchema.safeParse(body);

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
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { note_id, ...updateData } = validation.data;

    // Verify note ownership
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('id, user_id, status')
      .eq('id', note_id)
      .single();

    if (noteError || !note) {
      console.error('Note not found:', noteError);
      return new Response(
        JSON.stringify({ error: 'Note not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (note.user_id !== user.id) {
      console.error('Unauthorized access attempt for note:', note_id);
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to note' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate status transition
    if (updateData.status) {
      const validTransitions: Record<string, string[]> = {
        draft: ['processing', 'error'],
        processing: ['ready', 'error'],
        ready: ['processing', 'error'],
        error: ['processing', 'draft'],
      };

      const allowedStatuses = validTransitions[note.status] || [];
      if (!allowedStatuses.includes(updateData.status)) {
        console.error(
          `Invalid status transition from ${note.status} to ${updateData.status}`
        );
        return new Response(
          JSON.stringify({
            error: `Cannot transition from ${note.status} to ${updateData.status}`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Update note with validated data
    const { data: updatedNote, error: updateError } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', note_id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    console.log('Note updated successfully:', note_id);

    return new Response(
      JSON.stringify({ note: updatedNote }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in process-note function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
