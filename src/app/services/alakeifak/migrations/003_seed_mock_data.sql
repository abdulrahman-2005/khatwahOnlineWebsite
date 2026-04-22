-- ============================================
-- alakeifak: Premium Mock Data Seeder (Extended Version)
-- Run this in Supabase SQL Editor
-- WARNING: This will append to your FIRST restaurant.
-- ============================================

DO $$
DECLARE
    v_res_id UUID;
    
    -- Category IDs
    v_cat_meals UUID := gen_random_uuid();
    v_cat_drinks UUID := gen_random_uuid();
    v_cat_desserts UUID := gen_random_uuid();

    -- Subcategory IDs
    v_sub_pizza UUID := gen_random_uuid();
    v_sub_burger UUID := gen_random_uuid();
    v_sub_pasta UUID := gen_random_uuid();
    v_sub_cold_drinks UUID := gen_random_uuid();
    v_sub_hot_drinks UUID := gen_random_uuid();
    v_sub_sweets UUID := gen_random_uuid();

    -- Item IDs (Meals)
    v_item_margherita UUID := gen_random_uuid();
    v_item_pepperoni UUID := gen_random_uuid();
    v_item_bbq_pizza UUID := gen_random_uuid();
    
    v_item_smash UUID := gen_random_uuid();
    v_item_chicken UUID := gen_random_uuid();
    v_item_mushroom UUID := gen_random_uuid();
    
    v_item_alfredo UUID := gen_random_uuid();
    v_item_bechamel UUID := gen_random_uuid();

    -- Item IDs (Drinks)
    v_item_mojito UUID := gen_random_uuid();
    v_item_cola UUID := gen_random_uuid();
    v_item_latte UUID := gen_random_uuid();
    v_item_espresso UUID := gen_random_uuid();

    -- Item IDs (Desserts)
    v_item_crepe UUID := gen_random_uuid();
    v_item_cheesecake UUID := gen_random_uuid();
    v_item_brownie UUID := gen_random_uuid();

