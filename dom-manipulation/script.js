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
        const syncStatus = document.getElementById('syncStatus');
        const conflictResolutionUI = document.getElementById('conflictResolutionUI');

        // --- WEB STORAGE KEYS ---
        const LOCAL_KEY = 'quoteGeneratorQuotes';
        const SERVER_SIM_KEY = 'mockServerData'; // Key to simulate the server's authoritative data

        // --- SERVER SIMULATION & SYNC (Task 4) ---

        /**
         * Simulates initializing the server data store if it doesn't exist.
         */
        function initializeServerData() {
            if (!localStorage.getItem(SERVER_SIM_KEY)) {
                // Server starts with the initial default quotes
                localStorage.setItem(SERVER_SIM_KEY, JSON.stringify(defaultQuotes));
            }
        }

        /**
         * Helper to update the sync status UI element.
         */
        function updateSyncStatus(message, colorClass = 'bg-yellow-100 text-yellow-800') {
            syncStatus.textContent = message;
            syncStatus.className = `mt-2 mb-4 p-3 text-sm font-medium text-center rounded-lg transition-colors duration-300 ${colorClass}`;
            conflictResolutionUI.classList.add('hidden');
        }

        /**
         * Simulates pushing local data to the server. Called after a manual push or local update.
         */
        function pushToServer(data) {
            updateSyncStatus('Pushing local changes to server...', 'bg-blue-100 text-blue-800');
            // Simulate network latency
            setTimeout(() => {
                try {
                    // Update the simulated server data with the current local state
                    localStorage.setItem(SERVER_SIM_KEY, JSON.stringify(data));
                    updateSyncStatus(`Changes pushed to server. Last Synced: ${new Date().toLocaleTimeString()}`, 'bg-green-100 text-green-800');
                } catch (e) {
                    console.error("Error pushing to simulated server:", e);
                    updateSyncStatus('Error pushing data to server.', 'bg-red-100 text-red-800');
                }
            }, 1000); // 1 second delay simulation
        }

        /**
         * Implements Data Syncing and checks for conflicts.
         */
        function syncData() {
            updateSyncStatus('Syncing with server...', 'bg-yellow-100 text-yellow-800');

            setTimeout(() => { // Simulate network latency
                try {
                    const serverQuotesString = localStorage.getItem(SERVER_SIM_KEY);
                    const localQuotesString = localStorage.getItem(LOCAL_KEY);

                    if (!serverQuotesString) {
                        updateSyncStatus('Error: Server data is missing.', 'bg-red-100 text-red-800');
                        return;
                    }

                    // Conflict Check (Data differs)
                    if (serverQuotesString !== localQuotesString) {
                        // Conflict detected! Prompt user for manual resolution
                        syncStatus.className = 'mt-2 mb-4 p-3 text-sm font-medium text-center rounded-lg bg-red-100 text-red-800';
                        syncStatus.textContent = 'CONFLICT: Manual resolution required.';
                        conflictResolutionUI.classList.remove('hidden');
                        return;

                    } 
                    
                    updateSyncStatus(`Sync successful. Last Checked: ${new Date().toLocaleTimeString()}`, 'bg-green-100 text-green-800');

                } catch (e) {
                    console.error("Error during data sync:", e);
                    updateSyncStatus('Sync failed due to an error.', 'bg-red-100 text-red-800');
                }
            }, 1500); // 1.5 second delay simulation
        }
        
        /**
         * Resolves the conflict based on user choice.
         * @param {'server' | 'local'} precedence - Which version to keep.
         */
        window.resolveConflict = function(precedence) {
            if (precedence === 'server') {
                // Server wins: Load server data, overwrite local, and update UI
                const serverQuotesString = localStorage.getItem(SERVER_SIM_KEY);
                quotes = JSON.parse(serverQuotesString);
                saveQuotes(false); // Save server data locally, DO NOT push back to server

                updateSyncStatus(`Conflict resolved: Server version accepted.`, 'bg-red-100 text-red-800');
                
            } else if (precedence === 'local') {
                // Local wins: Push local data to server, making it the new authority
                pushToServer(quotes); // Push local data to the simulated server

                updateSyncStatus(`Conflict resolved: Local version pushed to server.`, 'bg-red-100 text-red-800');
            }

            // After resolution, update the UI elements
            populateCategories(); 
            showRandomQuote();
            conflictResolutionUI.classList.add('hidden');
        }


        // --- WEB STORAGE HELPERS ---

        /**
         * Saves quotes to local storage, optionally pushing to the server.
         * @param {boolean} shouldPushToServer - If true, calls pushToServer after saving locally.
         */
        function saveQuotes(shouldPushToServer = true) {
            try {
                localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
                if (shouldPushToServer) {
                    pushToServer(quotes);
                }
            } catch (e) {
                console.error("Error saving to Local Storage:", e);
            }
        }

        function loadQuotes() {
            try {
                const storedQuotes = localStorage.getItem(LOCAL_KEY);
                if (storedQuotes) {
                    quotes = JSON.parse(storedQuotes);
                } else {
                    quotes = defaultQuotes;
                    saveQuotes(false); // Save initial state locally without pushing
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

        function populateCategories() {
            const categories = quotes.map(q => q.category.trim());
            const uniqueCategories = [...new Set(categories.filter(c => c))].sort();

            categoryFilter.innerHTML = '<option value="all">All Categories</option>';

            uniqueCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });

            restoreFilterState();
        }

        function filterQuotes() {
            const selectedCategory = categoryFilter.value;
            localStorage.setItem('selectedCategoryFilter', selectedCategory);
            showRandomQuote();
        }

        function restoreFilterState() {
            const savedCategory = localStorage.getItem('selectedCategoryFilter');

            const optionExists = Array.from(categoryFilter.options).some(opt => opt.value === savedCategory);

            if (savedCategory && optionExists) {
                categoryFilter.value = savedCategory;
            } else {
                categoryFilter.value = 'all';
                localStorage.removeItem('selectedCategoryFilter'); 
            }
            showRandomQuote();
        }


        // --- DISPLAY & USER INTERACTION ---

        function displayQuote(quote) {
             quoteDisplay.innerHTML = ''; 

            quoteDisplay.innerHTML = `
                <p class="text-xl font-medium text-gray-800 italic mb-2">"${quote.text}"</p>
                <p class="text-sm text-blue-600 font-semibold">— Category: ${quote.category}</p>
            `;
            saveLastViewedQuote(quote.text); 
        }

        function showRandomQuote() {
            const selectedCategory = categoryFilter.value;
            
            const filteredQuotes = (selectedCategory === 'all' || !selectedCategory) 
                ? quotes
                : quotes.filter(q => q.category.trim() === selectedCategory.trim());

            if (filteredQuotes.length === 0) {
                 quoteDisplay.innerHTML = `<p class="text-lg text-red-500">No quotes available for category: ${selectedCategory}.</p>`;
                 return;
            }
            
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
            addButton.textContent = 'Add Quote (Auto-sync)';
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

            // 1. Save the updated array to Local Storage (and push to server)
            saveQuotes(true); 
            
            // 2. Update the categories dropdown
            populateCategories(); 

            // Clear the input fields
            document.getElementById('newQuoteText').value = '';
            document.getElementById('newQuoteCategory').value = '';

            // Show the new quote immediately
            showRandomQuote();
        }

        // --- JSON IMPORT/EXPORT FUNCTIONS ---

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
            
            updateSyncStatus("Quotes exported successfully! (Local Data)", 'bg-purple-100 text-purple-800');
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
                    
                    // Save and push the newly imported data
                    saveQuotes(true); 
                    
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
            // 1. Initialize Server's Mock Data Store
            initializeServerData(); 
            
            // 2. Load Local Data
            loadQuotes(); 

            // 3. Populate Categories and Restore Filter State
            populateCategories(); 

            // 4. Attach Listeners
            newQuoteButton.addEventListener('click', showRandomQuote);
            exportButton.addEventListener('click', exportToJson);
            importFileInput.addEventListener('change', importFromJsonFile);

            // 5. Dynamically generate the "Add Quote" form
            createAddQuoteForm();
            
            // 6. Start the periodic sync check (every 5 seconds)
            setInterval(syncData, 5000); 
            
            updateSyncStatus('Ready. Periodic sync started (5s interval).', 'bg-green-100 text-green-800');
        }

        // Run initialization when the page is ready
        window.onload = initialize;
