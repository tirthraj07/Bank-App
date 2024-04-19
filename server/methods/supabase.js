//import { createClient } from '@supabase/supabase-js';
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xiyvcppoujqnbkmadmda.supabase.co'
const SUPABASE_API = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpeXZjcHBvdWpxbmJrbWFkbWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM1MzU3NTAsImV4cCI6MjAyOTExMTc1MH0.m6Wt_Pu5qkrd2_NhLePb_6MJwH-goz3ufG61bwWTZEY'



class SupabaseDB{
    constructor(){
        this.supabase = createClient(SUPABASE_URL, SUPABASE_API);
        // console.log("Database Created");
        // console.log(this.supabase);
    }

    async query(table,column,info){
        try{
            const { data, error } = await this.supabase
                .from(`${table}`)
                .select('*')
                .eq(`${column}`,`${info}`);

            if(error) throw new Error(error.message);
            return {success: true, result: data}
        }
        catch(error){
            return {success: false, reason: error.message}
        }

    }

}

module.exports = SupabaseDB