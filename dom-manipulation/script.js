// --- JAVASCRIPT LOGIC (script.js equivalent) ---

        // 1. Initial Data Array
        let quotes = [
            { text: "The only way to do great work is to love what you do.", category: "Work" },
            { text: "Strive not to be a success, but rather to be of value.", category: "Life" },
            { text: "That which does not kill us makes us stronger.", category: "Inspiration" },
            { text: "Coding is not just code, that is why it is not easy.", category: "Programming" }
        ];

        // 2. Select DOM Elements
        const quoteDisplay = document.getElementById('quoteDisplay');
        const newQuoteButton = document.getElementById('newQuote');
        const formContainer = document.getElementById('formContainer');

        /**
         * Selects a random quote and updates the display area.
         */
        function showRandomQuote() {
            // Calculate a random index number based on the length of the quotes array
            const randomIndex = Math.floor(Math.random() * quotes.length);
            const quote = quotes[randomIndex];

            // Update the display area using innerHTML (DOM Manipulation)
            quoteDisplay.innerHTML = `
                <p class="text-xl font-medium text-gray-800 italic mb-2">"${quote.text}"</p>
                <p class="text-sm text-blue-600 font-semibold">— Category: ${quote.category}</p>
            `;
        }
        
        /**
         * Dynamically creates and injects the Add Quote form into the DOM.
         */
        function createAddQuoteForm() {
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
            // We use .addEventListener instead of onclick directly in HTML
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
            // Get the values from the dynamically created input fields
            const newText = document.getElementById('newQuoteText').value.trim();
            const newCategory = document.getElementById('newQuoteCategory').value.trim();

            // Simple validation
            if (newText === "" || newCategory === "") {
                // Using console.error instead of alert for better user experience
                alert("Please enter both the quote text and a category.");
                return;
            }

            // 1. Update the data array
            const newQuote = { text: newText, category: newCategory };
            quotes.push(newQuote);

            // 2. Give feedback (optional)
            alert(`Quote added: "${newText}" in category "${newCategory}"`);

            // 3. Clear the input fields
            document.getElementById('newQuoteText').value = '';
            document.getElementById('newQuoteCategory').value = '';

            // 4. Show the new quote immediately
            showRandomQuote();
        }

        // 3. Setup Initial Events and State

        // A. Display a quote when the page loads
        showRandomQuote();

        // B. Attach the click listener to the "Show New Quote" button
        newQuoteButton.addEventListener('click', showRandomQuote);

        // C. Dynamically generate the "Add Quote" form when the page loads
        createAddQuoteForm();