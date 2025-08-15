/*
  # Fix profiles section constraint

  1. Changes
    - Update section constraint to use numeric values (1, 2, 3, 4) instead of letters
    - This matches the application's usage of numeric sections
*/

-- Drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_section_check;

-- Add the correct constraint for numeric sections
ALTER TABLE profiles ADD CONSTRAINT profiles_section_check 
  CHECK (section IS NULL OR section IN ('1', '2', '3', '4'));