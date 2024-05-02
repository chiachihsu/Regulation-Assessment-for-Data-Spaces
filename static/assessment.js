let userAnswers = {};

document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.xml-file-button');
    console.log(buttons)
    buttons.forEach(button => {
        const filename = button.getAttribute('data-filename');
        const displayName = filename.replace('.xml', '');
        button.textContent = displayName; 
        button.addEventListener('click', function() {
            buttons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');

            displayXmlData(filename);  // Adjust the fetch URL according to Flask routes
        });
    });
    
    buttons.forEach(button => {
        button.addEventListener('mouseover', function() {
            const tooltip = this.nextElementSibling;
            console.log("this",this)
            console.log("tooltip", tooltip)
            showTooltip(this, tooltip); // Pass the tooltip element to the function
        });
        button.addEventListener('mouseout', function() {
            const tooltip = this.nextElementSibling;
            setTimeout(() => { // Add a slight delay to check if mouse is still over the tooltip
                if (!tooltip.matches(':hover')) {
                    tooltip.style.display = 'none';
                }
            }, 300);
        });
    });

    // Handle mouseover and mouseout on the tooltip itself
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.addEventListener('mouseover', function() {
            this.style.display = 'block';
        });
        tooltip.addEventListener('mouseout', function() {
            this.style.display = 'none';
        });
    });

    const navLinksA = document.querySelectorAll('.navbar-links a');
    navLinksA.forEach(link => {
        link.addEventListener('click', function() {
            navLinksA.forEach(node => node.classList.remove('active'));

            this.classList.add('active');
        });
    });

    const navbarToggle = document.getElementById('navbarToggle');
    const navbarLinks = document.querySelector('.navbar-links');

    navbarToggle.addEventListener('click', function() {
        navbarLinks.classList.toggle('open');
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 1000 && navbarLinks.classList.contains('open')) {
            navbarLinks.classList.remove('open');
        }
    });

    const navbarContainer = document.querySelector('.navbarContainer');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) { 
            navbarContainer.classList.add('scrolled');
        } else {
            navbarContainer.classList.remove('scrolled');
        }
    });
});


function showTooltip(button, tooltip) {
    const filename = button.getAttribute('data-filename');
    console.log("filename", filename)
    fetch(`/bpmn/${filename}`)
    .then(response => response.text())
    .then(data => {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(data, "application/xml");
        var startEvent = xmlDoc.getElementsByTagName("bpmn:startEvent")[0];
        var documentation = startEvent.getElementsByTagName("bpmn:documentation")[0];
        tooltip.innerHTML = `
            <p>${documentation ? documentation.textContent : "No documentation available"}</p>
            <button onclick="downloadXML('${filename}')"><i class="fa fa-download"></i> Download XML</button>
        `;
        tooltip.style.display = 'block';
    });
}

function downloadXML(filename) {
    const link = document.createElement('a');
    link.href = `/bpmn/${filename}`; // Ensure this URL is correct for your server setup
    link.download = filename;       // This sets the filename for the downloaded file
    document.body.appendChild(link);
    link.click();                   // Simulate a click on the link to trigger the download
    document.body.removeChild(link); // Remove the link from the DOM after triggering
}

