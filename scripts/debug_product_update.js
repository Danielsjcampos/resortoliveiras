
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials in environment variables.");
  console.log("VITE_SUPABASE_URL:", supabaseUrl);
  console.log("VITE_SUPABASE_ANON_KEY:", !!supabaseKey); // Don't log the key
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProducts() {
  console.log("--- Starting Product Update Debug (JS) ---");

  // 1. List one product
  const { data: products, error: listError } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (listError) {
    console.error("Error listing products:", listError);
    return;
  }

  if (!products || products.length === 0) {
    console.log("No products found to test.");
    return;
  }

  const product = products[0];
  console.log("Target Product:", product.id, product.name);
  console.log("Original Data:", product);

  // 2. Try to Update
  const originalName = product.name;
  const newName = originalName + " (UPDATED)";
  
  console.log(`Attempting to rename to: '${newName}'...`);

  const { data: updatedData, error: updateError, count } = await supabase
    .from('products')
    .update({ name: newName })
    .eq('id', product.id)
    .select();

  if (updateError) {
    console.error("!!! Update Failed with Error !!!");
    console.error(updateError);
  } else {
    console.log("Update call success.");
    console.log("Returned Data:", updatedData);
    
    if (!updatedData || updatedData.length === 0) {
        console.warn("WARNING: Update returned 0 rows. Likely RLS blocking update.");
    }
  }

  // 3. Verify Persistence
  console.log("Verifying persistence by fetching again...");
  const { data: verifyData } = await supabase
    .from('products')
    .select('*')
    .eq('id', product.id)
    .single();
    
  if (verifyData) {
      console.log("Refetched Name:", verifyData.name);
      if (verifyData.name === newName) {
          console.log("SUCCESS: Change persisted.");
          
          // Revert
          console.log("Reverting changes...");
          await supabase.from('products').update({ name: originalName }).eq('id', product.id);
          console.log("Reverted.");
      } else {
          console.error("FAILURE: Change DID NOT persist. Name is still:", verifyData.name);
      }
  }
}

debugProducts();
