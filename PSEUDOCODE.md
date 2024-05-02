## Initialize:
- Create an empty userAnswers object to store responses.

## When the DOM content is fully loaded:
- Set up the dropdown for XML file selection.
- Initialize the dropdown with an initial "Select an option" choice.
- Add event listener to the dropdown to handle changes.
- Set up navigation links to toggle the 'active' class on click.
- Add a listener to the navbar toggle to open/close the navbar links on click.
- Add listeners to handle resizing and scrolling events to adjust UI elements accordingly.

## Functions:
### 1. initializeDropdown(dropdown)
   - Add an initial empty option to the dropdown.
   - Set the default selected index of the dropdown.

### 2. onXmlFileSelect(dropdown)
   - Fetch and display data related to the selected XML file.
   - Show or hide questions container based on file selection.

### 3. displayXmlData(selectedFileName)
   - Fetch XML data from a server.
   - Parse XML and extract data for rendering.
   - Update UI with parsed data and establish flow based on the XML structure.

### 4. displayCurrentQuestion(question)
   - Display the current question in the UI.
   - Return the container for possible options.

### 5. removeAllFollowingQuestions(currentQuestionId)
   - Remove all questions in the UI that follow the current question.

### 6. updateFollowingQuestions(currentQuestionId, answerID)
   - Based on the answer, update the flow of questions displayed.

### 7. createOptionButton(optionElement)
   - Create and configure a button for each option.
   - Add event listener to handle option selection and update the flow based on the choice.

### 8. updateOptions(optionids)
   - Depending on the number of options, either display buttons or an input field for freeform text.
   - Handle the logic for matching user input to expected answers.

### 9. markSelected(optionsContainer, selectedButton)
   - Mark an option as selected and update the UI accordingly.

### 10. unmarkSelected(optionsContainer)
   - Remove the 'selected' marking from options.

### 11. resultBackgroundColor()
   - Update the background color of questions based on certain conditions.

### 12. levenshteinDistance(s, t)
   - Compute the Levenshtein distance between two strings to measure similarity.
