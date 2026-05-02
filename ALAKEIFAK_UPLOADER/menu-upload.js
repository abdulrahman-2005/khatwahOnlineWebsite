const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// ==========================================
// CONFIGURATION
// ==========================================




const SUPABASE_URL = 'https://scoyqyidactgnejtnbhj.supabase.co'
// Use the SERVICE_ROLE_KEY to bypass Row Level Security (RLS) during backend seeding
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjb3lxeWlkYWN0Z25lanRuYmhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc4NjI1MiwiZXhwIjoyMDkyMzYyMjUyfQ.rn9xpbMTZoDT1IRQ9zbNKWjtKi_prAcPn2zoUCBcWeU'
const RESTAURANT_ID = '56ade505-1094-4d4c-9819-61a8a57c086c'
const JSON_FILE_PATH = './yehya_menu.json';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// ==========================================
// ROBUST RETRY WRAPPER
// ==========================================
async function withRetry(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error; // Fail completely if max retries reached
            }
            console.warn(` Operation failed. Retrying attempt ${attempt} in ${attempt * 1000}ms...`);
            await new Promise(res => setTimeout(res, attempt * 1000));
        }
    }
}

// ==========================================
// MAIN UPLOAD PROCESS
// ==========================================
async function uploadMenu() {
    try {
        console.log('📂 Reading menu data...');
        const rawData = fs.readFileSync(JSON_FILE_PATH, 'utf8');
        const menuData = JSON.parse(rawData);

        // This map will store { "Subcategory Name": "Generated_UUID" } 
        // to dynamically fill the suggested_subcategories array in the extras table.
        const subcategoryMap = {};

        console.log('🚀 Starting database insertion...');

        // 1. Process Categories
        for (let c_idx = 0; c_idx < menuData.restaurant.categories.length; c_idx++) {
            const categoryData = menuData.restaurant.categories[c_idx];

            const { data: category, error: catError } = await withRetry(async () => {
                const res = await supabase.from('categories').insert({
                    restaurant_id: RESTAURANT_ID,
                    name: categoryData.name,
                    icon: categoryData.icon || null,
                    sort_order: categoryData.sort_order || c_idx
                }).select('id, name').single();
                if (res.error) throw res.error;
                return res;
            });

            console.log(`\n📁 Created Category: ${category.name}`);

            // 2. Process Subcategories
            if (!categoryData.subcategories) continue;

            for (let sc_idx = 0; sc_idx < categoryData.subcategories.length; sc_idx++) {
                const subcatData = categoryData.subcategories[sc_idx];

                const { data: subcategory, error: subcatError } = await withRetry(async () => {
                    const res = await supabase.from('subcategories').insert({
                        category_id: category.id,
                        name: subcatData.name,
                        sort_order: subcatData.sort_order || sc_idx
                    }).select('id, name').single();
                    if (res.error) throw res.error;
                    return res;
                });

                // Store the new UUID for mapping extras later
                subcategoryMap[subcategory.name] = subcategory.id;
                console.log(`  📂 Created Subcategory: ${subcategory.name}`);

                // 3. Process Items
                if (!subcatData.items) continue;

                for (let i_idx = 0; i_idx < subcatData.items.length; i_idx++) {
                    const itemData = subcatData.items[i_idx];

                    const { data: item, error: itemError } = await withRetry(async () => {
                        const res = await supabase.from('items').insert({
                            subcategory_id: subcategory.id,
                            name: itemData.name,
                            description: itemData.description || null,
                            ingredients: itemData.ingredients || null,
                            image_url: itemData.image_url || null,
                            is_available: itemData.is_available !== false,
                            sort_order: itemData.sort_order || i_idx
                        }).select('id, name').single();
                        if (res.error) throw res.error;
                        return res;
                    });

                    console.log(`    🍲 Created Item: ${item.name}`);

                    // 4. Process Item Sizes (Dimensional Pricing)
                    if (!itemData.item_sizes) continue;

                    for (let s_idx = 0; s_idx < itemData.item_sizes.length; s_idx++) {
                        const sizeData = itemData.item_sizes[s_idx];

                        await withRetry(async () => {
                            const res = await supabase.from('item_sizes').insert({
                                item_id: item.id,
                                name: sizeData.name,
                                price: sizeData.price,
                                sort_order: sizeData.sort_order || s_idx
                            });
                            if (res.error) throw res.error;
                            return res;
                        });
                    }
                }
            }
        }

        // 5. Process Extras with Smart Suggestion Mapping
        if (menuData.restaurant.extras && menuData.restaurant.extras.length > 0) {
            console.log('\n➕ Processing Extras and Smart Suggestions...');

            for (const extraData of menuData.restaurant.extras) {
                // Map the string names to the exact UUIDs generated in the database
                const mappedUuids = (extraData.suggested_subcategories || [])
                    .map(name => subcategoryMap[name])
                    .filter(uuid => uuid); // Filter out any undefined/mismatched names

                await withRetry(async () => {
                    const res = await supabase.from('extras').insert({
                        restaurant_id: RESTAURANT_ID,
                        name: extraData.name,
                        price: extraData.price,
                        is_available: extraData.is_available !== false,
                        image_url: extraData.image_url || null,
                        suggested_subcategories: mappedUuids // Injects the correctly mapped UUID array
                    });
                    if (res.error) throw res.error;
                    return res;
                });

                console.log(`  ✨ Created Extra: ${extraData.name} (Linked to ${mappedUuids.length} subcategories)`);
            }
        }

        console.log('\n✅ Menu uploaded and normalized successfully!');

    } catch (error) {
        console.error('\n❌ Fatal Error during upload process:', error.message || error);
        process.exit(1);
    }
}

// Execute the script
uploadMenu();