BEGIN
    -- 1. Grab the first available restaurant
    SELECT id INTO v_res_id FROM restaurants LIMIT 1;
    
    IF v_res_id IS NULL THEN
        RAISE EXCEPTION 'No restaurant found. Please create one from the Owner Dashboard first!';
    END IF;

    -- 2. Insert Main Categories
    INSERT INTO categories (id, restaurant_id, name, icon, sort_order) VALUES
    (v_cat_meals, v_res_id, 'الوجبات الرئيسية', '🍽️', 1),
    (v_cat_desserts, v_res_id, 'الحلويات والمخبوزات', '🍰', 2),
    (v_cat_drinks, v_res_id, 'مشروبات القهوة والبارد', '🥤', 3);

    -- 3. Insert Subcategories inside those Categories
    INSERT INTO subcategories (id, category_id, name, sort_order) VALUES
    (v_sub_pizza, v_cat_meals, 'بيتزا إيطالية', 1),
    (v_sub_burger, v_cat_meals, 'برجر فاخر', 2),
    (v_sub_pasta, v_cat_meals, 'طواجن ومكرونات', 3),
    
    (v_sub_sweets, v_cat_desserts, 'وافل وكريب', 1),
    
    (v_sub_cold_drinks, v_cat_drinks, 'موهيتو وصودا', 1),
    (v_sub_hot_drinks, v_cat_drinks, 'قهوة مختصة', 2);

    -- 4. Insert Items
    INSERT INTO items (id, subcategory_id, name, description, ingredients, image_url, sort_order) VALUES
    -- PIZZAS
    (v_item_margherita, v_sub_pizza, 'بيتزا مارجريتا', 'عجينة نابولي الرقيقة مع صوص الطماطم الإيطالي وأوراق الريحان الطازجة والموزاريلا', 
     'عجينة أصلية، صوص طماطم كلاسيكي، موتزاريلا فريش، ريحان، زيت زيتون بكر', 
     'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop', 1),

    (v_item_pepperoni, v_sub_pizza, 'بيتزا بيبروني سبايسي', 'لعشاق اللحوم. مغطاة بطبقة غنية من البيبروني البقري الفاخر وزيت التروفل.', 
     'بيبروني حلال، ميكس جبن، صوص حار', 
     'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop', 2),

    (v_item_bbq_pizza, v_sub_pizza, 'بيتزا تشيكن باربكيو', 'قطع دجاج مشوية مدخنة بصوص الباربكيو مع البصل المكرمل وجبنة الموتزاريلا الذائبة.', 
     'دجاج مشوي، صوص باربكيو، بصل مكرمل، جبن شيدر وموزاريلا', 
     'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop', 3),

    -- BURGERS
    (v_item_smash, v_sub_burger, 'سماش برجر دبل', 'شريحتين من لحم الأنجوس המكدس مع صوص سرّي والخس الأمريكي.', 
     'لحم أنجوس، جبن شيدر ذائب، صوص السماش، خبز بريوش ناعم', 
     'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop', 1),

    (v_item_chicken, v_sub_burger, 'كرسبي تشيكن فيليه', 'صدر دجاج مقرمش مع كولسلو الغرقان بصوص الرانش.', 
     'صدر دجاج كرسبي، كولسلو، صوص رانش، شيدر', 
     'https://images.unsplash.com/photo-1615719417381-12baee9cc51d?q=80&w=800&auto=format&fit=crop', 2),

    (v_item_mushroom, v_sub_burger, 'مشروم سويس برجر', 'شريحة لحم سميكة مغطاة بصوص المشروم الدسم والجبنة السويسرية البيضاء.', 
     'لحم بقري، جبنة سويسرية، صوص مشروم، بصل مشوي', 
     'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop', 3),

    -- PASTA
    (v_item_alfredo, v_sub_pasta, 'فيتوتشيني ألفريدو', 'مكرونة الفيتوتشيني الإيطالية غارقة في كريمة غنية مع قطع المشروم والدجاج الكرسبي.', 
     'مكرونة فيتوتشيني، صوص كريمة، بارميزان، مشروم، دجاج', 
     'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=800&auto=format&fit=crop', 1),

    (v_item_bechamel, v_sub_pasta, 'طاجن مكرونة بشاميل', 'طبقات من المكرونة واللحم המفروم بتتبيلة الجدة مع صوص بشاميل غني ومحمر بالفرن.', 
     'لحم مفروم معصج، صوص بشاميل مخفوق، جبن جودا ميكس', 
     'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=800&auto=format&fit=crop', 2),

    -- DRINKS
    (v_item_mojito, v_sub_cold_drinks, 'موهيتو فراولة', 'مشروب الصيف المنعش مع قطع الفراولة الطازجة والنعناع والثلج المجروش.', 
     'فراولة، ليمون، نعناع، صودا', 
     'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800&auto=format&fit=crop', 1),

    (v_item_cola, v_sub_cold_drinks, 'كوكاكولا باردة', 'مشروب غازي مثلج للترطيب.', 
     'مشروب غازي', 
     'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop', 2),

    (v_item_latte, v_sub_hot_drinks, 'لاتيه إسباني (سبانيش)', 'قهوة الاسبريسو الغنية مع مزيج من الحليب المكثف المحلى لصنع التوازن المثالي.', 
     'اسبريسو مزدوج، حليب، حليب مكثف', 
     'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop', 1),

    (v_item_espresso, v_sub_hot_drinks, 'قهوة إسبريسو دوبيو', 'جرعة قوية من البن الكولومبي المحمص بعناية.', 
     'بن عربي وكولومبي', 
     'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=800&auto=format&fit=crop', 2),

    -- DESSERTS
    (v_item_crepe, v_sub_sweets, 'كريب لوتس وشوكولاته', 'طبقات من الكريب المحشو بكريمة اللوتس ومغطى بصوص الشوكولاتة البلجيكية.', 
     'زبدة لوتس، نوتيلا، بندق مقرمش', 
     'https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=800&auto=format&fit=crop', 1),

    (v_item_cheesecake, v_sub_sweets, 'تشيز كيك التوت البري', 'شريحة من التشيز كيك النيويوركي الغني مخبوز على طبقة من البسكويت بالزبدة.', 
     'كريمة جبن، بسكويت دايجستيف، صوص توت بيري', 
     'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop', 2),

    (v_item_brownie, v_sub_sweets, 'فرينش براونيز متفجر', 'قطعة براونيز فادج ساخنة تغمرها الشوكولاتة الذائبة من الداخل.', 
     'كاكاو بلجيكي، زبدة، سكر بني', 
     'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop', 3);


    -- 5. Insert Item Sizes (Prices)
    INSERT INTO item_sizes (item_id, name, price, sort_order) VALUES
    -- Margherita
    (v_item_margherita, 'وسط (أفراد)', 120.00, 1),
    (v_item_margherita, 'كبير', 180.00, 2),
    -- Pepperoni
    (v_item_pepperoni, 'وسط', 145.00, 1),
    (v_item_pepperoni, 'كبير ميكس جبن', 210.00, 2),
    -- BBQ Pizza
    (v_item_bbq_pizza, 'وسط', 155.00, 1),
    (v_item_bbq_pizza, 'عائلي', 220.00, 2),
    -- Smash Burger
    (v_item_smash, 'سنجل', 110.00, 1),
    (v_item_smash, 'دبل كومبو', 160.00, 2),
    -- Chicken
    (v_item_chicken, 'ساندوتش', 100.00, 1),
    (v_item_chicken, 'وجبة', 150.00, 2),
    -- Mushroom
    (v_item_mushroom, 'برجر سوبر', 135.00, 1),
    -- Pastas
    (v_item_alfredo, 'بولة أفراد', 130.00, 1),
    (v_item_alfredo, 'بولة سوبر (تكفي 2)', 180.00, 2),
    (v_item_bechamel, 'طبق قياسي', 110.00, 1),
    -- Drinks
    (v_item_mojito, 'صغير (S)', 45.00, 1),
    (v_item_mojito, 'عملاق (L)', 65.00, 2),
    (v_item_cola, 'كانز كبير', 25.00, 1),
    (v_item_latte, 'كوب صغير', 55.00, 1),
    (v_item_latte, 'كوب كبير', 75.00, 2),
    (v_item_espresso, 'سنجل شوت', 35.00, 1),
    (v_item_espresso, 'دبل شوت', 50.00, 2),
    -- Sweets
    (v_item_crepe, 'حجم قياسي', 95.00, 1),
    (v_item_cheesecake, 'شريحة', 65.00, 1),
    (v_item_brownie, 'قطعة', 55.00, 1);


    -- 6. Insert Dynamic Extras (Side Dishes & Smart Plugins)
    -- Some are standalone sides (array=[]), others are smart suggestions linked to specific subcategories.
    INSERT INTO extras (restaurant_id, name, price, image_url, suggested_subcategories) VALUES
    
    -- Smart Suggestion: Only shows up in specific modals
    (v_res_id, 'عجينة أطراف محشية جبنة', 35.00, 
     NULL, 
     ARRAY[v_sub_pizza]),

    (v_res_id, 'صوص الرانش الخاص', 15.00, 
     'https://images.unsplash.com/photo-1624647900742-df46b0aab36e?q=80&w=600&auto=format&fit=crop', 
     ARRAY[v_sub_pizza, v_sub_burger, v_sub_pasta]),

    (v_res_id, 'هالبينو مدخن وكستنائي', 10.00, 
     'https://images.unsplash.com/photo-1625944227361-1fc453530f25?q=80&w=600&auto=format&fit=crop', 
     ARRAY[v_sub_burger, v_sub_pizza]),
     
    (v_res_id, 'بولة آيس كريم فانيليا', 25.00, 
     'https://images.unsplash.com/photo-1555507036-ab1e4006aa07?q=80&w=600&auto=format&fit=crop', 
     ARRAY[v_sub_sweets]),

    -- Standalone Side Dishes (Array is empty so they simply render at the bottom feed naturally)
    (v_res_id, 'بطاطس مقلية ذهبية (باكيت)', 35.00, 
     'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=600&auto=format&fit=crop', 
     '{}'::uuid[]),

    (v_res_id, 'أصابع موتزاريلا مقرمشة (5 قطع)', 60.00, 
     'https://images.unsplash.com/photo-1531749668029-2fc51bd3f4b4?q=80&w=600&auto=format&fit=crop', 
     '{}'::uuid[]),
     
    (v_res_id, 'حلقات البصل الذهبية المقلية', 45.00, 
     'https://images.unsplash.com/photo-1639024470404-36868af2d011?q=80&w=600&auto=format&fit=crop', 
     '{}'::uuid[]);

END $$;
