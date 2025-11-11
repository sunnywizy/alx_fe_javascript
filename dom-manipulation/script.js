// --- GLOBAL VARIABLES & INITIAL DATA ---
        const defaultQuotes = [
            { text: "The only way to do great work is to love what you do.", category: "Work" },
            { text: "Strive not to be a success, but rather to be of value.", category: "Life" },
            { text: "That which does not kill us makes us stronger.", category: "Inspiration" },
            { text: "Coding is not just code, that is why it is not easy.", category: "Programming" }
        ];

        let quotes = []; 

        // --- DOM ELEMENTS ---
        const quoteDisplay = document.getElementById('quoteDisplay');
        const newQuoteButton = document.getElementById('newQuote');
        const formContainer = document.getElementById('formContainer');
        const exportButton = document.getElementById('exportQuotes');
        const importFileInput = document.getElementById('importFile');
        const categoryFilter = document.getElementById('categoryFilter');


        // --- WEB STORAGE HELPERS (Task 1 & 2 Persistence) ---

        function saveQuotes() {
            try {
                localStorage.setItem('quoteGeneratorQuotes', JSON.stringify(quotes));
            } catch (e) {
                console.error("Error saving to Local Storage:", e);
            }
        }

        function loadQuotes() {
            try {
                const storedQuotes = localStorage.getItem('quoteGeneratorQuotes');
                if (storedQuotes) {
                    quotes = JSON.parse(storedQuotes);
                } else {
                    quotes = defaultQuotes;
                    saveQuotes();
                }
            } catch (e) {
                console.error("Error loading from Local Storage or parsing JSON:", e);
                quotes = defaultQuotes;
            }
        }

        function saveLastViewedQuote(quoteText) {
            sessionStorage.setItem('lastViewedQuote', quoteText);
        }

        function loadLastViewedQuote() {
            const lastQuoteText = sessionStorage.getItem('lastViewedQuote');
            if (lastQuoteText) {
                const lastQuote = quotes.find(q => q.text === lastQuoteText);
                if (lastQuote) {
                    displayQuote(lastQuote);
                    const sessionMessage = document.createElement('p');
                    sessionMessage.textContent = "(Session data loaded: This was your last quote!)";
                    sessionMessage.className = "text-xs mt-2 text-indigo-400";
                    quoteDisplay.appendChild(sessionMessage);
                    return true;
                }
            }
            return false;
        }


        // --- CORE FUNCTIONALITY (Task 3: Filtering) ---

        /**
         * Populates the category filter dropdown with unique categories from the quotes array.
         * Called on initialization and whenever a new quote (with a new category) is added.
         */
        function populateCategories() {
            // 1. Get unique categories
            const categories = quotes.map(q => q.category.trim());
            // Use Set for uniqueness, and filter out any empty strings that might result
            const uniqueCategories = [...new Set(categories.filter(c => c))].sort();

            // 2. Clear and re-add options
            // Keep the 'All Categories' option
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';

            uniqueCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });

            // 3. Restore the last selected filter state after populating
            restoreFilterState();
        }

        /**
         * Saves the currently selected filter to Local Storage and triggers a display update.
         * This function is called by the onchange event of the filter dropdown.
         */
        function filterQuotes() {
            const selectedCategory = categoryFilter.value;
            // Step 2: Remember the Last Selected Filter (Local Storage)
            localStorage.setItem('selectedCategoryFilter', selectedCategory);
            
            // Show a random quote from the newly filtered list
            showRandomQuote();
        }

        /**
         * Restores the filter selection from Local Storage on page load.
         */
        function restoreFilterState() {
            const savedCategory = localStorage.getItem('selectedCategoryFilter');

            // Only restore if the saved category exists in the current options list
            const optionExists = Array.from(categoryFilter.options).some(opt => opt.value === savedCategory);

            if (savedCategory && optionExists) {
                categoryFilter.value = savedCategory;
            } else {
                categoryFilter.value = 'all';
                // Also clear storage if it was a custom category that was imported/deleted
                localStorage.removeItem('selectedCategoryFilter'); 
            }
            // Trigger an initial filtered display
            showRandomQuote();
        }


        // --- DISPLAY & USER INTERACTION ---

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
         * Selects a random quote, respecting the currently active category filter.
         */
        function showRandomQuote() {
            const selectedCategory = categoryFilter.value;
            
            // 1. Determine which quotes to draw from based on the filter
            const filteredQuotes = (selectedCategory === 'all' || !selectedCategory) 
                ? quotes
                : quotes.filter(q => q.category.trim() === selectedCategory.trim());

            if (filteredQuotes.length === 0) {
                 quoteDisplay.innerHTML = `<p class="text-lg text-red-500">No quotes available for category: ${selectedCategory}.</p>`;
                 return;
            }
            
            // 2. Pick and display a random quote from the filtered list
            const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
            const quote = filteredQuotes[randomIndex];
            displayQuote(quote);
        }
        
        function createAddQuoteForm() {
            const formDiv = document.createElement('div');
            formDiv.id = 'addQuoteForm';
            formDiv.className = 'flex flex-col space-y-3';

            const textInput = document.createElement('input');
            textInput.id = 'newQuoteText';
            textInput.type = 'text';
            textInput.placeholder = 'Enter a new quote';
            textInput.className = 'p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500';

            const categoryInput = document.createElement('input');
            categoryInput.id = 'newQuoteCategory';
            categoryInput.type = 'text';
            categoryInput.placeholder = 'Enter quote category';
            categoryInput.className = 'p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500';

            const addButton = document.createElement('button');
            addButton.textContent = 'Add Quote';
            addButton.className = 'bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300';
            
            addButton.addEventListener('click', addQuote);

            formDiv.appendChild(textInput);
            formDiv.appendChild(categoryInput);
            formDiv.appendChild(addButton);
            
            formContainer.appendChild(formDiv);
        }

        function addQuote() {
            const newText = document.getElementById('newQuoteText').value.trim();
            const newCategory = document.getElementById('newQuoteCategory').value.trim();

            if (newText === "" || newCategory === "") {
                // Use a visual indicator instead of alert for better UX
                document.getElementById('newQuoteText').focus(); 
                return;
            }

            const newQuote = { text: newText, category: newCategory };
            quotes.push(newQuote);

            // 1. Save the updated array to Local Storage
            saveQuotes();
            
            // 2. Step 3: Update the categories dropdown if this is a new category
            populateCategories(); 

            // Clear the input fields
            document.getElementById('newQuoteText').value = '';
            document.getElementById('newQuoteCategory').value = '';

            // Show the new quote immediately
            showRandomQuote();
        }

        // --- JSON IMPORT/EXPORT FUNCTIONS (from previous task) ---

        function exportToJson() {
            const jsonString = JSON.stringify(quotes, null, 2); 
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my_quotes_export.json';
            
            document.body.appendChild(a);
            a.click();
            
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Use a simple alert replacement for feedback
            quoteDisplay.innerHTML = `<p class="text-xl font-semibold text-green-700">Quotes exported successfully!</p>`;
        }

        function importFromJsonFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const fileReader = new FileReader();
            
            fileReader.onload = function(e) {
                try {
                    const importedQuotes = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(importedQuotes)) {
                        quoteDisplay.innerHTML = `<p class="text-xl font-semibold text-red-700">Import failed: JSON file must contain an array of quotes.</p>`;
                        return;
                    }

                    quotes = importedQuotes;
                    saveQuotes();
                    
                    // CRITICAL: Repopulate categories after import, as the list might have changed
                    populateCategories(); 
                    
                    event.target.value = '';
                    
                    quoteDisplay.innerHTML = `<p class="text-xl font-semibold text-green-700">Quotes imported successfully! Total quotes: ${quotes.length}</p>`;
                    
                } catch (error) {
                    console.error("Error during JSON import:", error);
                    quoteDisplay.innerHTML = `<p class="text-xl font-semibold text-red-700">Import failed: The file is not a valid JSON format.</p>`;
                }
            };
            fileReader.readAsText(file);
        }

        // --- INITIALIZATION ---

        function initialize() {
            // 1. Load data from local storage (must run first)
            loadQuotes(); 

            // 2. Populate the categories dropdown based on loaded data
            populateCategories(); 
            // NOTE: populateCategories automatically calls restoreFilterState which calls showRandomQuote

            // 3. Attach listeners
            newQuoteButton.addEventListener('click', showRandomQuote);
            exportButton.addEventListener('click', exportToJson);
            importFileInput.addEventListener('change', importFromJsonFile);

            // 4. Dynamically generate the "Add Quote" form
            createAddQuoteForm();
        }

        // Run initialization when the page is ready
        window.onload = initialize;
