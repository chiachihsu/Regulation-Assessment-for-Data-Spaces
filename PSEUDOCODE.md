# Document Ready JavaScript Pseudocode

## Initialization
- **Initialize `userAnswers` as an empty object.**

## Document Loaded
- When the document is fully loaded:
  - **Get all buttons with class 'xml-file-button'**.
  - **Print the buttons to the console.**
  - For each button:
    - Get the data attribute 'data-filename'.
    - Replace '.xml' with an empty string in filename to create displayName.
    - Set the button text content to displayName.
    - **Add click event listener** to button:
      - Remove 'selected' class from all buttons.
      - Add 'selected' class to clicked button.
      - Display XML data for the button's filename.
    - **Add mouseover event listener** to button:
      - Get the next sibling element (tooltip).
      - Print the button and tooltip to the console.
      - Show tooltip for the button.
    - **Add mouseout event listener** to button:
      - Get the next sibling element (tooltip).
      - Set a timeout to hide the tooltip after 300ms if the mouse is not over the tooltip.
  - For each tooltip:
    - **Add mouseover event listener**:
      - Set tooltip display style to 'block'.
    - **Add mouseout event listener**:
      - Set tooltip display style to 'none'.
  - Get all links in '.navbar-links'.
  - For each link:
    - **Add click event listener**:
      - Remove 'active' class from all links.
      - Add 'active' class to clicked link.
  - Get the navbar toggle button and navbar links container.
  - **Add click event listener to navbar toggle**:
    - Toggle 'open' class on navbar links container.
  - **Add resize event listener to window**:
    - If window width is greater than 1000px and navbar is open, remove 'open' class from navbar.
  - Get the navbar container.
  - **Add scroll event listener to window**:
    - If scrolled more than 50 pixels, add 'scrolled' class to navbar container.
    - Otherwise, remove 'scrolled' class from navbar container.

## Function Definitions
- **Define function `showTooltip`**:
  - Get filename from button data attribute.
  - Fetch XML data from server for the filename.
  - Parse XML data and get startEvent and its documentation.
  - Set tooltip HTML to display documentation and a download button.
  - Set tooltip display style to 'block'.
- **Define function `downloadXML`**:
  - Create a link element with href set to the XML file URL and download attribute set to filename.
  - Append the link to document body, trigger a click on the link, and then remove the link from the document body.
- **Define function `onXmlFileSelect`**:
  - Get selected filename from buttons value.
  - Get questions container element.
  - Toggle display of questions container based on selected filename.
  - If a filename is selected, display XML data and scroll questions container into view.
- **Define function `displayXmlData`**:
  - Fetch XML data for the selected file.
  - Parse XML data and extract startEvents, tasks, gateways, sequenceFlows, and endEvents.
  - Organize data into display and element flow mappings.
  - Identify the starting point in the flow and display subsequent elements and questions.
- **Define function `displayCurrentQuestion`**:
  - Create new question and options containers.
  - Populate question text and documentation.
  - Scroll question into view and return options container.
- **Define function `removeAllFollowingQuestions`**:
  - Find current question in DOM and remove all following questions.
- **Define function `updateFollowingQuestions`**:
  - Find the next question based on the current question and update the display accordingly.
- **Define function `createOptionButton`**:
  - Create an option button for each choice.
  - Add event listener to handle button click and update user answers and displayed questions.
- **Define function `updateOptions`**:
  - Clear existing options and populate new options based on the current question flow.
- **Define function `markSelected`**:
  - Highlight the selected option.
- **Define function `unmarkSelected`**:
  - Remove highlight from all options.
- **Define function `resultBackgroundColor`**:
  - Update background color of questions based on their status.
- **Define function `levenshteinDistance`**:
  - Compute the edit distance between two strings to find the closest match.
