document.addEventListener('DOMContentLoaded', function() {
    var dropdown = document.getElementById('xmlFileDropdown');

    var emptyOption = document.createElement('option');
    emptyOption.textContent = 'Select an option';
    emptyOption.value = '';
    dropdown.insertBefore(emptyOption, dropdown.firstChild);
    dropdown.selectedIndex = 0
    
    // Function to call when selection changes
    var onXmlFileSelect = function() {
        var selectedFileName = dropdown.value; // This captures the selected file name
        displayXmlData(selectedFileName); // Pass the selected file name to the function
    };

    // Set up the event listener
    dropdown.addEventListener('change', onXmlFileSelect);

    // Call the function immediately if there's only one option
    // if (dropdown.options.length === 1) {
    //     onXmlFileSelect();
    // }
});

function displayXmlData(selectedFileName) { 
    fetch(`/bpmn/${selectedFileName}`) 
    .then(response => response.text())
    .then(data => {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(data, "application/xml");

        var dataToDisplay = [];
        var elementsByFlow = {};

        // bpmn:startEvent
        var startEvents = xmlDoc.getElementsByTagName("bpmn:startEvent");
        for (var i = 0; i < startEvents.length; i++) {
            var startEvent = startEvents[i];
            var startEvent_out = startEvent.getElementsByTagName("bpmn:outgoing")[0];
            var elementInfo = {
                outgoing: startEvent_out ? startEvent_out.textContent : '',
                name: startEvent.getAttribute("id") 
            };
            dataToDisplay.push(elementInfo);
            if (startEvent_out) {
                elementsByFlow[startEvent_out.textContent] = elementInfo;
            }
        }

        // bpmn:task
        var tasks = xmlDoc.getElementsByTagName("bpmn:task");
        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            var task_in = task.getElementsByTagName("bpmn:incoming")[0];
            var task_out = task.getElementsByTagName("bpmn:outgoing")[0];
            var taskId = task.getAttribute("id");
            var taskInfo = {
                sourceRef : taskId,
                incoming: task_in ? task_in.textContent : '',
                outgoing: task_out ? task_out.textContent : '',
                name: task.getAttribute("name") || ''
            };
            dataToDisplay.push(taskInfo);
            if (task_in) {
                elementsByFlow[task_in.textContent] = taskInfo;
            }
            if (task_out) {
                elementsByFlow[task_out.textContent] = taskInfo;
            }
        }
        

        // bpmn:exclusiveGateway
        var gateways = xmlDoc.getElementsByTagName("bpmn:exclusiveGateway");
        for (var i = 0; i < gateways.length; i++) {
            var gateway = gateways[i];
            var gateway_in = gateway.getElementsByTagName("bpmn:incoming")[0];
            var gateway_outs = gateway.getElementsByTagName("bpmn:outgoing");
            var gatewayinfo = {
                incoming: gateway_in ? gateway_in.textContent : '',
                outgoing1: gateway_outs[0] ? gateway_outs[0].textContent : '',
                outgoing2: gateway_outs[1] ? gateway_outs[1].textContent : '',
                name: gateway.getAttribute("name") || '' 
            };
            // dataToDisplay.push(gatewayinfo);
            if (gateway_in) {
                elementsByFlow[gateway_in.textContent] = gatewayinfo;
            }
            if (gateway_outs) {
                elementsByFlow[gateway_outs.textContent] = gatewayinfo;
            }
        }

        // bpmn:sequenceFlow
        var sequenceFlows = xmlDoc.getElementsByTagName("bpmn:sequenceFlow");
        for (var i = 0; i < sequenceFlows.length; i++) {
            var sequenceFlow = sequenceFlows[i];
            var sourceRef = sequenceFlow.getAttribute("sourceRef");
            var targetRef = sequenceFlow.getAttribute("targetRef");
            var flowId = sequenceFlow.getAttribute("id");
            var name = sequenceFlow.getAttribute("name") || ''
            var flowInfo = {
                incoming: flowId,
                sourceRef: sourceRef,
                targetRef: targetRef,
                name: name
            };
            dataToDisplay.push(flowInfo);
            if (sourceRef) {
                elementsByFlow[flowId] = flowInfo;
            }
        }


        // bpmn:endEvent
        var endEvents = xmlDoc.getElementsByTagName("bpmn:endEvent");
        for (var i = 0; i < endEvents.length; i++) {
            var endEvent = endEvents[i];
            var sourceRef = endEvent.getAttribute("id");
            var endEventInfo = {
                sourceRef: sourceRef,
                name: endEvent.getAttribute("name") || 'No name attribute'
            };
            dataToDisplay.push(endEventInfo);
            if (sourceRef) {
                elementsByFlow[sourceRef] = endEventInfo;
            }
        }
        

        var startEvent = dataToDisplay.find(item => item.outgoing && !item.incoming);
        // console.log("elementsByFlow: ", elementsByFlow)
        // console.log("dataToDisplay: " , dataToDisplay)
        // console.log("startEvent: ", startEvent)
        if (startEvent) {
            var questionFlow = dataToDisplay.find(item => item.incoming === startEvent.outgoing);
            console.log("questionFlow: ", questionFlow)
            displayCurrentQuestion(questionFlow);
            if(questionFlow) {
                var optionids = elementsByFlow[questionFlow.outgoing]
                console.log("optionids: ", optionids)
            }
            if (optionids) {
                updateOptions(optionids, elementsByFlow, dataToDisplay);
            }
            
            
        }
    })   
    .catch(error => console.error('Error fetching the XML file:', error));

} 



