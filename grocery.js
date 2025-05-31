const container = document.getElementById("groceryList");

// 1. Pull recipes from localStorage
let saved = JSON.parse(localStorage.getItem("cookbook")) || [];

// 2. Fetch all ingredient lists
let allIngredients = [];

async function buildList() {
  for (const recipe of saved) {
    const res = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=3b5fd187fe374deab2b8c082fd79dc08`);
    const data = await res.json();
    if (data.extendedIngredients) {
      allIngredients.push(...data.extendedIngredients.map(ing => ing.original));
    }
  }

  // 3. Remove duplicates and sort
  const uniqueIngredients = [...new Set(allIngredients)].sort();

  // 4. Render checkboxes
  container.innerHTML = uniqueIngredients.map(item => `
    <div class="grocery-item">
      <input type="checkbox" id="${item}" />
      <label for="${item}">${item}</label>
    </div>
  `).join("");
}

// 5. Export as .txt
function exportTxt() {
  const items = Array.from(document.querySelectorAll('.grocery-item label'))
    .map(label => `- ${label.textContent}`);
  const blob = new Blob([items.join("\n")], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "grocery-list.txt";
  a.click();
}

// 6. Export as .pdf using jsPDF
async function exportPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Smart Grocery List", 20, 20);

  const items = Array.from(document.querySelectorAll('.grocery-item label'))
    .map(label => `• ${label.textContent}`);

  items.forEach((item, i) => {
    doc.text(item, 20, 30 + i * 10);
  });

  doc.save("grocery-list.pdf");
}

buildList();