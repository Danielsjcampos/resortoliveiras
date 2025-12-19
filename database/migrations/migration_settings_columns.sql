-- Add new columns for menu customization to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS menu_item_spacing INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS menu_button_padding INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS menu_border_radius INTEGER DEFAULT 16,
ADD COLUMN IF NOT EXISTS menu_columns INTEGER DEFAULT 2;
