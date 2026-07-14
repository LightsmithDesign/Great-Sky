import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function initBackground() {
  try {
    // 1. Fetch config from server
    const response = await fetch("/api/firebase-config");
    if (!response.ok) return;
    const config = await response.json();

    // 2. Initialize Firebase
    const app = initializeApp(config);
    const db = getFirestore(app);

    // 3. Query active background from 'backgrounds' collection
    const bgQuery = query(
      collection(db, "backgrounds"),
      where("active", "==", true),
      limit(1)
    );
    const querySnapshot = await getDocs(bgQuery);
    
    let bgUrl = "";
    if (!querySnapshot.empty) {
      const activeBg = querySnapshot.docs[0].data();
      bgUrl = activeBg.url;
    }

    if (bgUrl) {
      // Find all texture-layer elements and update them
      const textureLayers = document.querySelectorAll(".texture-layer.texture-drift, .page-hero .texture-layer");
      textureLayers.forEach(layer => {
        layer.style.backgroundImage = `url('${bgUrl}')`;
        layer.style.backgroundSize = "cover";
        layer.style.backgroundPosition = "center";
        // Boost opacity slightly if the custom background is dark/refined
        layer.style.opacity = "0.45";
      });

      // Special handling for the main Hero if it's there
      const hero = document.getElementById("hero");
      if (hero) {
        const skySvg = hero.querySelector(".hero-sky");
        if (skySvg) {
          // Dim the default sky arcs visual elements slightly so the uploaded image shines
          skySvg.style.opacity = "0.35";
        }
      }
    }
  } catch (err) {
    console.warn("Failed to load custom background from Firestore (falling back to defaults):", err);
  }
}

// Execute background initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBackground);
} else {
  initBackground();
}
