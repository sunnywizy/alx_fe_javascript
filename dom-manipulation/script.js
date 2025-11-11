 // --- JAVASCRIPT LOGIC (script.js equivalent) ---

        // 1. Initial Data Array (Default fallback)
        const defaultQuotes = [
            { text: "The only way to do great work is to love what you do.", category: "Work" },
            { text: "Strive not to be a success, but rather to be of value.", category: "Life" },
            { text: "That which does not kill us makes us stronger.", category: "Inspiration" },
            { text: "Coding is not just code, that is why it is not easy.", category: "Programming" }
        ];

        // This will hold the quotes, initialized by loadQuotes()
        let quotes = []; 

        // 2. Select DOM Elements
        const quoteDisplay = document.getElementById('quoteDisplay');
        const newQuoteButton = document.getElementById('newQuote');
        const formContainer = document.getElementById('formContainer');
        const exportButton = document.getElementById('exportQuotes');
        const importFileInput = document.getElementById('importFile');

        
        // --- WEB STORAGE HELPERS (Step 1) ---

        /**
         * Saves the current 'quotes' array to Local Storage.
         */
        function saveQuotes() {
            try {
                // Convert the JavaScript array into a JSON string before saving
                localStorage.setItem('quoteGeneratorQuotes', JSON.stringify(quotes));
            } catch (e) {
                console.error("Error saving to Local Storage:", e);
                // Note: If storage limit is exceeded (unlikely here), this catch block runs.
            }
        }

        /**
         * Loads quotes from Local Storage, or uses defaults if none are found.
         */
        function loadQuotes() {
            try {
                const storedQuotes = localStorage.getItem('quoteGeneratorQuotes');
                if (storedQuotes) {
                    // Convert the JSON string back into a JavaScript array/object
                    quotes = JSON.parse(storedQuotes);
                } else {
                    // Use the default set if nothing is stored (first run)
                    quotes = defaultQuotes;
                    saveQuotes(); // Save defaults immediately
                }
            } catch (e) {
                console.error("Error loading from Local Storage or parsing JSON:", e);
                quotes = defaultQuotes;
            }
        }

        /**
         * Saves the text of the currently displayed quote to Session Storage (optional task).
         */
        function saveLastViewedQuote(quoteText) {
            // Session storage persists only as long as the browser tab is open
            sessionStorage.setItem('lastViewedQuote', quoteText);
        }

        /**
         * Attempts to display the last viewed quote from Session Storage.
         * @returns {boolean} True if a quote was loaded from session storage.
         */
        function loadLastViewedQuote() {
            const lastQuoteText = sessionStorage.getItem('lastViewedQuote');
            if (lastQuoteText) {
                // Find the quote object based on the text saved
                const lastQuote = quotes.find(q => q.text === lastQuoteText);
                if (lastQuote) {
                    displayQuote(lastQuote);
                    // Add a temporary session message to the UI
                    const sessionMessage = document.createElement('p');
                    sessionMessage.textContent = "(Session data loaded: This was your last quote!)";
                    sessionMessage.className = "text-xs mt-2 text-indigo-400";
                    quoteDisplay.appendChild(sessionMessage);
                    return true;
                }
            }
            return false;
        }

        // --- CORE LOGIC ---

        /**
         * Helper function to update the DOM display and save to session storage.
         */
        function displayQuote(quote) {
             // Clear any previous session message
             quoteDisplay.innerHTML = ''; 

            quoteDisplay.innerHTML = `
                <p class="text-xl font-medium text-gray-800 italic mb-2">"${quote.text}"</p>
                <p class="text-sm text-blue-600 font-semibold">— Category: ${quote.category}</p>
            `;
            // Save the displayed quote's text to session storage
            saveLastViewedQuote(quote.text); 
        }

        /**
         * Selects a random quote and updates the display area.
         */
        function showRandomQuote() {
            if (quotes.length === 0) {
                 quoteDisplay.innerHTML = '<p class="text-lg text-red-500">No quotes available. Add some!</p>';
                 return;
            }
            const randomIndex = Math.floor(Math.random() * quotes.length);
            const quote = quotes[randomIndex];
            displayQuote(quote);
        }
        
        /**
         * Dynamically creates and injects the Add Quote form into the DOM.
         */
        function createAddQuoteForm() {
            // ... (A-F: logic for creating inputs and button remains the same)

            // A. Create the DIV wrapper for the form
            const formDiv = document.createElement('div');
            formDiv.id = 'addQuoteForm';
            formDiv.className = 'flex flex-col space-y-3';

            // B. Create the Quote Text Input
            const textInput = document.createElement('input');
            textInput.id = 'newQuoteText';
            textInput.type = 'text';
            textInput.placeholder = 'Enter a new quote';
            textInput.className = 'p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500';

            // C. Create the Category Input
            const categoryInput = document.createElement('input');
            categoryInput.id = 'newQuoteCategory';
            categoryInput.type = 'text';
            categoryInput.placeholder = 'Enter quote category';
            categoryInput.className = 'p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500';

            // D. Create the Add Button
            const addButton = document.createElement('button');
            addButton.textContent = 'Add Quote';
            addButton.className = 'bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300';
            
            // E. Add Event Listener to the newly created button
            addButton.addEventListener('click', addQuote);

            // F. Assemble the form and add it to the formContainer
            formDiv.appendChild(textInput);
            formDiv.appendChild(categoryInput);
            formDiv.appendChild(addButton);
            
            formContainer.appendChild(formDiv);
        }

        /**
         * Handles the logic for retrieving user input and adding a new quote to the list.
         */
        function addQuote() {
            const newText = document.getElementById('newQuoteText').value.trim();
            const newCategory = document.getElementById('newQuoteCategory').value.trim();

            if (newText === "" || newCategory === "") {
                alert("Please enter both the quote text and a category.");
                return;
            }

            // 1. Update the data array
            const newQuote = { text: newText, category: newCategory };
            quotes.push(newQuote);

            // 2. Save the updated array to Local Storage (Step 1 Integration)
            saveQuotes();

            // 3. Give feedback (using alert for simple message)
            alert(`Quote added and saved: "${newText}" in category "${newCategory}"`);

            // 4. Clear the input fields
            document.getElementById('newQuoteText').value = '';
            document.getElementById('newQuoteCategory').value = '';

            // 5. Show the new quote immediately
            showRandomQuote();
        }

        // --- JSON IMPORT/EXPORT FUNCTIONS (Step 2) ---

        /**
         * Exports the current quotes array as a downloadable JSON file.
         */
        function exportToJson() {
            // Convert the JavaScript array into a readable JSON string (2 spaces indentation)
            const jsonString = JSON.stringify(quotes, null, 2); 
            
            // Create a Blob (a file-like object) from the JSON string
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Create a temporary link element for downloading
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my_quotes_export.json'; // The file name
            
            // Programmatically click the link to trigger the download
            document.body.appendChild(a);
            a.click();
            
            // Clean up the temporary elements and object URL
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Quotes exported successfully as my_quotes_export.json!');
        }

        /**
         * Handles reading the uploaded JSON file and updating the quotes.
         */
        function importFromJsonFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const fileReader = new FileReader();
            
            // The function that runs when the file has been successfully read
            fileReader.onload = function(e) {
                try {
                    // Parse the JSON string from the file content
                    const importedQuotes = JSON.parse(e.target.result);
                    
                    // Basic validation
                    if (!Array.isArray(importedQuotes)) {
                        alert('Import failed: JSON file must contain an array of quotes.');
                        return;
                    }

                    // Replace the entire quotes list with the imported data
                    quotes = importedQuotes;
                    
                    // Save the new list to local storage (Persistence)
                    saveQuotes();
                    
                    // Update the UI
                    showRandomQuote();
                    
                    // Clear the file input so the same file can be imported again if needed
                    event.target.value = '';
                    
                    alert(`Quotes imported successfully! Total quotes: ${quotes.length}`);
                    
                } catch (error) {
                    console.error("Error during JSON import:", error);
                    alert('Import failed: The file is not a valid JSON format.');
                }
            };
            // Start reading the file as text
            fileReader.readAsText(file);
        }

        // 3. Setup Initial Events and State

        // A. Load data from local storage first (critical for persistence)
        loadQuotes(); 

        // B. Attach click listener to the "Show New Quote" button
        newQuoteButton.addEventListener('click', showRandomQuote);
        
        // C. Attach listeners for JSON Import/Export
        exportButton.addEventListener('click', exportToJson);
        // Attach the import function to the file input's 'change' event
        importFileInput.addEventListener('change', importFromJsonFile);

        // D. Dynamically generate the "Add Quote" form when the page loads
        createAddQuoteForm();

        // E. Initial Display: Try to load the last viewed quote from the session, 
        //    otherwise show a random one.
        const lastQuoteLoaded = loadLastViewedQuote();
        if (!lastQuoteLoaded) {
            showRandomQuote();
        }
