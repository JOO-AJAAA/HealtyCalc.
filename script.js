document.addEventListener("DOMContentLoaded", () => {
  const beratBadanInput = document.querySelector(".BeratBadan");
  const searchInput = document.querySelector(".searchInfo");
  const theInfoContainer = document.querySelector(".theInfo");
  const putThereContainer = document.querySelector(".putThere");
  const btnHitungContainer = document.querySelector(".btn-hitung-container");
  const btnHitung = document.querySelector(".btn-hitung");
  const hasilKalori = document.querySelector(".hasilKalori");

  let selectedActivities = new Set();

  function validateInput(input, min, max) {
    const value = parseFloat(input.value);
    return !isNaN(value) && value >= min && value <= max;
  }

  function updateHitungButtonVisibility() {
    btnHitungContainer.style.display = 
      putThereContainer.children.length > 0 ? "block" : "none";
  }

  fetch("DataOlahraga.json")
    .then((response) => response.json())
    .then((data) => {
      const activities = data.activities;

      function displayActivities(filter = "") {
        theInfoContainer.innerHTML = "";
        if (filter.trim() === "") return;

        const filteredActivities = activities.filter((activity) =>
          activity.name.toLowerCase().includes(filter.toLowerCase())
        );

        filteredActivities.forEach((activity) => {
          if (selectedActivities.has(activity.name)) return;
          const card = document.createElement("div");
          card.className = "raw-md-6 mb-3";
          card.innerHTML = `
          <div class="card">
            <div class="card-body bg-success bg-opacity-75 text-white d-flex justify-content-between align-items-center">
              <div class="d-flex flex-column flex-md-row align-items-md-center">
                  <img style="width: 70px;height:70px;border-radius:20%;margin-right:23px" class="activtyImages" src="${activity.pictureActivty}" alt="">
                <h5 class="card-title me-3">${activity.name}</h5>
                <small class="card-text-secondary mb-0">${activity.calories_per_minute} Kalori/menit</small>
              </div>
              <button class="btn btn-add" data-name="${activity.name}" data-calories="${activity.calories_per_minute}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
            </svg>
            </button>
            </div>
          </div>
          `;
          theInfoContainer.appendChild(card);
        });
      }

      function addToSelected(name, calories) {
        if (selectedActivities.has(name)) return;

        selectedActivities.add(name);
        const card = document.createElement("div");
        card.className = "col-md-4 mb-3";
        card.innerHTML = `
        <div class="card">
          <div class="card-body">
            <div class="modal-header">
                                    <h5 class="card-titles">${name}</h5>
                         <button class="btn btn-danger btn-remove input-group-text">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
</svg>          </button>
        </div>
            <small class="card-text">${calories} Kalori/menit</small>
            <div class="input-group">
              <input type="number" 
                placeholder="Durasi (menit)" 
                class="form-control activity-duration" 
                data-calories="${calories}"
                min="1"
                max="240"
              >

            </div>
          </div>
        </div>
      `;
        putThereContainer.appendChild(card);
        updateHitungButtonVisibility();
      }

      searchInput.addEventListener("input", () => {
        displayActivities(searchInput.value);
      });

      theInfoContainer.addEventListener("click", (event) => {
        const addButton = event.target.closest(".btn-add");
        if (addButton) {
          const name = addButton.getAttribute("data-name");
          const calories = addButton.getAttribute("data-calories");
          addToSelected(name, calories);
        }
      });

      putThereContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("btn-remove")) {
          const card = event.target.closest(".col-md-4");
          const name = card.querySelector(".card-titles").textContent;
          selectedActivities.delete(name);
          card.remove();
          updateHitungButtonVisibility();
        }
      });

      btnHitung.addEventListener("click", () => {
        if (!validateInput(beratBadanInput, 7, 1000)) {
          alert("Saya Pikir berat badan segitu kurang meyakinkan 😕!");
          return;
        }

        const beratBadan = parseFloat(beratBadanInput.value);
        const durations = document.querySelectorAll(".activity-duration");
        let totalCalories = 0;

        // Metode Perhitungan Metabolic Equivalent (MET)
        durations.forEach((input) => {
          const duration = parseFloat(input.value);
          const caloriesPerMinute = parseFloat(input.dataset.calories);
          
          if (validateInput(input, 1, 2400)) {
            // Rumus MET yang lebih presisi
            const calories = (caloriesPerMinute * duration * beratBadan * 3.5) / 200;
            totalCalories += calories;
          }
        });

        hasilKalori.textContent = `Total Kalori Dibakar: ${totalCalories.toFixed(2)}`;
        new bootstrap.Modal(document.getElementById("resultModal")).show();
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Gagal memuat data aktivitas. Silakan coba lagi.");
    });
});