function onXmlFileSelect(buttons) {
    const selectedFileName = buttons.value;
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.style.display = selectedFileName ? 'block' : 'none';
    questionsContainer.innerHTML = '';
    if (selectedFileName) {
        displayXmlData(selectedFileName);
        questionsContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function displayXmlData(selectedFileName) { 
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';

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
            var documentation = startEvent.getElementsByTagName("bpmn:documentation")[0];
            console.log(documentation)
            var elementInfo = {
                outgoing: startEvent_out ? startEvent_out.textContent : '',
                documentation: documentation ? documentation.textContent: '',
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
            var documentation = task.getElementsByTagName("bpmn:documentation")[0];
            var taskInfo = {
                sourceRef : taskId,
                incoming: task_in ? task_in.textContent : '',
                outgoing: task_out ? task_out.textContent : '',
                documentation: documentation ? documentation.textContent: '',
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
            var documentation = endEvent.getElementsByTagName("bpmn:documentation")[0];
            var endEventInfo = {
                sourceRef: sourceRef,
                documentation: documentation ? documentation.textContent: '',
                name: endEvent.getAttribute("name") || 'No name attribute'
            };
            dataToDisplay.push(endEventInfo);
            if (sourceRef) {
                elementsByFlow[sourceRef] = endEventInfo;
            }
        }
        // console.log("dataToDisplay:", dataToDisplay)
        var startEvent = dataToDisplay.find(item => item.outgoing && !item.incoming);
        // console.log(startEvent)
        if (startEvent) {
            let questionFlow = dataToDisplay.find(item => item.incoming === startEvent.outgoing);
            // console.log("questionFlow: ", questionFlow)
            let optionsContainer = displayCurrentQuestion(questionFlow);
            if(questionFlow) {
                var optionids = elementsByFlow[questionFlow.outgoing];
                if (optionids) {
                    updateOptions(optionids, questionFlow, elementsByFlow, dataToDisplay, optionsContainer);
                }
            }
        }
        
    })   

} 

function displayCurrentQuestion(question) {
    const questionsContainer = document.getElementById('questionsContainer');

    let newQuestionDiv = document.createElement('div');
    newQuestionDiv.className = 'question';

    let questionText = document.createElement('div');
    questionText.innerHTML = question.name;
    questionText.className = 'question-text'; 
    questionText.id = 'question-' + (question.sourceRef)

    let questionDoc = document.createElement('div');
    questionDoc.innerHTML = question.documentation;
    questionDoc.className = 'question-doc'; 

    newQuestionDiv.appendChild(questionText);
    newQuestionDiv.appendChild(questionDoc);    
    questionsContainer.appendChild(newQuestionDiv);
    newQuestionDiv.scrollIntoView({ behavior: 'smooth' });

    let optionsContainer = document.createElement('div');
    optionsContainer.id = 'optionsContainer' + (questionsContainer.childNodes.length); // Unique ID
    optionsContainer.className = 'options-container';

    newQuestionDiv.appendChild(optionsContainer);

    return optionsContainer;
}

function removeAllFollowingQuestions(currentQuestionId) {
    const questionsContainer = document.getElementById('questionsContainer');
    const currentQuestionDiv = document.getElementById('question-' + currentQuestionId);
    if (!currentQuestionDiv) {
        console.error('Current question not found in the DOM.');
        return;
    }
    // Find the parent "question" div of the current "question-text" div
    const currentQuestionContainer = currentQuestionDiv.closest('.question');
    
    if (!currentQuestionContainer) {
        console.error('Parent .question container of the current question not found.');
        return;
    }

    // Find the index of the parent "question" div
    let currentIndex = Array.from(questionsContainer.children).indexOf(currentQuestionContainer);

    // Remove all following question divs
    while (questionsContainer.children.length > currentIndex + 1) {
        questionsContainer.removeChild(questionsContainer.children[currentIndex + 1]);
    }
}

function updateFollowingQuestions(currentQuestionId, answerID, elementsByFlow, dataToDisplay) {

    const currentQuestion = dataToDisplay.find(item => item.sourceRef === currentQuestionId);

    if (!currentQuestion || !currentQuestion.outgoing) return;

    // find the next question of the current one
    let nextQuestionId = answerID;
    while (nextQuestionId) {
        const nextQuestion = dataToDisplay.find(item => item.sourceRef === nextQuestionId);
        // if not found, break the loop
        if (!nextQuestion) break;

        // display the next question
        const optionsContainer = displayCurrentQuestion(nextQuestion);

        // updation options
        const nextOptionIds = elementsByFlow[nextQuestion.outgoing];
        if (nextOptionIds && nextOptionIds.targetRef) {
            updateOptions(nextOptionIds, nextQuestion, elementsByFlow, dataToDisplay, optionsContainer);
        }
        // ready to find the next questions
        nextQuestionId = nextQuestion.outgoing;
    }
   
}

function createOptionButton(optionElement, questionFlow, elementsByFlow, dataToDisplay, optionsContainer) {
    var optionButton = document.createElement('button');
    optionButton.textContent = optionElement.name;
    optionButton.className = 'option-button button';
    var  questionId = questionFlow.sourceRef;

    optionButton.addEventListener('click', function() {
        const previousAnswer = userAnswers[questionId]; 
        const newAnswer = optionElement.name; 
        const answerID = optionElement.targetRef;
        
        markSelected(optionsContainer, optionButton);
        // 第一次回答或者更改了答案
        if (typeof previousAnswer !== 'undefined' && previousAnswer !== newAnswer) {
            userAnswers[questionId] = newAnswer;
            console.log("questionId:", questionId)
            removeAllFollowingQuestions(questionId); // 移除后续问题
            updateFollowingQuestions(questionId, answerID, elementsByFlow, dataToDisplay); // 更新后续问题
            resultBackgroundColor()
        } else if (typeof previousAnswer === 'undefined') {
            userAnswers[questionId] = newAnswer;
            updateFollowingQuestions(questionId, answerID, elementsByFlow, dataToDisplay);
            resultBackgroundColor()
        }
        
    });
    optionsContainer.appendChild(optionButton);
}

function updateOptions(optionids, questionFlow, elementsByFlow, dataToDisplay, optionsContainer) {
    // Clear the options container
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
        submitButton.className = 'option-button button'; 
        submitButton.addEventListener('click', function() {
            markSelected(optionsContainer, submitButton)
            

            var userInput = document.getElementById('userInput').value.toLowerCase();
            var closestMatch = null;
            var lowestDistance = Infinity;

            var errorDiv = optionsContainer.querySelector('.error-message');
            if (errorDiv) {
                optionsContainer.removeChild(errorDiv);
            }
            
            optionElements.forEach(option => {
                const distance = levenshteinDistance(userInput, option.name.toLowerCase());
                if (distance < lowestDistance) {
                    lowestDistance = distance;
                    closestMatch = option;
                }
            });
        
            if (closestMatch && lowestDistance <= 3) { // threshold 3
                userAnswers[questionFlow.sourceRef] = closestMatch.name;
                removeAllFollowingQuestions(questionFlow.sourceRef);
                updateFollowingQuestions(questionFlow.sourceRef, closestMatch.targetRef, elementsByFlow, dataToDisplay);
                resultBackgroundColor()
            } else {
                unmarkSelected(optionsContainer);
                removeAllFollowingQuestions(questionFlow.sourceRef);
                errorDiv = document.createElement('div');
                errorDiv.textContent = 'Please try again. No close match found for the input.';
                errorDiv.className = 'error-message';
                optionsContainer.appendChild(errorDiv);
                    } 
        });
        
        optionsContainer.appendChild(submitButton);
    } else {
        optionElements.sort((a, b) => a.name.localeCompare(b.name));
        optionElements.forEach(optionElement => {
            createOptionButton(optionElement, questionFlow, elementsByFlow, dataToDisplay, optionsContainer);
        });
    }
    
}

function markSelected(optionsContainer, selectedButton) {
    optionsContainer.querySelectorAll('.option-button.button.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    selectedButton.classList.add('selected');
}

function unmarkSelected(optionsContainer) {
    optionsContainer.querySelectorAll('.option-button.button.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
}

function resultBackgroundColor() {
    const optionsContainers = document.getElementsByClassName('options-container');

    for (const container of optionsContainers) {
        if (container.children.length === 0) {
            const questionDiv = container.closest('.question');
            if (questionDiv) {
                questionDiv.style.backgroundColor = '#FDAF7B'; 
            }
        } else {
            const questionDiv = container.closest('.question');
            if (questionDiv) {
                questionDiv.style.backgroundColor = ''; 
            }
        }
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

