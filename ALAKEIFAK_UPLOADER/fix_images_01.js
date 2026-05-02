const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const axios = require('axios'); // <-- This line is missing in your file!
// ==========================================
// CONFIGURATION
// ==========================================




const SUPABASE_URL = 'https://scoyqyidactgnejtnbhj.supabase.co'
// Use the SERVICE_ROLE_KEY to bypass Row Level Security (RLS) during backend seeding
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjb3lxeWlkYWN0Z25lanRuYmhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc4NjI1MiwiZXhwIjoyMDkyMzYyMjUyfQ.rn9xpbMTZoDT1IRQ9zbNKWjtKi_prAcPn2zoUCBcWeU'
const TARGET_RESTAURANT_ID = '56ade505-1094-4d4c-9819-61a8a57c086c'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const PEXELS_API_KEY = "Yef5vcnLcZ8rNfGXUIY73fBcDKcuCKu3z3oW3sbqdA9FWq8uDyYZ1pck"


// ==========================================
// G7AMEESH ARABIC TO ENGLISH KEYWORD DICTIONARY
// ==========================================

// ==========================================
// MOOD / NEW MENU ARABIC TO ENGLISH KEYWORD DICTIONARY
// ==========================================
const keywordMap = {
    // 🧆 Foul Sandwiches (ساندوتشات الفول)
    "ساندوتش فول": "mashed fava bean flatbread sandwich",
    "ساندوتش فول زيت حار": "fava bean sandwich with spicy oil",
    "ساندوتش فول سمنة بلدي": "fava bean sandwich melted ghee",
    "ساندوتش فول ليمون معصفر": "fava bean sandwich pickled lemon",
    "ساندوتش فول نعناع": "fava bean sandwich fresh mint",
    "ساندوتش فول اسكندراني": "alexandrian fava bean sandwich tomatoes tahini",
    "ساندوتش فول قشطة بلدي": "fava bean sandwich clotted cream",
    "ساندوتش فول سلطة": "fava bean sandwich fresh green salad",
    "ساندوتش فول زيت زيتون": "fava bean sandwich olive oil drizzle",
    "ساندوتش فول صلصة": "fava bean sandwich red tomato sauce",
    "ساندوتش فول سجق": "fava bean sandwich spicy oriental sausage",
    "ساندوتش مكس فول وطعمية": "fava bean and falafel mixed flatbread sandwich",
    "ساندوتش فول حمص": "fava bean and creamy hummus sandwich",
    "ساندوتش فول سوسيس اسكندراني": "fava bean and sliced hot dog sandwich",
    "ساندوتش فول بيض مسلوق": "fava bean sandwich boiled egg slices",
    "ساندوتش فول اومليت": "fava bean sandwich fluffy folded omelet",
    "ساندوتش فول بابا غنوج": "fava bean and roasted eggplant dip sandwich",
    "ساندوتش حمص": "creamy hummus flatbread sandwich",

    // 🧆 Taameya / Falafel Sandwiches (ساندوتشات الطعمية)
    "ساندوتش طعمية سلطة وطحينة": "falafel sandwich green salad tahini",
    "ساندوتش طعمية سبيشيال قرص": "large round falafel patty flatbread sandwich",
    "ساندوتش طعمية سبايسي": "spicy falafel sandwich hot sauce",
    "ساندوتش طعمية ليمون معصفر": "falafel sandwich pickled lemon",
    "ساندوتش طعمية نعناع": "falafel sandwich fresh mint leaves",
    "ساندوتش طعمية كيري": "falafel sandwich creamy kiri cheese",
    "ساندوتش طعمية مثلثات": "falafel sandwich melted triangle cheese",
    "ساندوتش F16": "massive sandwich falafel fries fried eggplant",
    "ساندوتش الصاروخ": "overstuffed traditional street food wrap",
    "ساندوتش ديناميت": "spicy loaded street food flatbread sandwich",
    "ساندوتش طعمية بيض مسلوق": "falafel sandwich sliced boiled eggs",
    "ساندوتش طعمية اومليت": "falafel sandwich yellow egg omelet",
    "ساندوتش طعمية فارم": "falafel and french fries flatbread sandwich",
    "ساندوتش طعمية باذنجان مقلي": "falafel and fried eggplant slices sandwich",
    "ساندوتش طعمية حمص": "falafel sandwich creamy hummus spread",
    "ساندوتش طعمية جبنه حادقة قديمة": "falafel sandwich sharp aged cheese",
    "ساندوتش طعمية رومي": "falafel sandwich melted salty cheese",
    "ساندوتش طعمية بابا غنوج": "falafel sandwich smoky eggplant dip",

    // 🍟 Farm / French Fries Sandwiches (ساندوتشات الفارم - بطاطس)
    "ساندوتش فارم توبل": "stuffed french fries flatbread sandwich",
    "ساندوتش فارم سلطة وطحينة": "french fries sandwich green salad tahini",
    "ساندوتش فارم كاتشب ومايونيز": "french fries sandwich ketchup mayonnaise",
    "ساندوتش فارم رومي": "french fries sandwich melted cheese pull",
    "ساندوتش فارم حمص": "french fries sandwich creamy hummus",
    "ساندوتش فارم حمص رومي": "french fries sandwich hummus melted cheese",
    "ساندوتش فارم اومليت": "french fries sandwich folded egg omelet",
    "ساندوتش فارم بيض مسلوق": "french fries sandwich boiled egg slices",
    "ساندوتش فارم حمص بيض مسلوق": "french fries sandwich hummus boiled eggs",
    "ساندوتش فارم ماكس جبن": "french fries sandwich heavy melted mixed cheese",
    "ساندوتش فارم جبنة مقلية": "french fries sandwich deep fried cheese blocks",
    "ساندوتش فارم كولسلو": "french fries sandwich creamy coleslaw",
    "ساندوتش فارم جبنة حادقة": "french fries sandwich sharp aged cheese",
    "ساندوتش فارم باذنجان": "french fries and fried eggplant sandwich",
    "ساندوتش فارم طعمية رومي": "french fries falafel melted cheese sandwich",

    // 🥔 Mashed Potatoes Sandwiches (ساندوتشات المهروسة)
    "ساندوتش بطاطس مهروسة": "creamy mashed potato flatbread sandwich",
    "ساندوتش بطاطس مهروسة بيض مسلوق": "mashed potato sandwich sliced boiled eggs",
    "ساندوتش بطاطس مهروسة اومليت": "mashed potato sandwich fluffy egg omelet",

    // 🧀 Cheese Sandwiches (ساندوتشات الجبن)
    "ساندوتش جبنة بالطماطم": "white feta cheese diced tomatoes sandwich",
    "ساندوتش جبنة زعتر وزيت زيتون": "white cheese sandwich thyme olive oil",
    "ساندوتش جبنة حادقة": "sharp spicy aged cheese flatbread sandwich",
    "ساندوتش جبنة مقلية": "fried crispy cheese flatbread sandwich",
    "ساندوتش رومي سخن": "hot melted salty cheese flatbread sandwich",
    "ساندوتش مكس جبن": "melted mixed cheddar mozzarella cheese sandwich",
    "ساندوتش رومي بسطرمة": "melted cheese and beef pastrami sandwich",

    // 🍆 Eggplant Sandwiches (ساندوتشات الباذنجان)
    "ساندوتش باذنجان مقلي": "savory fried eggplant slices sandwich",
    "ساندوتش مسقعه": "roasted eggplant in tomato sauce sandwich",
    "ساندوتش بابا غنوج": "creamy smoky roasted eggplant dip sandwich",

    // 🍳 Egg Sandwiches (ساندوتشات البيض)
    "ساندوتش بيض مسلوق": "sliced boiled eggs flatbread sandwich",
    "ساندوتش بيض اومليت": "fluffy yellow egg omelet flatbread sandwich",
    "ساندوتش اومليت فلفل وطماطم": "egg omelet colorful bell peppers tomatoes sandwich",
    "ساندوتش بيض حمص": "fried egg on creamy hummus sandwich",
    "ساندوتش بيض مكس جبن": "egg omelet heavy melted cheese sandwich",
    "ساندوتش بيض رومي": "egg omelet melted salty cheese sandwich",
    "ساندوتش بيض بالبسطرمة": "scrambled eggs with beef pastrami sandwich"
};

