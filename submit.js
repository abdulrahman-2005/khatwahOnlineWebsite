// submit-indexnow.js

const submitToIndexNow = async () => {
  const payload = {
    host: "www.khatwah.online",
    key: "76a5edec038f4fca819d678411a7ebb6", // Replace with your actual key
    keyLocation: "https://www.khatwah.online/76a5edec038f4fca819d678411a7ebb6.txt", // Replace with your actual file name
    urlList: [
      "https://www.khatwah.online",
      "https://www.khatwah.online/about",
      "https://www.khatwah.online/products",
      "https://www.khatwah.online/services",
      "https://www.khatwah.online/projects",
      "https://www.khatwah.online/blog",
      "https://www.khatwah.online/contact",
      "https://www.khatwah.online/products/booking-system",
      "https://www.khatwah.online/products/inventory-pos",
      "https://www.khatwah.online/products/custom-development",
      "https://www.khatwah.online/projects/courses-platform",
      "https://www.khatwah.online/projects/ecommerce-system",
      "https://www.khatwah.online/projects/arish-catalogue",
      "https://www.khatwah.online/projects/crypto-platform",
      "https://www.khatwah.online/projects/khatwah-portfolio",
      "https://www.khatwah.online/projects/2nice-store",
      "https://www.khatwah.online/services/phone-story",
      "https://www.khatwah.online/blog/inventory-management-excel-vs-pos-system-arish",
      "https://www.khatwah.online/blog/hidden-roi-digital-reservations",
      "https://www.khatwah.online/blog/move-store-to-ecommerce-ar"
    ]
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log("Success! HTTP 200: URLs submitted to IndexNow.");
    } else {
      console.error(`Submission failed. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error submitting to IndexNow:", error);
  }
};

submitToIndexNow();


`
https://www.khatwah.online
https://www.khatwah.online/about
https://www.khatwah.online/products
https://www.khatwah.online/services
https://www.khatwah.online/projects
https://www.khatwah.online/blog
https://www.khatwah.online/contact
https://www.khatwah.online/products/booking-system
https://www.khatwah.online/products/inventory-pos
https://www.khatwah.online/products/custom-development
https://www.khatwah.online/projects/courses-platform
https://www.khatwah.online/projects/ecommerce-system
https://www.khatwah.online/projects/arish-catalogue
https://www.khatwah.online/projects/crypto-platform
https://www.khatwah.online/projects/khatwah-portfolio
https://www.khatwah.online/projects/2nice-store
https://www.khatwah.online/services/phone-story
https://www.khatwah.online/blog/inventory-management-excel-vs-pos-system-arish
https://www.khatwah.online/blog/hidden-roi-digital-reservations
https://www.khatwah.online/blog/move-store-to-ecommerce-a
`

`TEST ON SOCIAL MEDIA
https://www.khatwah.online
https://www.khatwah.online/about
https://www.khatwah.online/products
https://www.khatwah.online/services
https://www.khatwah.online/projects
https://www.khatwah.online/blog
https://www.khatwah.online/contact
https://www.khatwah.online/products/booking-system
https://www.khatwah.online/projects/courses-platform
https://www.khatwah.online/services/phone-story
https://www.khatwah.online/blog/hidden-roi-digital-reservations
`


