document.addEventListener("DOMContentLoaded", function () {
    loadEntries();
    loadPrices(); // Load saved milk and curd prices
});

document.getElementById("milkForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let date = document.getElementById("date").value;
    let quantity = parseFloat(document.getElementById("quantity").value);
    let curdDelivered = document.querySelector('input[name="curdDelivered"]:checked').value;
    let milkPrice = parseFloat(document.getElementById("milkPrice").value);
    let curdPrice = parseFloat(document.getElementById("curdPrice").value);

    if (!date || quantity <= 0 || milkPrice <= 0 || curdPrice <= 0) {
        alert("Please enter valid details.");
        return;
    }

    // Save the latest entered prices in Local Storage
    localStorage.setItem("milkPrice", milkPrice);
    localStorage.setItem("curdPrice", curdPrice);

    let milkEntries = JSON.parse(localStorage.getItem("milkEntries")) || [];

    milkEntries.push({
        date,
        quantity,
        curdDelivered,
        milkCost: (quantity * milkPrice).toFixed(2),
        curdCost: curdDelivered === "Yes" ? curdPrice.toFixed(2) : "0.00"
    });

    localStorage.setItem("milkEntries", JSON.stringify(milkEntries));

    document.getElementById("milkForm").reset();
    loadEntries();
    loadPrices(); // Reload saved prices into input fields
});

function loadEntries() {
    let milkEntries = JSON.parse(localStorage.getItem("milkEntries")) || [];
    let tableBody = document.getElementById("milkTableBody");
    tableBody.innerHTML = "";

    let totalMilk = 0, totalCurd = 0, totalCost = 0;

    milkEntries.forEach((entry, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${entry.date}</td>
                <td>${entry.quantity}</td>
                <td>${entry.curdDelivered}</td>
                <td>₹${entry.milkCost}</td>
                <td>₹${entry.curdCost}</td>
                <td><button class="btn btn-danger btn-sm" onclick="deleteEntry(${index})">Delete</button></td>
            </tr>`;
        totalMilk += entry.quantity;
        if (entry.curdDelivered === "Yes") totalCurd++;
        totalCost += parseFloat(entry.milkCost) + parseFloat(entry.curdCost);
    });

    document.getElementById("totalMilk").textContent = totalMilk;
    document.getElementById("totalCurd").textContent = totalCurd;
    document.getElementById("totalCost").textContent = totalCost.toFixed(2);
}

function loadPrices() {
    let savedMilkPrice = localStorage.getItem("milkPrice");
    let savedCurdPrice = localStorage.getItem("curdPrice");

    if (savedMilkPrice) document.getElementById("milkPrice").value = savedMilkPrice;
    if (savedCurdPrice) document.getElementById("curdPrice").value = savedCurdPrice;
}

function deleteEntry(index) {
    let milkEntries = JSON.parse(localStorage.getItem("milkEntries")) || [];
    milkEntries.splice(index, 1);
    localStorage.setItem("milkEntries", JSON.stringify(milkEntries));
    loadEntries();
}

function deleteAllEntries() {
    if (confirm("Are you sure?")) {
        localStorage.removeItem("milkEntries");
        loadEntries();
    }
}
