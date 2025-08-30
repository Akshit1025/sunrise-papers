// src/admin/pages/ContentManagement.js

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Adjust path as needed
import RequireAdmin from "../auth/RequireAdmin"; // Assuming you protect admin pages
// import { Cloudinary } from "cloudinary-core"; // Import Cloudinary

// --- Cloudinary Configuration (Ensure these are in your .env) ---
// WARNING: Storing API Secret directly in frontend code is INSECURE for production.
// For production, consider using signed uploads where signature is generated on the backend.
// You might already have this config elsewhere, but include it here if this is the only place for content images
// const cloudinaryCore = new Cloudinary({
//   cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
//   api_secret: process.env.REACT_APP_CLOUDINARY_API_SECRET, // INSECURE for frontend in production
//   secure: true, // Use HTTPS
// });
// --- End Cloudinary Configuration ---

// --- Helper function for Cloudinary Signature ---
async function generateCloudinarySignature(paramsToSign, apiSecret) {
  // Sort parameters alphabetically by key
  const sortedKeys = Object.keys(paramsToSign).sort();
  let stringToSign = sortedKeys
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");
  stringToSign += apiSecret;

  // Use the SubtleCrypto API to generate the SHA-1 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);

  // convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}
// --- End Helper Function ---

// Define a default structure for the homepage content
const defaultHomepageContent = {
  carouselItems: [
    {
      image_url: "images/home/product-banner.jpeg",
      title: "Crafting Tomorrow's Solutions Today",
      text: "Explore our sustainable and high-quality paper products...",
      link_text: "Discover Products",
      link_url: "/products",
    },
    {
      image_url: "images/home/about-us-banner.jpeg",
      title: "Innovation in Every Sheet",
      text: "Leading the way in eco-friendly paper trading...",
      link_text: "Learn More",
      link_url: "/about",
    },
    {
      image_url: "images/home/contact-us-banner.png",
      title: "Partner with Confidence",
      text: "Reliable supply and exceptional service...",
      link_text: "Contact Us",
      link_url: "/contact",
    },
    // Add more default items if you have them
  ],
  sections: [
    {
      name: "aboutCompany",
      title: "Welcome to Sunrise Papers",
      paragraphs: [
        "Founded in 1995, Sunrise Papers has grown into a trusted name...",
        "At the heart of our business is a deep commitment...",
      ],
      image_url: "images/home/about-home-img.png",
    },
    {
      name: "coreStrengths",
      title: "Our Core Strengths",
      features: [
        {
          icon_class: "fas fa-leaf",
          title: "Sustainable Sourcing",
          description:
            "Committed to eco-friendly practices and responsible paper sourcing.",
        },
        {
          icon_class: "fas fa-truck",
          title: "Efficient Supply Chain",
          description:
            "Streamlining global logistics for timely paper product delivery.",
        },
        {
          icon_class: "fas fa-handshake",
          title: "Customer-Centric Approach",
          description:
            "Building strong relationships through exceptional service and support.",
        },
      ],
    },
    {
      name: "productCategories", // Represents the section that lists categories
      title: "Explore Our Product Categories",
      // The categories themselves are managed in Categories.js
      // We'll just manage the section title here.
    },
    // Define other homepage sections here if needed
  ],
  // Add other top-level homepage content fields here
};

const defaultAboutContent = {
  sections: [
    {
      name: "aboutGlance",
      title: "A Glance at Sunrise Papers",
      paragraphs: [
        "Established in 1995, Sunrise Papers is a leading importer...",
        "Our success is built...",
        "We remain at the forefront...",
      ],
      image_url: "images/about/about-glance-img.jpeg",
    },
    {
      name: "philosophy",
      title: "Paper Supply Philosophy",
      icon_class: "fas fa-lightbulb",
      paragraph: "We believe in delivering only the best...",
    },
    {
      name: "leadership",
      title: "Our Leadership",
      quote:
        "\"It's not about how many years I've worked - it's about how much those years have taught me.\"", // Escaped quote
      quote_author: "Mr. Dinesh Gupta",
      paragraph: "Under the insightful leadership of Mr. Dinesh Gupta...",
      image_url: "images/logo-no-bg.png",
    },
    {
      name: "companyProfile",
      title: "Company Profile",
      image_url: "images/about/about-profile-img.jpg",
      info_list: [
        {
          icon_class: "fas fa-dot-circle",
          label: "Nature of Business",
          value: "Trader and Importer",
        },
        {
          icon_class: "fas fa-dot-circle",
          label: "Additional Business",
          value: "Wholesale Supplier",
        },
        {
          icon_class: "fas fa-dot-circle",
          label: "Company Owner",
          value: "Dinesh Gupta",
        },
        {
          icon_class: "fas fa-map-marker-alt",
          label: "Registered Address",
          value:
            "Unit No. 390, Vegas Mall, Plot No. 6, Sector 14, Dwarka, Delhi, 110078, India",
        },
        {
          icon_class: "fas fa-users",
          label: "Total No. of Employees",
          value: "11 to 25 people",
        },
        {
          icon_class: "fas fa-calendar-alt",
          label: "Year of Establishment",
          value: "1995",
        },
        {
          icon_class: "fas fa-balance-scale",
          label: "Legal Status of Firm",
          value: "Individual - Proprietor",
        },
        {
          icon_class: "fas fa-wallet",
          label: "Annual Turnover",
          value: "Rs. 25 - 50 Crores",
        },
        {
          icon_class: "fas fa-barcode",
          label: "GST No.",
          value: "07AAJPK3664M1Z9",
        },
      ],
    },
    {
      name: "whyUs",
      title: "WHY US ?",
      icon_class: "fas fa-question-circle",
      intro_paragraph: "Over the years, we have established a reputation...",
      values_list: [
        {
          icon_class: "fas fa-shipping-fast",
          text: "Prompt and Reliable Delivery",
        },
        {
          icon_class: "fas fa-handshake",
          text: "Ethical and Transparent Business Practices",
        },
        {
          icon_class: "fas fa-tags",
          text: "Competitive Pricing with Technically Advanced Products",
        },
        {
          icon_class: "fas fa-globe",
          text: "Widespread and Efficient Distribution Network",
        },
        {
          icon_class: "fas fa-check-circle",
          text: "Consistent Product Quality and Client Satisfaction",
        },
      ],
    },
    {
      name: "qualityAssurance",
      title: "Our Commitment to Quality",
      image_url: "images/about/about-quality-img.png",
      paragraphs: [
        "As a dedicated wholesale supplier and importer, our foremost priority...",
        "Our product range is crafted...",
        "We maintain detailed oversight...",
      ],
    },
  ],
};

const defaultContactContent = {
  sections: [
    {
      name: "intro",
      title: "Contact Us",
      subtitle: "We're here to help! Reach out to us for any inquiries.",
      // Optional: hero_image_url could be added here
    },
    {
      name: "details",
      intro_paragraph: "Have a question or want to discuss a project...",
      contact_info: [
        {
          icon_class: "fas fa-map-marker-alt",
          text: "Unit No. 390, Vegas Mall...",
          link_url: "https://maps.app.goo.gl/dnWGFT5NEYQBvkfc9",
        },
        {
          icon_class: "fas fa-envelope",
          text: "dineshgupta@sunrisepapers.co.in",
          link_url: "mailto:dineshgupta@sunrisepapers.co.in",
        },
        // *** Modified to have two separate phone number entries ***
        {
          icon_class: "fas fa-phone",
          text: "+91 95555 09507", // First number
          link_url: "tel:+919555509507",
        },
        {
          icon_class: "fas fa-phone", // Same icon for both
          text: "+91 98100 87126", // Second number
          link_url: "tel:+919810087126",
        },
        {
          icon_class: "fas fa-tty",
          text: "011-6995-2451",
          link_url: "tel:+911169952451",
        },
      ],
      business_hours_title: "Business Hours",
      business_hours_text:
        "Monday - Saturday: 10:00 AM - 6:00 PM\nSunday: Closed",
      map_embed_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.9434620915536!2d77.02744837454031!3d28.601472885492168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1ba519ad564f%3A0xe2d9a71052183dde!2sSunrise%20Papers!5e0!3m2!1sen!2sin!4v1755530280369!5m2!1sen!2sin", // Example embed URL
      // Optional: map_image_url could be added here
    },
  ],
  // Note: Contact form is managed by QuoteRequests definitions
};

const ContentManagement = () => {
  const [homepageContent, setHomepageContent] = useState(
    defaultHomepageContent
  );
  const [aboutContent, setAboutContent] = useState({}); // State for About page content
  const [contactContent, setContactContent] = useState({}); // State for Contact page content

  const [loadingHomepage, setLoadingHomepage] = useState(true);
  const [loadingAbout, setLoadingAbout] = useState(true);
  const [loadingContact, setLoadingContact] = useState(true);

  const [savingHomepage, setSavingHomepage] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  const [msg, setMsg] = useState(""); // General message state

  // State for tracking file uploads for images
  const [homepageImageFiles, setHomepageImageFiles] = useState({}); // { sectionName: FileList/Array }
  const [aboutImageFiles, setAboutImageFiles] = useState({}); // { sectionName: FileList/Array }
  const [contactImageFiles, setContactImageFiles] = useState({}); // { sectionName: FileList/Array }

  const fetchContent = async () => {
    setLoadingHomepage(true);
    setLoadingAbout(true);
    setLoadingContact(true);
    setMsg("");

    try {
      // Fetch Homepage Content
      const homepageDocRef = doc(db, "siteContent", "homepage");
      const homepageSnap = await getDoc(homepageDocRef);
      if (homepageSnap.exists()) {
        // Merge with default to ensure all fields are present if not in DB
        // Explicitly handle merging of top-level arrays and section arrays
        setHomepageContent({
          ...defaultHomepageContent, // Start with defaults
          ...homepageSnap.data(), // Overlay fetched data
          carouselItems: Array.isArray(homepageSnap.data().carouselItems)
            ? homepageSnap.data().carouselItems
            : defaultHomepageContent.carouselItems,
          sections: Array.isArray(homepageSnap.data().sections)
            ? homepageSnap.data().sections.map((fetchedSection) => {
                // Find the corresponding default section to merge arrays
                const defaultSection = defaultHomepageContent.sections.find(
                  (ds) => ds.name === fetchedSection.name
                );
                return {
                  ...defaultSection, // Start with default section's structure and defaults
                  ...fetchedSection, // Overlay fetched section data
                  // Explicitly handle merging arrays within sections
                  paragraphs: Array.isArray(fetchedSection.paragraphs)
                    ? fetchedSection.paragraphs
                    : defaultSection?.paragraphs || [],
                  features: Array.isArray(fetchedSection.features)
                    ? fetchedSection.features
                    : defaultSection?.features || [],
                  // Add similar checks for any other arrays within homepage sections
                };
              })
            : defaultHomepageContent.sections, // Fallback to default sections if fetched is not an array
        });
      } else {
        setHomepageContent(defaultHomepageContent); // Use defaults if no document
      }

      // Fetch About Page Content
      const aboutDocRef = doc(db, "siteContent", "about");
      const aboutSnap = await getDoc(aboutDocRef);
      // Use default as a base, merge with fetched data, handle arrays
      if (aboutSnap.exists()) {
        setAboutContent({
          ...defaultAboutContent,
          ...aboutSnap.data(),
          sections: Array.isArray(aboutSnap.data().sections)
            ? aboutSnap.data().sections.map((fetchedSection) => {
                const defaultSection = defaultAboutContent.sections.find(
                  (ds) => ds.name === fetchedSection.name
                );
                return {
                  ...defaultSection, // Start with default section
                  ...fetchedSection, // Overlay fetched
                  // Explicitly handle merging About page arrays within sections
                  paragraphs: Array.isArray(fetchedSection.paragraphs)
                    ? fetchedSection.paragraphs
                    : defaultSection?.paragraphs || [],
                  info_list: Array.isArray(fetchedSection.info_list)
                    ? fetchedSection.info_list
                    : defaultSection?.info_list || [],
                  values_list: Array.isArray(fetchedSection.values_list)
                    ? fetchedSection.values_list
                    : defaultSection?.values_list || [],
                  // Add similar checks for any other arrays within about sections
                };
              })
            : defaultAboutContent.sections, // Fallback to default about sections
        }); // Set about content
      } else {
        setAboutContent(defaultAboutContent); // Use defaults
      }

      // Fetch Contact Page Content
      const contactDocRef = doc(db, "siteContent", "contact");
      const contactSnap = await getDoc(contactDocRef);
      // Use default as a base, merge with fetched data, handle arrays
      if (contactSnap.exists()) {
        setContactContent({
          ...defaultContactContent,
          ...contactSnap.data(),
          sections: Array.isArray(contactSnap.data().sections)
            ? contactSnap.data().sections.map((fetchedSection) => {
                const defaultSection = defaultContactContent.sections.find(
                  (ds) => ds.name === fetchedSection.name
                );
                return {
                  ...defaultSection, // Start with default section
                  ...fetchedSection, // Overlay fetched
                  // Explicitly handle merging Contact page arrays within sections
                  contact_info: Array.isArray(fetchedSection.contact_info)
                    ? fetchedSection.contact_info
                    : defaultSection?.contact_info || [],
                  // Add similar checks for any other arrays within contact sections
                };
              })
            : defaultContactContent.sections, // Fallback to default contact sections
        }); // Set contact content
      } else {
        setContactContent(defaultContactContent); // Use defaults
      }
    } catch (e) {
      console.error("Error fetching site content:", e);
      setMsg(`Failed to load site content: ${e.message}`);
    } finally {
      setLoadingHomepage(false);
      setLoadingAbout(false);
      setLoadingContact(false);
    }
  };

  // Fetch content for all pages on mount
  useEffect(() => {
    fetchContent();
  }, []); // Empty dependency array means fetch only on mount

  // --- Image Upload Function (Reusable) ---
  const uploadImage = async (file, folderName) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
    );
    formData.append("folder", `site_content_images/${folderName}`); // e.g., site_content_images/homepage, site_content_images/about

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        console.log("Uploaded to Cloudinary:", data.secure_url);
        return data.secure_url;
      } else {
        console.error("Cloudinary upload failed:", data);
        throw new Error("Cloudinary upload failed");
      }
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      throw error; // Re-throw to be handled by the calling save function
    }
  };

  // --- Image Deletion Function (Reusable - simplified frontend version INSECURE) ---
  // You should ideally move this to a backend function
  const deleteImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.startsWith("https://res.cloudinary.com/")) {
      return;
    }

    try {
      // Correctly parse the public_id by removing the version number
      const pathWithVersion = imageUrl.split("/upload/")[1]?.split("?")[0];
      if (!pathWithVersion) {
        console.warn("Could not extract path from URL:", imageUrl);
        return;
      }

      const pathParts = pathWithVersion.split("/");
      if (pathParts[0].match(/^v\d+$/)) {
        pathParts.shift(); // Remove the version part if it exists
      }
      const publicIdWithExtension = pathParts.join("/");
      const publicId = publicIdWithExtension.substring(
        0,
        publicIdWithExtension.lastIndexOf(".")
      );

      const timestamp = new Date().getTime();
      const paramsToSign = {
        public_id: publicId,
        timestamp,
      };

      // Use the correct helper function to generate the signature
      const signature = await generateCloudinarySignature(
        paramsToSign,
        process.env.REACT_APP_CLOUDINARY_API_SECRET
      );

      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("timestamp", timestamp);
      formData.append("api_key", process.env.REACT_APP_CLOUDINARY_API_KEY);
      formData.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.result === "ok" || data.result === "not found") {
        console.log(`Cloudinary deletion successful for ${publicId}`);
      } else {
        throw new Error(
          `Cloudinary deletion failed for ${publicId}: ${
            data.error?.message || "Unknown error"
          }`
        );
      }
    } catch (e) {
      console.error(`Error deleting image ${imageUrl} from Cloudinary:`, e);
      // Re-throw the error so any calling function knows it failed
      throw e;
    }
  };
  // --- End Image Deletion Function ---

  // Handle file change for a specific section/image
  const handleImageFileChange = (page, sectionName, e) => {
    const file = e.target.files[0]; // Assuming only one file per input
    if (page === "homepage") {
      setHomepageImageFiles((prev) => ({ ...prev, [sectionName]: file }));
    } else if (page === "about") {
      setAboutImageFiles((prev) => ({ ...prev, [sectionName]: file }));
    } else if (page === "contact") {
      setContactImageFiles((prev) => ({ ...prev, [sectionName]: file }));
    }
    // Optional: Clear the input so the same file can be selected again
    // e.target.value = null;
  };

  // Handle text/input changes for homepage content
  const handleHomepageChange = (
    sectionName,
    fieldName,
    value,
    itemIndex,
    subFieldName
  ) => {
    setHomepageContent((prev) => {
      const newContent = { ...prev };
      const sectionIndex = newContent.sections.findIndex(
        (s) => s.name === sectionName
      );

      if (sectionIndex > -1) {
        const updatedSection = { ...newContent.sections[sectionIndex] };

        if (itemIndex !== undefined && subFieldName !== undefined) {
          // Handling nested arrays like features or carouselItems
          if (Array.isArray(updatedSection[fieldName])) {
            const updatedItems = [...updatedSection[fieldName]];
            if (updatedItems[itemIndex]) {
              // Ensure item exists
              updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                [subFieldName]: value,
              };
              updatedSection[fieldName] = updatedItems;
            }
          }
        } else if (itemIndex !== undefined) {
          // Handling arrays of simple values like paragraphs
          if (Array.isArray(updatedSection[fieldName])) {
            const updatedItems = [...updatedSection[fieldName]];
            updatedItems[itemIndex] = value;
            updatedSection[fieldName] = updatedItems;
          }
        } else {
          // Handling simple fields within the section object
          updatedSection[fieldName] = value;
        }

        newContent.sections[sectionIndex] = updatedSection;
      } else {
        // Handle fields not within a 'sections' array, like top-level carouselItems array itself
        if (Array.isArray(newContent[sectionName])) {
          // Assuming sectionName is 'carouselItems'
          const updatedItems = [...newContent[sectionName]];
          if (itemIndex !== undefined && subFieldName !== undefined) {
            // Handling fields within carousel item objects
            if (updatedItems[itemIndex]) {
              // Ensure item exists
              updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                [subFieldName]: value,
              };
              newContent[sectionName] = updatedItems;
            }
          } else if (itemIndex !== undefined) {
            // Handling simple items in the array (unlikely for carousel)
            updatedItems[itemIndex] = value;
            newContent[sectionName] = updatedItems;
          } else {
            // Handling a simple top-level field like 'title'
            newContent[sectionName] = value;
          }
        } else {
          // Handling a simple top-level field like 'someTopLevelField'
          newContent[sectionName] = value;
        }
      }

      return newContent;
    });
  };

  // Add/Remove items in arrays (e.g., paragraphs, features, carouselItems)
  const handleAddItem = (page, sectionName, fieldName, defaultValue = "") => {
    if (page === "homepage") {
      setHomepageContent((prev) => {
        const newContent = { ...prev };
        const sectionIndex = newContent.sections.findIndex(
          (s) => s.name === sectionName
        );

        if (
          sectionIndex > -1 &&
          Array.isArray(newContent.sections[sectionIndex][fieldName])
        ) {
          const updatedItems = [
            ...newContent.sections[sectionIndex][fieldName],
            defaultValue,
          ];
          newContent.sections[sectionIndex][fieldName] = updatedItems;
        } else if (Array.isArray(newContent[sectionName])) {
          // Handle top-level arrays like carouselItems
          const updatedItems = [...newContent[sectionName], defaultValue];
          newContent[sectionName] = updatedItems;
        }
        return newContent;
      });
    } else if (page === "about") {
      setAboutContent((prev) => {
        const newContent = { ...prev };
        const sectionIndex = newContent.sections.findIndex(
          (s) => s.name === sectionName
        );

        if (
          sectionIndex > -1 &&
          Array.isArray(newContent.sections[sectionIndex][fieldName])
        ) {
          const updatedItems = [
            ...newContent.sections[sectionIndex][fieldName],
            defaultValue,
          ];
          newContent.sections[sectionIndex][fieldName] = updatedItems;
        }
        // No top-level arrays to handle in About based on default structure
        return newContent;
      });
    } else if (page === "contact") {
      setContactContent((prev) => {
        const newContent = { ...prev };
        const sectionIndex = newContent.sections.findIndex(
          (s) => s.name === sectionName
        );

        if (
          sectionIndex > -1 &&
          Array.isArray(newContent.sections[sectionIndex][fieldName])
        ) {
          const updatedItems = [
            ...newContent.sections[sectionIndex][fieldName],
            defaultValue,
          ];
          newContent.sections[sectionIndex][fieldName] = updatedItems;
        }
        // No top-level arrays to handle in Contact based on default structure
        return newContent;
      });
    }
  };

  const handleRemoveItem = (page, sectionName, fieldName, itemIndex) => {
    if (page === "homepage") {
      setHomepageContent((prev) => {
        const newContent = { ...prev };
        const sectionIndex = newContent.sections.findIndex(
          (s) => s.name === sectionName
        );

        let imageUrlToDelete = null; // To track if an image associated with the item needs deletion

        if (
          sectionIndex > -1 &&
          Array.isArray(newContent.sections[sectionIndex][fieldName])
        ) {
          // Handling arrays within sections
          const updatedItems = newContent.sections[sectionIndex][
            fieldName
          ].filter((_, i) => i !== itemIndex);
          // Check if the removed item had an image URL (e.g., in a features array of objects)
          if (
            newContent.sections[sectionIndex][fieldName][itemIndex] &&
            newContent.sections[sectionIndex][fieldName][itemIndex].image_url
          ) {
            imageUrlToDelete =
              newContent.sections[sectionIndex][fieldName][itemIndex].image_url;
          }
          newContent.sections[sectionIndex][fieldName] = updatedItems;
        } else if (Array.isArray(newContent[sectionName])) {
          // Handle top-level arrays like carouselItems
          const updatedItems = newContent[sectionName].filter(
            (_, i) => i !== itemIndex
          );
          // Check if the removed item had an image URL (for carousel items)
          if (
            newContent[sectionName][itemIndex] &&
            newContent[sectionName][itemIndex].image_url
          ) {
            imageUrlToDelete = newContent[sectionName][itemIndex].image_url;
          }
          newContent[sectionName] = updatedItems;
        }

        // If an image URL was associated with the removed item, trigger deletion
        if (imageUrlToDelete) {
          deleteImage(imageUrlToDelete).catch(console.error); // Delete in the background
        }

        return newContent;
      });
    } else if (page === "about") {
      setAboutContent((prev) => {
        const newContent = { ...prev };
        const sectionIndex = newContent.sections.findIndex(
          (s) => s.name === sectionName
        );

        let imageUrlToDelete = null; // To track if an image associated with the item needs deletion

        if (
          sectionIndex > -1 &&
          Array.isArray(newContent.sections[sectionIndex][fieldName])
        ) {
          // Handling arrays within sections (e.g., paragraphs, info_list, values_list)
          const updatedItems = newContent.sections[sectionIndex][
            fieldName
          ].filter((_, i) => i !== itemIndex);

          // Check if the removed item had an image URL (relevant for arrays of objects like info_list or values_list)
          // Note: For arrays of strings like paragraphs, there's no image_url on the item level
          if (
            newContent.sections[sectionIndex][fieldName][itemIndex] &&
            typeof newContent.sections[sectionIndex][fieldName][itemIndex] ===
              "object" &&
            newContent.sections[sectionIndex][fieldName][itemIndex].image_url
          ) {
            imageUrlToDelete =
              newContent.sections[sectionIndex][fieldName][itemIndex].image_url;
          }

          newContent.sections[sectionIndex][fieldName] = updatedItems;
        }
        // No top-level arrays to handle in About based on default structure

        // If an image URL was associated with the removed item, trigger deletion
        if (imageUrlToDelete) {
          deleteImage(imageUrlToDelete).catch(console.error); // Delete in the background
        }

        return newContent;
      });
    } else if (page === "contact") {
      setContactContent((prev) => {
        const newContent = { ...prev };
        const sectionIndex = newContent.sections.findIndex(
          (s) => s.name === sectionName
        );

        let imageUrlToDelete = null; // To track if an image associated with the item needs deletion

        if (
          sectionIndex > -1 &&
          Array.isArray(newContent.sections[sectionIndex][fieldName])
        ) {
          // Handling arrays within sections (e.g., contact_info)
          const updatedItems = newContent.sections[sectionIndex][
            fieldName
          ].filter((_, i) => i !== itemIndex);

          // Check if the removed item had an image URL (relevant for arrays of objects like contact_info)
          if (
            newContent.sections[sectionIndex][fieldName][itemIndex] &&
            typeof newContent.sections[sectionIndex][fieldName][itemIndex] ===
              "object" &&
            newContent.sections[sectionIndex][fieldName][itemIndex].image_url
          ) {
            imageUrlToDelete =
              newContent.sections[sectionIndex][fieldName][itemIndex].image_url;
          }

          newContent.sections[sectionIndex][fieldName] = updatedItems;
        }
        // No top-level arrays to handle in Contact based on default structure

        // If an image URL was associated with the removed item, trigger deletion
        if (imageUrlToDelete) {
          deleteImage(imageUrlToDelete).catch(console.error); // Delete in the background
        }

        return newContent;
      });
    }
  };

  // Save Homepage Content
  const onSaveHomepage = async (e) => {
    e.preventDefault();
    setSavingHomepage(true);
    setMsg("");

    try {
      const homepageDocRef = doc(db, "siteContent", "homepage");
      const dataToSave = { ...homepageContent };

      // --- Handle Image Uploads for Homepage ---
      // Iterate through sections and check for new image files
      if (dataToSave.sections) {
        // Added null check
        for (const section of dataToSave.sections) {
          if (homepageImageFiles[section.name]) {
            try {
              const imageUrl = await uploadImage(
                homepageImageFiles[section.name],
                "homepage"
              );
              if (imageUrl) {
                // If there was a previous image, delete it
                if (
                  section.image_url &&
                  section.image_url.startsWith("https://res.cloudinary.com/")
                ) {
                  await deleteImage(section.image_url);
                }
                section.image_url = imageUrl; // Update the image URL in the data to save
              }
            } catch (uploadError) {
              console.error(`Upload failed for ${section.name}:`, uploadError);
              setMsg(
                `Failed to upload image for ${section.name}. Saving other changes.`
              );
              // Don't block save for other content if one image fails
            }
          }
        }
      }

      // Handle image uploads for top-level arrays like carouselItems
      if (Array.isArray(dataToSave.carouselItems)) {
        for (let i = 0; i < dataToSave.carouselItems.length; i++) {
          const item = dataToSave.carouselItems[i];
          // Assuming file input keys match item index and a unique identifier (e.g., carousel-${i})
          if (homepageImageFiles[`carousel-${i}`]) {
            try {
              const imageUrl = await uploadImage(
                homepageImageFiles[`carousel-${i}`],
                "homepage/carousel"
              );
              if (imageUrl) {
                // If there was a previous image, delete it
                if (
                  item.image_url &&
                  item.image_url.startsWith("https://res.cloudinary.com/")
                ) {
                  await deleteImage(item.image_url);
                }
                item.image_url = imageUrl; // Update the image URL
              }
            } catch (uploadError) {
              console.error(
                `Upload failed for carousel item ${i}:`,
                uploadError
              );
              setMsg(
                `Failed to upload image for carousel item ${i}. Saving other changes.`
              );
            }
          }
        }
      }

      // Save the content document to Firestore
      await setDoc(homepageDocRef, dataToSave);
      setMsg("Homepage content saved.");
      setHomepageImageFiles({}); // Clear uploaded files after saving
      await fetchContent(); // Re-fetch content to ensure form is updated with new URLs
    } catch (e) {
      console.error("Error saving homepage content:", e);
      setMsg(`Failed to save homepage content: ${e.message}`);
    } finally {
      setSavingHomepage(false);
      setTimeout(() => setMsg(""), 2500);
    }
  };

  // Add placeholders for About and Contact page save handlers (similarly structured)
  const onSaveAbout = async (e) => {
    e.preventDefault();
    setSavingAbout(true);
    setMsg("");

    try {
      const aboutDocRef = doc(db, "siteContent", "about");
      const dataToSave = { ...aboutContent };

      // --- Handle Image Uploads for About Page ---
      if (dataToSave.sections) {
        // Added null check
        for (const section of dataToSave.sections) {
          // Handle image for the section itself (e.g., aboutGlance, leadership, companyProfile, qualityAssurance)
          if (aboutImageFiles[section.name]) {
            try {
              const imageUrl = await uploadImage(
                aboutImageFiles[section.name],
                "about"
              );
              if (imageUrl) {
                if (
                  section.image_url &&
                  section.image_url.startsWith("https://res.cloudinary.com/")
                ) {
                  await deleteImage(section.image_url);
                }
                section.image_url = imageUrl;
              }
            } catch (uploadError) {
              console.error(
                `Upload failed for About/${section.name}:`,
                uploadError
              );
              setMsg(
                `Failed to upload image for About/${section.name}. Saving other changes.`
              );
            }
          }

          // Handle images within arrays of objects within sections (e.g., info_list, values_list)
          // You'll need to add specific checks for arrays that contain image_urls
          if (
            section.name === "companyProfile" &&
            Array.isArray(section.info_list)
          ) {
            for (let i = 0; i < section.info_list.length; i++) {
              // Assuming you might add images to info_list items in the future, add upload logic here
              // Example: if (aboutImageFiles[`companyProfile-info-${i}`]) { ... upload logic ... }
            }
          }
          if (section.name === "whyUs" && Array.isArray(section.values_list)) {
            for (let i = 0; i < section.values_list.length; i++) {
              // Assuming you might add images to values_list items in the future, add upload logic here
              // Example: if (aboutImageFiles[`whyUs-value-${i}`]) { ... upload logic ... }
            }
          }
        }
      }

      await setDoc(aboutDocRef, dataToSave);
      setMsg("About page content saved.");
      setAboutImageFiles({}); // Clear files
      await fetchContent(); // Re-fetch content
    } catch (e) {
      console.error("Error saving About content:", e);
      setMsg(`Failed to save About page content: ${e.message}`);
    } finally {
      setSavingAbout(false);
      setTimeout(() => setMsg(""), 2500);
    }
  };

  const onSaveContact = async (e) => {
    e.preventDefault();
    setSavingContact(true);
    setMsg("");

    try {
      const contactDocRef = doc(db, "siteContent", "contact");
      const dataToSave = { ...contactContent };

      // --- Handle Image Uploads for Contact Page (if any) ---
      if (dataToSave.sections) {
        // Added null check
        for (const section of dataToSave.sections) {
          // Handle image for the section itself (e.g., if 'intro' had a hero_image_url)
          if (section.name === "intro" && contactImageFiles["introHero"]) {
            try {
              const imageUrl = await uploadImage(
                contactImageFiles["introHero"],
                "contact"
              );
              if (imageUrl) {
                if (
                  section.hero_image_url &&
                  section.hero_image_url.startsWith(
                    "https://res.cloudinary.com/"
                  )
                ) {
                  await deleteImage(section.hero_image_url);
                }
                section.hero_image_url = imageUrl;
              }
            } catch (uploadError) {
              console.error(
                "Upload failed for Contact/Intro Hero:",
                uploadError
              );
              setMsg(
                "Failed to upload image for Contact Hero. Saving other changes."
              );
            }
          }

          // Handle images within arrays of objects within sections (e.g., contact_info)
          if (
            section.name === "details" &&
            Array.isArray(section.contact_info)
          ) {
            for (let i = 0; i < section.contact_info.length; i++) {
              // Assuming you might add images to contact_info items in the future, add upload logic here
              // Example: if (contactImageFiles[`details-contactInfo-${i}`]) { ... upload logic ... }
            }
          }
          // Handle image upload for the map if using an image instead of embed (uncomment if needed)
          // if (section.name === 'details' && contactImageFiles['mapImage']) {
          //      try {
          //         const imageUrl = await uploadImage(contactImageFiles['mapImage'], "contact/map");
          //          if (imageUrl) {
          //              if (section.map_image_url && section.map_image_url.startsWith("https://res.cloudinary.com/")) {
          //                  await deleteImage(section.map_image_url);
          //              }
          //              section.map_image_url = imageUrl;
          //          }
          //     } catch (uploadError) {
          //         console.error("Upload failed for Contact/Map:", uploadError);
          //          setMsg("Failed to upload image for Contact Map. Saving other changes.");
          //      }
          // }
        }
      }

      await setDoc(contactDocRef, dataToSave);
      setMsg("Contact page content saved.");
      setContactImageFiles({}); // Clear files
      await fetchContent(); // Re-fetch content
    } catch (e) {
      console.error("Error saving Contact content:", e);
      setMsg(`Failed to save Contact page content: ${e.message}`);
    } finally {
      setSavingContact(false);
      setTimeout(() => setMsg(""), 2500);
    }
  };

  // Handle text/input changes for About page content (placeholder structure)
  const handleAboutChange = (
    sectionName,
    fieldName,
    value,
    itemIndex,
    subFieldName
  ) => {
    setAboutContent((prev) => {
      const newContent = { ...prev };
      const sectionIndex = newContent.sections.findIndex(
        (s) => s.name === sectionName
      );

      if (sectionIndex > -1) {
        const updatedSection = { ...newContent.sections[sectionIndex] };

        if (itemIndex !== undefined && subFieldName !== undefined) {
          // Handling nested arrays like info_list or values_list within sections (arrays of objects)
          if (Array.isArray(updatedSection[fieldName])) {
            const updatedItems = [...updatedSection[fieldName]];
            if (updatedItems[itemIndex]) {
              // Ensure item exists
              updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                [subFieldName]: value,
              };
              updatedSection[fieldName] = updatedItems;
            }
          }
        } else if (itemIndex !== undefined) {
          // Handling arrays of simple values like paragraphs within sections (arrays of strings)
          if (Array.isArray(updatedSection[fieldName])) {
            const updatedItems = [...updatedSection[fieldName]];
            updatedItems[itemIndex] = value; // Direct value update for strings
            updatedSection[fieldName] = updatedItems;
          }
        } else {
          // Handling simple fields within the section object (e.g., title, icon_class, paragraph)
          updatedSection[fieldName] = value;
        }

        newContent.sections[sectionIndex] = updatedSection;
      } else {
        // Handle fields not within a 'sections' array for About page (if any, though unlikely based on structure)
        newContent[sectionName] = value; // Assuming simple top-level field
      }

      return newContent;
    });
  };

  // Handle text/input changes for Contact page content (placeholder structure)
  const handleContactChange = (
    sectionName,
    fieldName,
    value,
    itemIndex,
    subFieldName
  ) => {
    setContactContent((prev) => {
      const newContent = { ...prev };
      const sectionIndex = newContent.sections.findIndex(
        (s) => s.name === sectionName
      );

      if (sectionIndex > -1) {
        const updatedSection = { ...newContent.sections[sectionIndex] };

        if (itemIndex !== undefined && subFieldName !== undefined) {
          // Handling nested arrays like contact_info within sections (arrays of objects)
          if (Array.isArray(updatedSection[fieldName])) {
            const updatedItems = [...updatedSection[fieldName]];
            if (updatedItems[itemIndex]) {
              // Ensure item exists
              updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                [subFieldName]: value,
              };
              updatedSection[fieldName] = updatedItems;
            }
          }
        } else if (itemIndex !== undefined) {
          // Handling arrays of simple values within sections (unlikely for contact details based on structure)
          if (Array.isArray(updatedSection[fieldName])) {
            const updatedItems = [...updatedSection[fieldName]];
            updatedItems[itemIndex] = value;
            updatedSection[fieldName] = updatedItems;
          }
        } else {
          // Handling simple fields within the section object (e.g., title, subtitle, intro_paragraph, map_embed_url)
          updatedSection[fieldName] = value;
        }

        newContent.sections[sectionIndex] = updatedSection;
      } else {
        // Handle fields not within a 'sections' array for Contact page (if any, e.g., hero_image_url)
        newContent[sectionName] = value; // Assuming simple top-level field like hero_image_url
      }

      return newContent;
    });
  };

  // Call fetchContent after saves
  // await setDoc(...);
  // setMsg(...);
  // set...ImageFiles({});
  // fetchContent(); // Re-fetch all content after saving any page

  return (
    <RequireAdmin>
      <div className="container mt-4">
        <h2 className="h4 mb-4">Site Content Management</h2>
        {msg && <div className="alert alert-info mb-3">{msg}</div>}
        <ul className="nav nav-tabs mb-4" id="contentTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="homepage-tab"
              data-bs-toggle="tab"
              data-bs-target="#homepage-pane"
              type="button"
              role="tab"
              aria-controls="homepage-pane"
              aria-selected="true"
            >
              Homepage
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="about-tab"
              data-bs-toggle="tab"
              data-bs-target="#about-pane"
              type="button"
              role="tab"
              aria-controls="about-pane"
              aria-selected="false"
            >
              About Page
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="contact-tab"
              data-bs-toggle="tab"
              data-bs-target="#contact-pane"
              type="button"
              role="tab"
              aria-controls="contact-pane"
              aria-selected="false"
            >
              Contact Page
            </button>
          </li>
        </ul>

        <div className="tab-content" id="contentTabsContent">
          <div
            className="tab-pane fade show active"
            id="homepage-pane"
            role="tabpanel"
            aria-labelledby="homepage-tab"
            tabIndex="0"
          >
            {loadingHomepage ? (
              <div>Loading Homepage Content...</div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <h3 className="h5 card-title mb-4">Homepage Content</h3>
                  <form onSubmit={onSaveHomepage}>
                    <div className="mb-4">
                      <h4 className="mb-3">Hero Carousel</h4>
                      {(homepageContent.carouselItems || []).map(
                        (
                          item,
                          index // Added null check for carouselItems
                        ) => (
                          <div key={index} className="card mb-3 p-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="m-0">Carousel Item {index + 1}</h6>
                              {homepageContent.carouselItems &&
                                homepageContent.carouselItems.length > 1 && ( // Added null check
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() =>
                                      handleRemoveItem(
                                        "homepage",
                                        "carouselItems",
                                        null,
                                        index
                                      )
                                    } // Passing null for fieldName as carouselItems is top-level array
                                    disabled={savingHomepage}
                                  >
                                    <i className="fas fa-trash-alt me-1"></i>{" "}
                                    Remove Item
                                  </button>
                                )}
                            </div>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label">Title</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={item.title || ""}
                                  onChange={(e) =>
                                    handleHomepageChange(
                                      "carouselItems",
                                      null,
                                      e.target.value,
                                      index,
                                      "title"
                                    )
                                  } // sectionName is 'carouselItems', fieldName is null for top-level array
                                  disabled={savingHomepage}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Text</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={item.text || ""}
                                  onChange={(e) =>
                                    handleHomepageChange(
                                      "carouselItems",
                                      null,
                                      e.target.value,
                                      index,
                                      "text"
                                    )
                                  }
                                  disabled={savingHomepage}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Link Text</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={item.link_text || ""}
                                  onChange={(e) =>
                                    handleHomepageChange(
                                      "carouselItems",
                                      null,
                                      e.target.value,
                                      index,
                                      "link_text"
                                    )
                                  }
                                  disabled={savingHomepage}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Link URL</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={item.link_url || ""}
                                  onChange={(e) =>
                                    handleHomepageChange(
                                      "carouselItems",
                                      null,
                                      e.target.value,
                                      index,
                                      "link_url"
                                    )
                                  }
                                  disabled={savingHomepage}
                                />
                              </div>
                              <div className="col-md-12">
                                <label className="form-label">
                                  Background Image
                                </label>
                                {item.image_url && (
                                  <div className="mb-2">
                                    <img
                                      src={item.image_url}
                                      alt={`Item ${index + 1} background`}
                                      className="img-thumbnail me-2"
                                      style={{ width: "100px", height: "auto" }}
                                    />
                                    {/* Optional: Add a button to remove the existing image */}
                                  </div>
                                )}
                                <input
                                  type="file"
                                  className="form-control"
                                  onChange={(e) =>
                                    handleImageFileChange(
                                      "homepage",
                                      `carousel-${index}`,
                                      e
                                    )
                                  } // Use a unique key for file state
                                  disabled={savingHomepage}
                                  accept="image/*"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      )}
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() =>
                          handleAddItem("homepage", "carouselItems", null, {
                            // fieldName is null
                            image_url: "",
                            title: "",
                            text: "",
                            link_text: "",
                            link_url: "",
                          })
                        }
                        disabled={savingHomepage}
                      >
                        <i className="fas fa-plus me-1"></i> Add Carousel Item
                      </button>
                    </div>

                    {(homepageContent.sections || []).map((section) => (
                      <div className="mb-4" key={section.name}>
                        <h4 className="mb-3">{section.title}</h4>
                        <div className="mb-3">
                          <label className="form-label">Section Title</label>
                          <input
                            type="text"
                            className="form-control"
                            value={section.title || ""}
                            onChange={(e) =>
                              handleHomepageChange(
                                section.name,
                                "title",
                                e.target.value
                              )
                            } // sectionName, fieldName, value
                            disabled={savingHomepage}
                          />
                        </div>

                        {section.name === "aboutCompany" && (
                          <>
                            <div className="mb-3">
                              <label className="form-label">Paragraphs</label>
                              {(section.paragraphs || []).map(
                                (
                                  para,
                                  index // Added null check
                                ) => (
                                  <div
                                    className="input-group mb-2"
                                    key={`para-${index}`}
                                  >
                                    <textarea
                                      className="form-control"
                                      rows="5"
                                      value={para || ""}
                                      onChange={(e) =>
                                        handleHomepageChange(
                                          section.name,
                                          "paragraphs",
                                          e.target.value,
                                          index
                                        )
                                      } // sectionName, fieldName, value, itemIndex
                                      disabled={savingHomepage}
                                      placeholder={`Paragraph ${index + 1}`}
                                    />
                                    {/* Remove button for paragraphs */}
                                    {section.paragraphs &&
                                      (section.paragraphs.length > 1 ||
                                        index === 0) && ( // Added null check
                                        <button
                                          type="button"
                                          className="btn btn-outline-danger"
                                          onClick={() =>
                                            handleRemoveItem(
                                              "homepage",
                                              section.name,
                                              "paragraphs",
                                              index
                                            )
                                          }
                                          disabled={savingHomepage}
                                        >
                                          <i className="fas fa-trash-alt me-1"></i>{" "}
                                          Remove
                                        </button>
                                      )}
                                  </div>
                                )
                              )}
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() =>
                                  handleAddItem(
                                    "homepage",
                                    section.name,
                                    "paragraphs",
                                    ""
                                  )
                                } // Add empty string as default
                                disabled={savingHomepage}
                              >
                                <i className="fas fa-plus me-1"></i> Add
                                Paragraph
                              </button>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Image</label>
                              {section.image_url && (
                                <div className="mb-2">
                                  <img
                                    src={section.image_url}
                                    alt={`${section.name}`}
                                    className="img-thumbnail me-2"
                                    style={{ width: "100px", height: "auto" }}
                                  />
                                  {/* Optional: Add a button to remove the existing image */}
                                </div>
                              )}
                              <input
                                type="file"
                                className="form-control"
                                onChange={(e) =>
                                  handleImageFileChange(
                                    "homepage",
                                    section.name,
                                    e
                                  )
                                } // Pass page and section name
                                disabled={savingHomepage}
                                accept="image/*"
                              />
                            </div>
                          </>
                        )}
                        {section.name === "coreStrengths" && (
                          <>
                            {/* Features (Array of objects) */}
                            <div className="mb-3">
                              <label className="form-label">Features</label>
                              {(section.features || []).map(
                                (
                                  feature,
                                  index // Added null check
                                ) => (
                                  <div
                                    className="card mb-2 p-3"
                                    key={`feature-${index}`}
                                  >
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                      <h6 className="m-0">
                                        Feature {index + 1}
                                      </h6>
                                      {section.features &&
                                        section.features.length > 1 && ( // Added null check
                                          <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() =>
                                              handleRemoveItem(
                                                "homepage",
                                                section.name,
                                                "features",
                                                index
                                              )
                                            }
                                            disabled={savingHomepage}
                                          >
                                            <i className="fas fa-trash-alt me-1"></i>{" "}
                                            Remove Feature
                                          </button>
                                        )}
                                    </div>
                                    <div className="row g-2">
                                      <div className="col-md-4">
                                        <label className="form-label">
                                          Icon Class
                                        </label>
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={feature.icon_class || ""}
                                          onChange={(e) =>
                                            handleHomepageChange(
                                              section.name,
                                              "features",
                                              e.target.value,
                                              index,
                                              "icon_class"
                                            )
                                          }
                                          disabled={savingHomepage}
                                          placeholder="e.g., fas fa-leaf"
                                        />
                                        {feature.icon_class && (
                                          <i
                                            className={`${feature.icon_class} mt-2 me-1`}
                                          ></i>
                                        )}
                                      </div>
                                      <div className="col-md-4">
                                        <label className="form-label">
                                          Title
                                        </label>
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={feature.title || ""}
                                          onChange={(e) =>
                                            handleHomepageChange(
                                              section.name,
                                              "features",
                                              e.target.value,
                                              index,
                                              "title"
                                            )
                                          }
                                          disabled={savingHomepage}
                                          placeholder="Feature Title"
                                        />
                                      </div>
                                      <div className="col-md-4">
                                        <label className="form-label">
                                          Description
                                        </label>
                                        <textarea
                                          className="form-control"
                                          rows="4
                                          "
                                          value={feature.description || ""}
                                          onChange={(e) =>
                                            handleHomepageChange(
                                              section.name,
                                              "features",
                                              e.target.value,
                                              index,
                                              "description"
                                            )
                                          }
                                          disabled={savingHomepage}
                                          placeholder="Feature Description"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                              {/* Add Feature button */}
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() =>
                                  handleAddItem(
                                    "homepage",
                                    section.name,
                                    "features",
                                    {
                                      icon_class: "",
                                      title: "",
                                      description: "",
                                    }
                                  )
                                }
                                disabled={savingHomepage}
                              >
                                <i className="fas fa-plus me-1"></i> Add Feature
                              </button>
                            </div>
                          </>
                        )}

                        {section.name === "productCategories" && (
                          // This section doesn't have editable content other than the title,
                          // as categories are managed elsewhere.
                          <div>
                            <p className="text-muted">
                              Categories are managed in the Categories section.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      type="submit"
                      className="btn btn-dark mt-3"
                      disabled={savingHomepage}
                    >
                      {savingHomepage ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>{" "}
                          Saving Homepage...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i> Save Homepage
                          Content
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
          <div
            className="tab-pane fade"
            id="about-pane"
            role="tabpanel"
            aria-labelledby="about-tab"
            tabIndex="0"
          >
            {loadingAbout ? (
              <div>Loading About Page Content...</div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <h3 className="h5 card-title mb-4">About Page Content</h3>
                  {/* Placeholder for About page form */}
                  <form onSubmit={onSaveAbout}>
                    {/* Implement form fields for About page sections here */}
                    {/* Example: A Glance Section */}
                    {aboutContent.sections &&
                      aboutContent.sections.find(
                        (s) => s.name === "aboutGlance"
                      ) && (
                        <div className="mb-4">
                          <h4>A Glance at Sunrise Papers</h4>
                          {/* Input for title */}
                          <div className="mb-3">
                            <label className="form-label">Section Title</label>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                aboutContent.sections.find(
                                  (s) => s.name === "aboutGlance"
                                ).title || ""
                              }
                              onChange={(e) =>
                                handleAboutChange(
                                  "aboutGlance",
                                  "title",
                                  e.target.value
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                          {/* Textarea for paragraphs */}
                          <div className="mb-3">
                            <label className="form-label">
                              Paragraphs (Use double line breaks for new
                              paragraphs)
                            </label>
                            <textarea
                              className="form-control"
                              rows="10"
                              value={(
                                aboutContent.sections.find(
                                  (s) => s.name === "aboutGlance"
                                ).paragraphs || []
                              ).join("\n\n")}
                              onChange={(e) =>
                                handleAboutChange(
                                  "aboutGlance",
                                  "paragraphs",
                                  e.target.value.split("\n\n")
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                          {/* Image upload */}
                          <div className="mb-3">
                            <label className="form-label">Image</label>
                            {aboutContent.sections.find(
                              (s) => s.name === "aboutGlance"
                            ).image_url && (
                              <div className="mb-2">
                                <img
                                  src={
                                    aboutContent.sections.find(
                                      (s) => s.name === "aboutGlance"
                                    ).image_url
                                  }
                                  alt="Glance"
                                  className="img-thumbnail"
                                  style={{ width: "100px", height: "auto" }}
                                />
                              </div>
                            )}
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) =>
                                handleImageFileChange("about", "aboutGlance", e)
                              }
                              disabled={savingAbout}
                              accept="image/*"
                            />
                          </div>
                        </div>
                      )}

                    {/* Example: Paper Supply Philosophy Section */}
                    {aboutContent.sections &&
                      aboutContent.sections.find(
                        (s) => s.name === "philosophy"
                      ) && (
                        <div className="mb-4">
                          <h4>Paper Supply Philosophy</h4>
                          <div className="mb-3">
                            <label className="form-label">Section Title</label>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                aboutContent.sections.find(
                                  (s) => s.name === "philosophy"
                                ).title || ""
                              }
                              onChange={(e) =>
                                handleAboutChange(
                                  "philosophy",
                                  "title",
                                  e.target.value
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Icon Class</label>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                aboutContent.sections.find(
                                  (s) => s.name === "philosophy"
                                ).icon_class || ""
                              }
                              onChange={(e) =>
                                handleAboutChange(
                                  "philosophy",
                                  "icon_class",
                                  e.target.value
                                )
                              }
                              disabled={savingAbout}
                              placeholder="e.g., fas fa-lightbulb"
                            />
                            {aboutContent.sections.find(
                              (s) => s.name === "philosophy"
                            ).icon_class && (
                              <i
                                className={`${
                                  aboutContent.sections.find(
                                    (s) => s.name === "philosophy"
                                  ).icon_class
                                } mt-2 me-1`}
                              ></i>
                            )}
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Paragraph</label>
                            <textarea
                              className="form-control"
                              rows="4"
                              value={
                                aboutContent.sections.find(
                                  (s) => s.name === "philosophy"
                                ).paragraph || ""
                              }
                              onChange={(e) =>
                                handleAboutChange(
                                  "philosophy",
                                  "paragraph",
                                  e.target.value
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                        </div>
                      )}

                    {/* Example: Our Leadership Section */}
                    {aboutContent.sections &&
                      aboutContent.sections.find(
                        (s) => s.name === "leadership"
                      ) && (
                        <div className="mb-4">
                          <h4>Our Leadership</h4>
                          <div className="mb-3">
                            <label className="form-label">Section Title</label>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                aboutContent.sections.find(
                                  (s) => s.name === "leadership"
                                ).title || ""
                              }
                              onChange={(e) =>
                                handleAboutChange(
                                  "leadership",
                                  "title",
                                  e.target.value
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Quote</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              value={
                                aboutContent.sections.find(
                                  (s) => s.name === "leadership"
                                ).quote || ""
                              }
                              onChange={(e) =>
                                handleAboutChange(
                                  "leadership",
                                  "quote",
                                  e.target.value
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Quote Author</label>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                aboutContent.sections.find(
                                  (s) => s.name === "leadership"
                                ).quote_author || ""
                              }
                              onChange={(e) =>
                                handleAboutChange(
                                  "leadership",
                                  "quote_author",
                                  e.target.value
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Paragraph</label>
                            <textarea
                              className="form-control"
                              rows="4"
                              value={
                                aboutContent.sections.find(
                                  (s) => s.name === "leadership"
                                ).paragraph || ""
                              }
                              onChange={(e) =>
                                handleAboutChange(
                                  "leadership",
                                  "paragraph",
                                  e.target.value
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                          {/* Image upload */}
                          <div className="mb-3">
                            <label className="form-label">Image</label>
                            {aboutContent.sections.find(
                              (s) => s.name === "leadership"
                            ).image_url && (
                              <div className="mb-2">
                                <img
                                  src={
                                    aboutContent.sections.find(
                                      (s) => s.name === "leadership"
                                    ).image_url
                                  }
                                  alt="Leadership"
                                  className="img-thumbnail"
                                  style={{ width: "100px", height: "auto" }}
                                />
                              </div>
                            )}
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) =>
                                handleImageFileChange("about", "leadership", e)
                              }
                              disabled={savingAbout}
                              accept="image/*"
                            />
                          </div>
                        </div>
                      )}

                    {/* Example: Company Profile Section */}
                    {aboutContent.sections &&
                      aboutContent.sections.find(
                        (s) => s.name === "companyProfile"
                      ) && (
                        <div className="mb-4">
                          <h4>Company Profile</h4>
                          <div className="mb-3">
                            <label className="form-label">Section Title</label>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                aboutContent.sections.find(
                                  (s) => s.name === "companyProfile"
                                ).title || ""
                              }
                              onChange={(e) =>
                                handleAboutChange(
                                  "companyProfile",
                                  "title",
                                  e.target.value
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                          {/* Image upload */}
                          <div className="mb-3">
                            <label className="form-label">Image</label>
                            {aboutContent.sections.find(
                              (s) => s.name === "companyProfile"
                            ).image_url && (
                              <div className="mb-2">
                                <img
                                  src={
                                    aboutContent.sections.find(
                                      (s) => s.name === "companyProfile"
                                    ).image_url
                                  }
                                  alt="Company Profile"
                                  className="img-thumbnail"
                                  style={{ width: "100px", height: "auto" }}
                                />
                              </div>
                            )}
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) =>
                                handleImageFileChange(
                                  "about",
                                  "companyProfile",
                                  e
                                )
                              }
                              disabled={savingAbout}
                              accept="image/*"
                            />
                          </div>
                          {/* Info List (Array of objects) */}
                          <div className="mb-3">
                            <label className="form-label">
                              Company Info List
                            </label>
                            {(
                              aboutContent.sections.find(
                                (s) => s.name === "companyProfile"
                              ).info_list || []
                            ).map(
                              (
                                item,
                                index // Added null check
                              ) => (
                                <div
                                  className="card mb-2 p-3"
                                  key={`info-${index}`}
                                >
                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="m-0">Item {index + 1}</h6>
                                    {aboutContent.sections.find(
                                      (s) => s.name === "companyProfile"
                                    ).info_list &&
                                      aboutContent.sections.find(
                                        (s) => s.name === "companyProfile"
                                      ).info_list.length > 1 && ( // Added null check
                                        <button
                                          type="button"
                                          className="btn btn-outline-danger btn-sm"
                                          onClick={() =>
                                            handleRemoveItem(
                                              "about",
                                              "companyProfile",
                                              "info_list",
                                              index
                                            )
                                          }
                                          disabled={savingAbout}
                                        >
                                          <i className="fas fa-trash-alt me-1"></i>{" "}
                                          Remove Item
                                        </button>
                                      )}
                                  </div>
                                  <div className="row g-2">
                                    <div className="col-md-4">
                                      <label className="form-label">
                                        Icon Class
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={item.icon_class || ""}
                                        onChange={(e) =>
                                          handleAboutChange(
                                            "companyProfile",
                                            "info_list",
                                            e.target.value,
                                            index,
                                            "icon_class"
                                          )
                                        }
                                        disabled={savingAbout}
                                        placeholder="e.g., fas fa-dot-circle"
                                      />
                                      {item.icon_class && (
                                        <i
                                          className={`${item.icon_class} mt-2 me-1`}
                                        ></i>
                                      )}
                                    </div>
                                    <div className="col-md-4">
                                      <label className="form-label">
                                        Label
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={item.label || ""}
                                        onChange={(e) =>
                                          handleAboutChange(
                                            "companyProfile",
                                            "info_list",
                                            e.target.value,
                                            index,
                                            "label"
                                          )
                                        }
                                        disabled={savingAbout}
                                        placeholder="e.g., Nature of Business"
                                      />
                                    </div>
                                    <div className="col-md-4">
                                      <label className="form-label">
                                        Value
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={item.value || ""}
                                        onChange={(e) =>
                                          handleAboutChange(
                                            "companyProfile",
                                            "info_list",
                                            e.target.value,
                                            index,
                                            "value"
                                          )
                                        }
                                        disabled={savingAbout}
                                        placeholder="e.g., Trader and Importer"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                            {/* Add Item button */}
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() =>
                                handleAddItem(
                                  "about",
                                  "companyProfile",
                                  "info_list",
                                  { icon_class: "", label: "", value: "" }
                                )
                              }
                              disabled={savingAbout}
                            >
                              <i className="fas fa-plus me-1"></i> Add Item
                            </button>
                          </div>
                        </div>
                      )}

                    {/* Example: Why Us Section */}
                    {aboutContent.sections &&
                      aboutContent.sections.find((s) => s.name === "whyUs") && (
                        <div className="mb-4">
                          <h4>WHY US ?</h4>
                          <div className="mb-3">
                            <label className="form-label">Section Title</label>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                aboutContent.sections.find(
                                  (s) => s.name === "whyUs"
                                ).title || ""
                              }
                              onChange={(e) =>
                                handleAboutChange(
                                  "whyUs",
                                  "title",
                                  e.target.value
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">
                              Intro Paragraph
                            </label>
                            <textarea
                              className="form-control"
                              rows="4"
                              value={
                                aboutContent.sections.find(
                                  (s) => s.name === "whyUs"
                                ).intro_paragraph || ""
                              }
                              onChange={(e) =>
                                handleAboutChange(
                                  "whyUs",
                                  "intro_paragraph",
                                  e.target.value
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                          {/* Values List (Array of objects) */}
                          <div className="mb-3">
                            <label className="form-label">Values List</label>
                            {(
                              aboutContent.sections.find(
                                (s) => s.name === "whyUs"
                              ).values_list || []
                            ).map(
                              (
                                item,
                                index // Added null check
                              ) => (
                                <div
                                  className="input-group mb-2"
                                  key={`value-${index}`}
                                >
                                  <span className="input-group-text">
                                    <input
                                      type="text"
                                      className="form-control-plaintext"
                                      style={{ width: "150px" }}
                                      value={item.icon_class || ""}
                                      onChange={(e) =>
                                        handleAboutChange(
                                          "whyUs",
                                          "values_list",
                                          e.target.value,
                                          index,
                                          "icon_class"
                                        )
                                      }
                                      disabled={savingAbout}
                                      placeholder="fas fa-icon"
                                    />
                                    {item.icon_class && (
                                      <i
                                        className={`${item.icon_class} mt-1 ms-1`}
                                      ></i>
                                    )}
                                  </span>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={item.text || ""}
                                    onChange={(e) =>
                                      handleAboutChange(
                                        "whyUs",
                                        "values_list",
                                        e.target.value,
                                        index,
                                        "text"
                                      )
                                    }
                                    disabled={savingAbout}
                                    placeholder="Value Text"
                                  />
                                  {aboutContent.sections.find(
                                    (s) => s.name === "whyUs"
                                  ).values_list &&
                                    aboutContent.sections.find(
                                      (s) => s.name === "whyUs"
                                    ).values_list.length > 1 && ( // Added null check
                                      <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() =>
                                          handleRemoveItem(
                                            "about",
                                            "whyUs",
                                            "values_list",
                                            index
                                          )
                                        }
                                        disabled={savingAbout}
                                      >
                                        <i className="fas fa-trash-alt me-1"></i>{" "}
                                        Remove
                                      </button>
                                    )}
                                </div>
                              )
                            )}
                            {/* Add Item button */}
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() =>
                                handleAddItem("about", "whyUs", "values_list", {
                                  icon_class: "",
                                  text: "",
                                })
                              }
                              disabled={savingAbout}
                            >
                              <i className="fas fa-plus me-1"></i> Add Value
                            </button>
                          </div>
                        </div>
                      )}

                    {/* Example: Quality Assurance Section */}
                    {aboutContent.sections &&
                      aboutContent.sections.find(
                        (s) => s.name === "qualityAssurance"
                      ) && (
                        <div className="mb-4">
                          <h4>Our Commitment to Quality</h4>
                          <div className="mb-3">
                            <label className="form-label">Section Title</label>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                aboutContent.sections.find(
                                  (s) => s.name === "qualityAssurance"
                                ).title || ""
                              }
                              onChange={(e) =>
                                handleAboutChange(
                                  "qualityAssurance",
                                  "title",
                                  e.target.value
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                          {/* Image upload */}
                          <div className="mb-3">
                            <label className="form-label">Image</label>
                            {aboutContent.sections.find(
                              (s) => s.name === "qualityAssurance"
                            ).image_url && (
                              <div className="mb-2">
                                <img
                                  src={
                                    aboutContent.sections.find(
                                      (s) => s.name === "qualityAssurance"
                                    ).image_url
                                  }
                                  alt="Quality"
                                  className="img-thumbnail"
                                  style={{ width: "100px", height: "auto" }}
                                />
                              </div>
                            )}
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) =>
                                handleImageFileChange(
                                  "about",
                                  "qualityAssurance",
                                  e
                                )
                              }
                              disabled={savingAbout}
                              accept="image/*"
                            />
                          </div>
                          {/* Paragraphs */}
                          <div className="mb-3">
                            <label className="form-label">
                              Paragraphs (Use double line breaks for new
                              paragraphs)
                            </label>
                            <textarea
                              className="form-control"
                              rows="10"
                              value={(
                                aboutContent.sections.find(
                                  (s) => s.name === "qualityAssurance"
                                ).paragraphs || []
                              ).join("\n\n")}
                              onChange={(e) =>
                                handleAboutChange(
                                  "qualityAssurance",
                                  "paragraphs",
                                  e.target.value.split("\n\n")
                                )
                              }
                              disabled={savingAbout}
                            />
                          </div>
                        </div>
                      )}

                    {/* Save Button for About Page */}
                    <button
                      type="submit"
                      className="btn btn-dark mt-3"
                      disabled={savingAbout}
                    >
                      {savingAbout ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>{" "}
                          Saving About Page...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i> Save About Page
                          Content
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
          <div
            className="tab-pane fade"
            id="contact-pane"
            role="tabpanel"
            aria-labelledby="contact-tab"
            tabIndex="0"
          >
            {loadingContact ? (
              <div>Loading Contact Page Content ...</div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <h3 className="h5 card-title mb-4">Contact Page Content</h3>

                  {contactContent.sections &&
                    contactContent.sections.find(
                      (s) => s.name === "details"
                    ) && (
                      <div className="mb-4">
                        <h4>Our Details</h4>
                        <div className="mb-3">
                          <label className="form-label">Intro Paragraph</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={
                              contactContent.sections.find(
                                (s) => s.name === "details"
                              ).intro_paragraph || ""
                            }
                            onChange={(e) =>
                              handleContactChange(
                                "details",
                                "intro_paragraph",
                                e.target.value
                              )
                            }
                            disabled={savingContact}
                          />
                        </div>
                        {/* Contact Info List (Array of objects) */}
                        <div className="mb-3">
                          <label className="form-label">
                            Contact Info List
                          </label>
                          {(
                            contactContent.sections.find(
                              (s) => s.name === "details"
                            ).contact_info || []
                          ).map((item, index) => (
                            <div
                              className="card mb-2 p-3"
                              key={`contact-info-${index}`}
                            >
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="m-0">
                                  Contact Detail {index + 1}
                                </h6>
                                {contactContent.sections.find(
                                  (s) => s.name === "details"
                                ).contact_info &&
                                  contactContent.sections.find(
                                    (s) => s.name === "details"
                                  ).contact_info.length > 1 && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() =>
                                        handleRemoveItem(
                                          "contact",
                                          "details",
                                          "contact_info",
                                          index
                                        )
                                      }
                                      disabled={savingContact}
                                    >
                                      <i className="fas fa-trash-alt me-1"></i>{" "}
                                      Remove Detail
                                    </button>
                                  )}
                              </div>
                              <div className="row g-2">
                                <div className="col-md-4">
                                  <label className="form-label">
                                    Icon Class
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={item.icon_class || ""}
                                    onChange={(e) =>
                                      handleContactChange(
                                        "details",
                                        "contact_info",
                                        e.target.value,
                                        index,
                                        "icon_class"
                                      )
                                    }
                                    disabled={savingContact}
                                    placeholder="e.g., fas fa-map-marker-alt"
                                  />
                                  {item.icon_class && (
                                    <i
                                      className={`${item.icon_class} mt-2 me-1`}
                                    ></i>
                                  )}
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label">Text</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={item.text || ""}
                                    onChange={(e) =>
                                      handleContactChange(
                                        "details",
                                        "contact_info",
                                        e.target.value,
                                        index,
                                        "text"
                                      )
                                    }
                                    disabled={savingContact}
                                    placeholder="Contact Text"
                                  />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label">
                                    Link URL (Optional)
                                  </label>
                                  <input
                                    type="url"
                                    className="form-control"
                                    value={item.link_url || ""}
                                    onChange={(e) =>
                                      handleContactChange(
                                        "details",
                                        "contact_info",
                                        e.target.value,
                                        index,
                                        "link_url"
                                      )
                                    }
                                    disabled={savingContact}
                                    placeholder="e.g., tel:+..., mailto:..., https://maps.app.goo.gl/..."
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          {/* Add Item button */}
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() =>
                              handleAddItem(
                                "contact",
                                "details",
                                "contact_info",
                                { icon_class: "", text: "", link_url: "" }
                              )
                            }
                            disabled={savingContact}
                          >
                            <i className="fas fa-plus me-1"></i> Add Contact
                            Detail
                          </button>
                        </div>

                        {/* Business Hours */}
                        <div className="mb-3">
                          <label className="form-label">
                            Business Hours Title
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={
                              contactContent.sections.find(
                                (s) => s.name === "details"
                              ).business_hours_title || ""
                            }
                            onChange={(e) =>
                              handleContactChange(
                                "details",
                                "business_hours_title",
                                e.target.value
                              )
                            }
                            disabled={savingContact}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Business Hours Text (Use line breaks for new lines)
                          </label>
                          <textarea
                            className="form-control"
                            rows="4"
                            value={
                              contactContent.sections.find(
                                (s) => s.name === "details"
                              ).business_hours_text || ""
                            }
                            onChange={(e) =>
                              handleContactChange(
                                "details",
                                "business_hours_text",
                                e.target.value
                              )
                            }
                            disabled={savingContact}
                          />
                        </div>

                        {/* Map Embed URL */}
                        <div className="mb-3">
                          <label className="form-label">
                            Google Maps Embed URL
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={
                              contactContent.sections.find(
                                (s) => s.name === "details"
                              ).map_embed_url || ""
                            }
                            onChange={(e) =>
                              handleContactChange(
                                "details",
                                "map_embed_url",
                                e.target.value
                              )
                            }
                            disabled={savingContact}
                            placeholder="Paste the embed URL here"
                          />
                          <div className="form-text">
                            Get this from Google Maps "Share" - "Embed a map".
                          </div>
                        </div>
                        {/* Optional: Image upload for map (if you want to replace embed with image) */}
                        {/* <div className="mb-3">
                                            <label className="form-label">Map Image (Alternative to Embed)</label>
                                             {contactContent.sections.find(s => s.name === 'details').map_image_url && (
                                                  <div className="mb-2">
                                                      <img src={contactContent.sections.find(s => s.name === 'details').map_image_url} alt="Map Image" className="img-thumbnail" style={{ width: '100px', height: 'auto' }} />
                                                  </div>
                                             )}
                                            <input type="file" className="form-control" onChange={(e) => handleImageFileChange('contact', 'mapImage', e)} disabled={savingContact} accept="image/*" />
                                             <div className="form-text">Upload an image instead of embedding a live map.</div>
                                        </div> */}
                      </div>
                    )}
                  <button
                    type="submit"
                    className="btn btn-dark mt-3"
                    onClick={onSaveContact}
                    disabled={savingContact}
                  >
                    {savingContact ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>{" "}
                        Saving Contact Page...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-1"></i> Save Contact Page
                        Content
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
};

export default ContentManagement;