function displayCurrentQuestion(question) {
    document.getElementById('currentQuestion').innerHTML = question.name || 'No question name';

}

function createOptionButton(optionElement, elementsByFlow, dataToDisplay) {
    console.log("optionElement: ", optionElement);
    var optionButton = document.createElement('button');
    optionButton.textContent = optionElement.name;
    optionButton.setAttribute('class', 'option-button');
    optionButton.className = 'button'
    optionButton.addEventListener('click', function() {
        document.getElementById('currentQuestion').innerHTML = '';
        document.getElementById('optionsContainer').innerHTML = '';
        var returnElement = dataToDisplay.find(item => item.sourceRef === optionElement.targetRef);
        console.log(returnElement);
        if (returnElement) {
            var returnname = document.createElement('div');
            returnname.textContent = returnElement.name;
            document.getElementById('currentQuestion').appendChild(returnname);
            if (returnElement.outgoing) {
                updateOptions(elementsByFlow[returnElement.outgoing], elementsByFlow, dataToDisplay);
            }
        }
    });
    document.getElementById('optionsContainer').appendChild(optionButton);
}

function updateOptions(optionids, elementsByFlow, dataToDisplay) {
    // Clear the options container
    var optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    var optionElements = [];
    if (optionids) {
        Object.keys(elementsByFlow).forEach(key => {
            var optionElement = elementsByFlow[key];
            if (optionElement.sourceRef === optionids.targetRef) {
                optionElements.push(optionElement);
            }
        });
    }

    // Check the number of options and decide to create buttons or a text box
    if (optionElements.length > 2) {
        // > 2 options, create a text box
        var textBox = document.createElement('input');
        textBox.type = 'text';
        textBox.id = 'userInput';
        textBox.placeholder = 'Type your answer here';
        textBox.className = 'input-text'; 
        optionsContainer.appendChild(textBox);

        var submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.className = 'submit-button'; 
        submitButton.addEventListener('click', function() {
            currentQuestion.className = 'root';

            var userInput = document.getElementById('userInput').value.toLowerCase();
            var closestMatch = null;
            var lowestDistance = Infinity;
            
            optionElements.forEach(option => {
                const distance = levenshteinDistance(userInput, option.name.toLowerCase());
                if (distance < lowestDistance) {
                    lowestDistance = distance;
                    closestMatch = option;
                }
            });
            // console.log("Closest match: ", closestMatch);
            // console.log("lowestDistance: ", lowestDistance);
        
            if (closestMatch && lowestDistance <= 3) { // threshold 3

                var closeMatchElement = dataToDisplay.find(item => item.sourceRef === closestMatch.targetRef);
                if (closeMatchElement) {
                    document.getElementById('currentQuestion').innerHTML = '';
                    var returnmatch = document.createElement('div');
                    returnmatch.textContent = closeMatchElement.name;
                    document.getElementById('currentQuestion').appendChild(returnmatch);
                    if (closeMatchElement.outgoing) {
                        updateOptions(elementsByFlow[closeMatchElement.outgoing], elementsByFlow, dataToDisplay);
                    }
                    optionsContainer.removeChild(textBox);
                    optionsContainer.removeChild(submitButton); 
                }
            } else {
                document.getElementById('currentQuestion').innerHTML = 'Please try again. No close match found for the input.';
                currentQuestion.className = 'error-message';
                userInputField.value = '';
            } 
        });
        
        optionsContainer.appendChild(submitButton);
    } else {
        optionElements.sort((a, b) => a.name.localeCompare(b.name));
        optionElements.forEach(optionElement => {
            createOptionButton(optionElement, elementsByFlow, dataToDisplay);
        });
    }
}

function levenshteinDistance(s, t) {
    const track = Array(t.length + 1).fill(null).map(() => Array(s.length + 1).fill(null));
    for (let i = 0; i <= s.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= t.length; j += 1) track[j][0] = j;

    for (let j = 1; j <= t.length; j += 1) {
        for (let i = 1; i <= s.length; i += 1) {
            const indicator = s[i - 1] === t[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }

    return track[t.length][s.length];
}