const genericKeywords = [
    "restaurant food plate", 
    "delicious meal", 
    "fresh drink glass"
];

const badDomains = [
    'unsplash.com', 'shutterstock.com', 'gettyimages', 'alamy',
    'istockphoto.com', 'coverr.co', 'freepik.com', 'freeimages.com',
    'pngtree.com', 'pxhere.com', 'talabat.com', 'pexels.com','pollinations.ai'
];

// ==========================================
// HELPER: FETCH IMAGE FROM PEXELS
// ==========================================
async function fetchImageFromPexels(itemName) {
    let query = keywordMap[itemName] || itemName;
    
    try {
        const response = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
            headers: { Authorization: PEXELS_API_KEY }
        });

        if (response.data.photos && response.data.photos.length > 0) {
            return response.data.photos[0].src.large; 
        } else {
            const randomGeneric = genericKeywords[Math.floor(Math.random() * genericKeywords.length)];
            const fallbackResponse = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(randomGeneric)}&per_page=1`, {
                headers: { Authorization: PEXELS_API_KEY }
            });
            return fallbackResponse.data.photos[0]?.src.large || null;
        }
    } catch (error) {
        console.error(`❌ Pexels API Error for "${itemName}":`, error.response?.data || error.message);
        return null;
    }
}

// ==========================================
// MAIN REPLACEMENT PROCESS
// ==========================================
async function fixBrokenImages() {
    console.log(`🔍 Scanning database for broken images for Restaurant ID: ${TARGET_RESTAURANT_ID}...`);

    // Generate the .or() query string dynamically
    const orQuery = badDomains.map(domain => `image_url.ilike.%${domain}%`).join(',');
    const fullQuery = `${orQuery},image_url.is.null`;

    // ---------------------------------------------------------
    // STEP 1: UPDATE EXTRAS (Directly linked to restaurant_id)
    // ---------------------------------------------------------
    console.log(`\n📂 Scanning table: EXTRAS...`);
    const { data: extrasRecords, error: extrasError } = await supabase
        .from('extras')
        .select('id, name, image_url')
        .eq('restaurant_id', TARGET_RESTAURANT_ID)
        .or(fullQuery);

    if (extrasError) {
        console.error(`❌ Error fetching extras:`, extrasError);
    } else {
        await processRecords('extras', extrasRecords);
    }

    // ---------------------------------------------------------
    // STEP 2: UPDATE ITEMS (Linked via subcategories -> categories)
    // ---------------------------------------------------------
    console.log(`\n📂 Scanning table: ITEMS...`);
    
    // 2a. Find all categories for this restaurant
    const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('restaurant_id', TARGET_RESTAURANT_ID);
    
    if (!categories || categories.length === 0) {
        console.log(`⚠️ No categories found for this restaurant.`);
        return;
    }
    const categoryIds = categories.map(c => c.id);

    // 2b. Find all subcategories for those categories
    const { data: subcategories } = await supabase
        .from('subcategories')
        .select('id')
        .in('category_id', categoryIds);

    if (!subcategories || subcategories.length === 0) {
        console.log(`⚠️ No subcategories found for this restaurant.`);
        return;
    }
    const subcategoryIds = subcategories.map(s => s.id);

    // 2c. Fetch the items belonging to those subcategories
    const { data: itemsRecords, error: itemsError } = await supabase
        .from('items')
        .select('id, name, image_url')
        .in('subcategory_id', subcategoryIds)
        .or(fullQuery);

    if (itemsError) {
        console.error(`❌ Error fetching items:`, itemsError);
    } else {
        await processRecords('items', itemsRecords);
    }

    console.log('\n🚀 Target restaurant fully processed and populated!');
}

// ==========================================
// HELPER: PROCESS AND UPDATE RECORDS
// ==========================================
async function processRecords(tableName, records) {
    if (!records || records.length === 0) {
        console.log(`✅ No broken or missing images found in ${tableName} for this restaurant!`);
        return;
    }

    console.log(`🛠️ Found ${records.length} items needing images in ${tableName}. Starting API fetch...`);
    let successCount = 0;

    for (const record of records) {
        console.log(`⏳ Processing: ${record.name}`);
        
        // Wait 1.5 seconds between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        const newImageUrl = await fetchImageFromPexels(record.name);

        if (newImageUrl) {
            const { error: updateError } = await supabase
                .from(tableName)
                .update({ image_url: newImageUrl })
                .eq('id', record.id);

            if (updateError) {
                console.error(`❌ Failed to update ${record.name} in ${tableName}:`, updateError);
            } else {
                console.log(`   ✅ Updated -> ${newImageUrl}`);
                successCount++;
            }
        } else {
            console.log(`   ⚠️ Could not find a suitable image for ${record.name}`);
        }
    }
    console.log(`🎉 Completed ${tableName}: Successfully updated ${successCount}/${records.length} images.`);
}

fixBrokenImages();