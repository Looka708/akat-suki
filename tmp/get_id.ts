import { supabaseAdmin } from 'c:/Users/umern/OneDrive/Desktop/akat-suki/lib/supabase-admin.ts';

async function getFirstTournament() {
    const { data, error } = await supabaseAdmin
        .from('tournaments')
        .select('id, name')
        .limit(1)
        .single();

    if (error) {
        console.error(error);
        return;
    }
    console.log(`TOURNAMENT_ID_START:${data.id}:TOURNAMENT_ID_END`);
    console.log(`TOURNAMENT_NAME:${data.name}`);
}

getFirstTournament();
