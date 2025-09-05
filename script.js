document.addEventListener('DOMContentLoaded', () => {
    const totalCostDisplay = document.getElementById('total-cost');
    const materialSpoolSelect = document.getElementById('material-spool');

    // A variable to store the markup value
    let markupPercentage = 0;

    /**
     * Fetches data from a JSON file and initializes the application.
     */
    async function initializeApp() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Store the markup percentage from the JSON file
            markupPercentage = data.defaultValues.markup;

            populateForm(data.spoolTypes, data.defaultValues);
            setupEventListeners();
            calculateCost();
        } catch (error) {
            console.error('Failed to load data:', error);
            // Handle error, e.g., by setting hardcoded defaults or showing a message
        }
    }

    /**
     * Populates the spool type dropdown and sets default values for input fields.
     * @param {Array} spoolTypes - An array of spool type objects.
     * @param {Object} defaultValues - An object containing default form values.
     */
    function populateForm(spoolTypes, defaultValues) {
        let defaultOptionSet = false;
        spoolTypes.forEach(spool => {
            const option = document.createElement('option');
            option.value = `${spool.cost},${spool.weight}`;
            option.textContent = `${spool.name} (£${spool.cost} / ${spool.weight}g)`;
            
            // Set the first option as the default selected one
            if (!defaultOptionSet) {
                option.selected = true;
                defaultOptionSet = true;
            }
            materialSpoolSelect.insertBefore(option, materialSpoolSelect.firstChild);
        });
        
        const [firstSpoolCost, firstSpoolWeight] = materialSpoolSelect.options[0].value.split(',');
        document.getElementById('material-spool-cost').value = parseFloat(firstSpoolCost).toFixed(2);
        document.getElementById('spool-weight-grams').value = parseFloat(firstSpoolWeight);

        // Set the default values for the other input fields
        document.getElementById('print-time-hours').value = defaultValues.printTime.hours;
        document.getElementById('print-time-minutes').value = defaultValues.printTime.minutes;
        document.getElementById('material-weight').value = defaultValues.materialWeight;
        document.getElementById('labor-cost').value = defaultValues.laborCost.toFixed(2);
        document.getElementById('labor-time-hours').value = defaultValues.laborTime.hours;
        document.getElementById('labor-time-minutes').value = defaultValues.laborTime.minutes;
        document.getElementById('electricity-cost-kwh').value = defaultValues.electricityCost.toFixed(2);
        document.getElementById('power-consumption').value = defaultValues.powerConsumption;
    }

    /**
     * Sets up all event listeners for the form elements.
     */
    function setupEventListeners() {
        const inputs = document.querySelectorAll('#cost-form input');

        materialSpoolSelect.addEventListener('change', handleMaterialChange);
        
        inputs.forEach(input => {
            input.addEventListener('input', calculateCost);
        });
    }

    /**
     * Handles changes to the material spool dropdown by populating the input fields.
     */
    function handleMaterialChange() {
        if (materialSpoolSelect.value !== 'custom') {
            const [cost, weight] = materialSpoolSelect.value.split(',');
            document.getElementById('material-spool-cost').value = parseFloat(cost).toFixed(2);
            document.getElementById('spool-weight-grams').value = parseFloat(weight);
        }
        calculateCost();
    }

    /**
     * Calculates the total print cost based on current form values.
     */
    function calculateCost() {
        const materialSpoolCost = parseFloat(document.getElementById('material-spool-cost').value) || 0;
        const spoolWeightGrams = parseFloat(document.getElementById('spool-weight-grams').value) || 0;
        
        const printHours = parseFloat(document.getElementById('print-time-hours').value) || 0;
        const printMinutes = parseFloat(document.getElementById('print-time-minutes').value) || 0;
        const printTimeHours = printHours + (printMinutes / 60);

        const materialWeightGrams = parseFloat(document.getElementById('material-weight').value) || 0;
        const laborCostPerHour = parseFloat(document.getElementById('labor-cost').value) || 0;

        const laborHours = parseFloat(document.getElementById('labor-time-hours').value) || 0;
        const laborMinutes = parseFloat(document.getElementById('labor-time-minutes').value) || 0;
        const laborTimeHours = laborHours + (laborMinutes / 60);

        const electricityCostPerKWH = parseFloat(document.getElementById('electricity-cost-kwh').value) || 0;
        const powerConsumptionWatts = parseFloat(document.getElementById('power-consumption').value) || 0;
        
        const materialCostPerGram = (spoolWeightGrams > 0) ? (materialSpoolCost / spoolWeightGrams) : 0;
        const materialCost = materialCostPerGram * materialWeightGrams;
        const laborCost = laborCostPerHour * laborTimeHours;
        const electricityCost = (powerConsumptionWatts * printTimeHours / 1000) * electricityCostPerKWH;
        const baseCost = materialCost + laborCost + electricityCost;
        const markupAmount = baseCost * (markupPercentage / 100);
        const totalCost = baseCost + markupAmount;

        totalCostDisplay.textContent = `£${totalCost.toFixed(2)}`;
    }

    // Start the application
    initializeApp();
});