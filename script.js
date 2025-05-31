const apiKey = "3b5fd187fe374deab2b8c082fd79dc08"; // Replace with your key

document.addEventListener("DOMContentLoaded", () => {
  // SEARCH BUTTON
  const searchButton = document.querySelector("button.btn-primary");
  const inputField = document.querySelector("input");

  searchButton.addEventListener("click", async () => {
    const input = inputField.value.trim();
    if (!input) {
      alert("Please enter at least one ingredient.");
      return;
    }

    // Hide sections
    document.getElementById("categorySection").style.display = "none";
    document.getElementById("featuredSection").style.display = "none";

    const endpoint = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(input)}&number=6&apiKey=${apiKey}`;
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      displayRecipes(data);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  });

  // DISPLAY RECIPE CARDS
  function displayRecipes(recipes) {
    const container = document.querySelector(".recipe-cards");
    container.innerHTML = "";

    if (recipes.length === 0) {
      container.innerHTML = "<p>No recipes found. Try a different ingredient.</p>";
      return;
    }

    recipes.forEach(recipe => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}" />
        <h4>${recipe.title}</h4>
        <button class="btn btn-primary save-btn" data-id="${recipe.id}" data-title="${recipe.title}" data-img="${recipe.image}">Save to Cookbook</button>
      `;

      card.querySelector(".save-btn").addEventListener("click", e => {
        e.stopPropagation();
        const btn = e.target;
        const recipeData = {
          id: btn.dataset.id,
          title: btn.dataset.title,
          image: btn.dataset.img
        };
        saveToCookbook(recipeData);
      });

      card.addEventListener("click", () => fetchRecipeDetails(recipe.id));
      container.appendChild(card);
    });
  }

  // FETCH RECIPE DETAILS
  function fetchRecipeDetails(id) {
    fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`)
      .then(res => res.json())
      .then(data => showRecipeModal(data));
  }

  // SHOW MODAL
  function showRecipeModal(recipe) {
    document.getElementById("modal-title").textContent = recipe.title;
    document.getElementById("modal-image").src = recipe.image;
    document.getElementById("modal-summary").innerHTML = recipe.summary;
    document.getElementById("modal-link").href = recipe.sourceUrl;

    // Ingredients
    const ingredientsList = document.getElementById("modal-ingredients");
    ingredientsList.innerHTML = "";
    recipe.extendedIngredients.forEach(ing => {
      const li = document.createElement("li");
      li.textContent = ing.original;
      ingredientsList.appendChild(li);
    });

    // Instructions
    const instructionsList = document.getElementById("modal-instructions");
    instructionsList.innerHTML = "";
    if (recipe.analyzedInstructions.length > 0) {
      recipe.analyzedInstructions[0].steps.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step.step;
        instructionsList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "No instructions available.";
      instructionsList.appendChild(li);
    }

    document.getElementById("recipeModal").classList.remove("hidden");
  }

  document.getElementById("closeModalBtn").addEventListener("click", () => {
    document.getElementById("recipeModal").classList.add("hidden");
  });

  // SAVE TO COOKBOOK
  function saveToCookbook(recipe) {
    let saved = JSON.parse(localStorage.getItem("cookbook")) || [];
    if (saved.some(item => item.id === recipe.id)) {
      showToast("Already in your Cookbook!");
      return;
    }
    saved.push(recipe);
    localStorage.setItem("cookbook", JSON.stringify(saved));
    showToast(`Saved “${recipe.title}” to your Cookbook!`);
  }

  // TOAST MESSAGE
  function showToast(message = "Saved to Cookbook!") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.remove("show");
      toast.classList.add("hidden");
    }, 2000);
  }

  // CATEGORY FILTER
  document.querySelectorAll(".cat-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".cat-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      fetchCategoryRecipes(card.dataset.category);
    });
  });

  function fetchCategoryRecipes(category) {
    fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${category}&number=6&apiKey=${apiKey}`)
      .then(res => res.json())
      .then(data => displayRecipes(data.results));
  }
});