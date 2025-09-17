document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements (may not exist on every page)
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const box1 = document.getElementById('box1');
    const box2 = document.getElementById('box2');
    const submitBtn = document.getElementById('submitBtn');
    const clearBtn = document.getElementById('clearBtn');
    const leftGrid = document.getElementById('leftGrid');
    const rightGrid = document.getElementById('rightGrid');
    const homeBtn = document.getElementById('homeBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const backBtn = document.getElementById('backBtn');

    // Global state
    let concatenatedString = '';
    let combinedString = ''; // New variable to store the long string
    let leftSideValues = []; // New variable to store the generated grid values
    let history = [];
    let historyIndex = -1;

    // --- Page 1 Logic ---
    if (page1 && box1 && box2 && submitBtn && clearBtn) {
        // Update Box 2 based on Box 1 input
        function updateBox2() {
            const inputDigits = new Set(box1.value.split('').filter(d => !isNaN(d)));
            const allDigits = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
            const remainingDigits = Array.from(allDigits).filter(d => !inputDigits.has(d)).sort().join('');
            box2.value = remainingDigits;
        }

        box1.addEventListener('input', updateBox2);
        box1.addEventListener('blur', updateBox2);
        updateBox2(); // Initial update

        // Handle Submit button click
        submitBtn.addEventListener('click', () => {
            if (box1.value.length > 0) {
                concatenatedString = box1.value + box2.value;
                // Save to localStorage for page2
                localStorage.setItem('concatenatedString', concatenatedString);
                // Optionally clear history if you want to reset on new submit
                // localStorage.removeItem('history');
                // Navigate to page2.html
                window.location.href = 'page2.html';
            } else {
                alert('Please enter some digits in Box 1.');
            }
        });

        // Handle Clear button click
        clearBtn.addEventListener('click', () => {
            box1.value = '';
            updateBox2();
        });
    }

    // --- Page 2 Logic ---
    if (page2 && leftGrid && rightGrid) {
        // Function to generate and display the grids
        function displayGrids() {
            // Clear previous grids
            if (leftGrid) leftGrid.innerHTML = '';
            if (rightGrid) rightGrid.innerHTML = '';

            // Step 1: Fill the left grid by taking 2-digit pairs from the combined string.
            const tempLeftSideValues = [];
            let currentPairIndex = 0;

            // We get the first 30 characters (15 pairs) to fill a 10-row grid
            const stringToDisplay = combinedString.substring(0, 60);

            for (let i = 0; i < 10; i++) {
                const row = [];
                for (let j = 0; j < 3; j++) {
                    const start = currentPairIndex * 2;
                    if (start + 2 <= stringToDisplay.length) {
                        const pair = stringToDisplay.substring(start, start + 2);
                        row.push(pair);
                        currentPairIndex++;
                    } else {
                        break;
                    }
                }
                if (row.length > 0) {
                    tempLeftSideValues.push(row);
                } else {
                    break;
                }
            }

            leftSideValues = tempLeftSideValues; // Update the global variable

            // Step 2: Generate the right grid based on the newly generated left grid
            const rightSideValues = generateRightSideValues(leftSideValues);

            // Render Left Grid
            leftSideValues.forEach(row => {
                row.forEach(val => {
                    const item = document.createElement('div');
                    item.className = 'grid-item';
                    item.textContent = val;
                    leftGrid.appendChild(item);
                });
            });

            // Render Right Grid
            rightSideValues.forEach(row => {
                row.forEach(val => {
                    const item = document.createElement('div');
                    item.className = 'grid-item';
                    item.textContent = val;
                    rightGrid.appendChild(item);
                });
            });
        }
        // Expose displayGrids globally so Page 1 can call it
        window.displayGrids = displayGrids;

        const storedString = localStorage.getItem('concatenatedString');
        if (storedString) {
            concatenatedString = storedString;

            // Initial generation of the full combined string
            const modifiedStrings = generateModifiedStrings(concatenatedString);
            combinedString = modifiedStrings.join('');

            history = [{ data: combinedString }]; // Store the combinedString in history
            historyIndex = 0;

            // Now call the updated displayGrids function without an argument
            displayGrids();
        }
    }

    // Helper function to generate the sequence of modified strings.
    function generateModifiedStrings(str) {
        let currentStr = str;
        const modifiedStrings = [currentStr];

        const lastDigit = str.charAt(str.length - 1);
        const remaining = str.slice(0, -1);

        for (let i = remaining.length - 1; i >= 0; i--) {
            const newStr = remaining.substring(0, i) + lastDigit + remaining.substring(i);
            modifiedStrings.push(newStr);
        }
        return modifiedStrings;
    }

    function generateLeftSideValues(initialStr) {
        // Step 1: Get the list of modified strings using the globally available function.
        const modifiedStrings = generateModifiedStrings(initialStr);

        // Step 2: Concatenate all modified strings into one long string.
        const combinedString = modifiedStrings.join('');

        // Step 3: Fill the grid by taking 2-digit pairs from the combined string.
        const rows = [];
        let currentPairIndex = 0;

        for (let i = 0; i < 10; i++) {
            const row = [];
            for (let j = 0; j < 3; j++) {
                const start = currentPairIndex * 2;
                if (start + 2 <= combinedString.length) {
                    const pair = combinedString.substring(start, start + 2);
                    row.push(pair);
                    currentPairIndex++;
                } else {
                    // Handle case where we run out of pairs
                    break;
                }
            }
            if (row.length > 0) {
                rows.push(row);
            } else {
                break;
            }
        }

        return rows;
    }

    // Generate Right Side values based on the Left Side values
    function generateRightSideValues(leftValues) {
        const rightValues = [];
        for (let i = 0; i < leftValues.length; i += 2) {
            const row1 = leftValues[i];
            const row2 = leftValues[i + 1];

            if (!row1 || !row2) continue; // Handle case of odd number of rows

            const rightRow1 = [];
            const rightRow2 = [];

            for (let j = 0; j < 3; j++) {
                // Right Row 1 logic
                const val1 = row1[j];
                const firstDigit2 = row2[j].charAt(0);
                rightRow1.push(`${val1}${firstDigit2}`);

                // Right Row 2 logic
                const firstDigit1 = row1[j].charAt(0);
                const val2 = row2[j];
                rightRow2.push(`${firstDigit2}${val1}`);
            }
            rightValues.push(rightRow1);
            rightValues.push(rightRow2);
        }
        return rightValues;
    }


    // Function to perform a circular shift on the concatenated string
    function circularShiftString(str) {
        if (str.length < 2) {
            return str;
        }
        const firstTwoDigits = str.substring(0, 2);
        const remaining = str.substring(2);
        return remaining + firstTwoDigits;
    }
    // --- Page 2 Button Actions ---
    if (page2 && homeBtn && shuffleBtn && backBtn && leftGrid && rightGrid) {
        homeBtn.addEventListener('click', () => {
            // Navigate back to index.html
            window.location.href = 'index.html';
        });

        shuffleBtn.addEventListener('click', () => {
            // Perform the circular shift on the global combinedString
            combinedString = circularShiftString(combinedString);

            // Save the new state to history
            history.push({ data: combinedString });
            historyIndex++;

            // Re-render the grids with the new string
            displayGrids();

            backBtn.disabled = false;
        });

        backBtn.addEventListener('click', () => {
            if (historyIndex > 0) {
                historyIndex--;
                const previousState = history[historyIndex].data;
                combinedString = previousState;
                displayGrids();
            }
            if (historyIndex === 0) {
                backBtn.disabled = true;
            }
        });

        backBtn.disabled = true; // Initial state
    }
});