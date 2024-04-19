import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xiyvcppoujqnbkmadmda.supabase.co'
const SUPABASE_API = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpeXZjcHBvdWpxbmJrbWFkbWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM1MzU3NTAsImV4cCI6MjAyOTExMTc1MH0.m6Wt_Pu5qkrd2_NhLePb_6MJwH-goz3ufG61bwWTZEY'



class Database{
    constructor(){
        this.supabase = createClient(SUPABASE_URL, SUPABASE_API);
    }
}