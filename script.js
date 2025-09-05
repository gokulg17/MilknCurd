document.addEventListener("DOMContentLoaded", function () {
    // ---ELEMENT SELECTORS---
    const milkForm = document.getElementById("milkForm");
    const milkTableBody = document.getElementById("milkTableBody");
    const deleteAllBtn = document.getElementById("deleteAllBtn");
    const editModalEl = document.getElementById('editModal');
    const editModal = new bootstrap.Modal(editModalEl);
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const editForm = document.getElementById('editForm');

    // ---INITIALIZATION---
    loadPrices();
    loadEntries();
    setDefaultDate();

    // ---EVENT LISTENERS---
    milkForm.addEventListener("submit", handleAddEntry);
    deleteAllBtn.addEventListener("click", deleteAllEntries);
    milkTableBody.addEventListener("click", handleTableActions);
    saveChangesBtn.addEventListener("click", handleSaveChanges);

    // ---FUNCTIONS---

    /**
     * Handles the submission of the main form to add a new entry.
     */
    function handleAddEntry(e) {
        e.preventDefault();

        // Get values from the form
        const date = document.getElementById("date").value;
        const quantity = parseFloat(document.getElementById("quantity").value);
        const curdDelivered = document.querySelector('input[name="curdDelivered"]:checked').value;
        const milkPrice = parseFloat(document.getElementById("milkPrice").value);
        const curdPrice = parseFloat(document.getElementById("curdPrice").value);

        if (!date || isNaN(quantity) || quantity <= 0 || isNaN(milkPrice) || milkPrice < 0 || isNaN(curdPrice) || curdPrice < 0) {
            alert("Please enter valid details.");
            return;
        }

        // Save prices for next time
        localStorage.setItem("milkPrice", milkPrice);
        localStorage.setItem("curdPrice", curdPrice);

        const milkEntries = getEntriesFromStorage();

        milkEntries.push({
            date,
            quantity,
            curdDelivered,
            milkPrice, // Store the price at the time of entry
            curdPrice, // Store the price at the time of entry
        });
        
        // Sort entries by date (newest first)
        milkEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        saveEntriesToStorage(milkEntries);

        milkForm.reset();
        setDefaultDate();
        loadEntries();
        loadPrices();
    }

    /**
     * Loads entries from local storage and populates the table.
     */
    function loadEntries() {
        const milkEntries = getEntriesFromStorage();
        milkTableBody.innerHTML = ""; // Clear existing table rows

        let totalMilk = 0, totalCurdDays = 0, totalCost = 0;

        milkEntries.forEach((entry, index) => {
            const milkCost = entry.quantity * entry.milkPrice;
            const curdCost = entry.curdDelivered === "Yes" ? entry.curdPrice : 0;
            const rowCost = milkCost + curdCost;

            totalMilk += entry.quantity;
            if (entry.curdDelivered === "Yes") totalCurdDays++;
            totalCost += rowCost;

            const row = `
                <tr>
                    <td>${entry.date}</td>
                    <td>${entry.quantity.toFixed(2)}</td>
                    <td>${entry.curdDelivered}</td>
                    <td>₹${milkCost.toFixed(2)}</td>
                    <td>₹${curdCost.toFixed(2)}</td>
                    <td class="text-center">
                        <button class="btn btn-success btn-sm action-btn" data-action="edit" data-index="${index}" title="Edit">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-danger btn-sm action-btn" data-action="delete" data-index="${index}" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>`;
            milkTableBody.innerHTML += row;
        });

        // Update summary totals
        document.getElementById("totalMilk").textContent = totalMilk.toFixed(2);
        document.getElementById("totalCurd").textContent = totalCurdDays;
        document.getElementById("totalCost").textContent = totalCost.toFixed(2);
    }
    
    /**
     * Handles clicks on edit and delete buttons in the table using event delegation.
     */
    function handleTableActions(e) {
        const target = e.target.closest('button');
        if (!target) return;

        const action = target.dataset.action;
        const index = parseInt(target.dataset.index, 10);

        if (action === 'delete') {
            deleteEntry(index);
        } else if (action === 'edit') {
            openEditModal(index);
        }
    }

    /**
     * Deletes a single entry from local storage.
     */
    function deleteEntry(index) {
        if (confirm("Are you sure you want to delete this entry?")) {
            const milkEntries = getEntriesFromStorage();
            milkEntries.splice(index, 1);
            saveEntriesToStorage(milkEntries);
            loadEntries();
        }
    }

    /**
     * Deletes all entries from local storage.
     */
    function deleteAllEntries() {
        if (confirm("Are you sure you want to delete ALL entries? This action cannot be undone.")) {
            localStorage.removeItem("milkEntries");
            loadEntries();
        }
    }

    /**
     * Opens the modal and populates it with data from the selected entry.
     */
    function openEditModal(index) {
        const milkEntries = getEntriesFromStorage();
        const entry = milkEntries[index];

        document.getElementById('editIndex').value = index;
        document.getElementById('editDate').value = entry.date;
        document.getElementById('editQuantity').value = entry.quantity;
        
        if (entry.curdDelivered === "Yes") {
            document.getElementById('editCurdYes').checked = true;
        } else {
            document.getElementById('editCurdNo').checked = true;
        }

        editModal.show();
    }
    
    /**
     * Saves the changes made in the edit modal.
     */
    function handleSaveChanges() {
        const index = parseInt(document.getElementById('editIndex').value, 10);
        const milkEntries = getEntriesFromStorage();

        // Update the entry with new values from the modal form
        milkEntries[index].date = document.getElementById('editDate').value;
        milkEntries[index].quantity = parseFloat(document.getElementById('editQuantity').value);
        milkEntries[index].curdDelivered = document.querySelector('input[name="editCurdDelivered"]:checked').value;

        // Re-sort entries by date in case the date was changed
        milkEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        saveEntriesToStorage(milkEntries);
        loadEntries();
        editModal.hide();
    }


    /**
     * Loads saved milk and curd prices into the form fields.
     */
    function loadPrices() {
        const savedMilkPrice = localStorage.getItem("milkPrice");
        const savedCurdPrice = localStorage.getItem("curdPrice");

        if (savedMilkPrice) document.getElementById("milkPrice").value = savedMilkPrice;
        if (savedCurdPrice) document.getElementById("curdPrice").value = savedCurdPrice;
    }

    /**
     * Sets the date input field to today's date by default.
     */
    function setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }
    
    // ---UTILITY FUNCTIONS---
    function getEntriesFromStorage() {
        return JSON.parse(localStorage.getItem("milkEntries")) || [];
    }

    function saveEntriesToStorage(entries) {
        localStorage.setItem("milkEntries", JSON.stringify(entries));
    }
});
