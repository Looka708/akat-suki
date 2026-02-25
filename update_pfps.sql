-- Fix User Profile Pictures (PFP) Migration
-- Run this in your Supabase SQL Editor to retroactively prepend the Discord CDN URL to existing hashes.

UPDATE users
SET avatar = 
    CASE 
        WHEN avatar IS NOT NULL AND avatar NOT LIKE 'http%' AND avatar LIKE 'a_%' THEN 'https://cdn.discordapp.com/avatars/' || id || '/' || avatar || '.gif'
        WHEN avatar IS NOT NULL AND avatar NOT LIKE 'http%' THEN 'https://cdn.discordapp.com/avatars/' || id || '/' || avatar || '.png'
        ELSE avatar
    END
WHERE avatar IS NOT NULL AND avatar NOT LIKE 'http%';
