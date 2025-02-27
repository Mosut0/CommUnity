require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.get('/users', async (req, res) => {
    const { data, error } = await supabase.from('users').select('*');
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
