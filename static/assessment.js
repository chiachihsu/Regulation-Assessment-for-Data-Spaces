let userAnswers = {};

document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.getElementById('xmlFileDropdown');
    initializeDropdown(dropdown);
    dropdown.addEventListener('change', () => {
        userAnswers = {}; 
        onXmlFileSelect(dropdown);
    });
});


function initializeDropdown(dropdown) {
    const emptyOption = new Option('Select an option', '');
    dropdown.add(emptyOption, 0);
    dropdown.selectedIndex = 0;
}

function onXmlFileSelect(dropdown) {
    const selectedFileName = dropdown.value;
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.style.display = selectedFileName ? 'block' : 'none';
    questionsContainer.innerHTML = '';
    if (selectedFileName) {
        displayXmlData(selectedFileName);
    }
}


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
        // console.log("dataToDisplay:", dataToDisplay)
        // console.log("elementsByFlow:", elementsByFlow)
        var startEvent = dataToDisplay.find(item => item.outgoing && !item.incoming);
        if (startEvent) {
            let questionFlow = dataToDisplay.find(item => item.incoming === startEvent.outgoing);
            console.log("questionFlow: ", questionFlow)
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
    questionText.textContent = question.name;
    questionText.className = 'question-text'; 
    questionText.id = 'question-' + (question.sourceRef)

    newQuestionDiv.appendChild(questionText);
    questionsContainer.appendChild(newQuestionDiv);

    let optionsContainer = document.createElement('div');
    optionsContainer.id = 'optionsContainer' + (questionsContainer.childNodes.length); // Unique ID
    optionsContainer.className = 'options-container';

    newQuestionDiv.appendChild(optionsContainer);

    return optionsContainer;
}

function createOptionButton(optionElement, questionFlow, elementsByFlow, dataToDisplay, optionsContainer) {
    var optionButton = document.createElement('button');
    optionButton.textContent = optionElement.name;
    optionButton.className = 'option-button button';
    // console.log("optionElement:", optionElement)
    var  questionId = questionFlow.sourceRef;

    optionButton.addEventListener('click', function() {
        const previousAnswer = userAnswers[questionId]; 
        const newAnswer = optionElement.name; 
        const answerID = optionElement.targetRef;
        // console.log("userAnswers:", userAnswers)
        // console.log("previousAnswer:", previousAnswer)
        // console.log("newAnswer:", newAnswer)
        console.log("answerID:", answerID)
        
        markOptionAsSelected(optionsContainer, optionButton);
        // 第一次回答或者更改了答案
        if (typeof previousAnswer !== 'undefined' && previousAnswer !== newAnswer) {
            userAnswers[questionId] = newAnswer;
            console.log("questionId:", questionId)
            removeAllFollowingQuestions(questionId); // 移除后续问题
            updateFollowingQuestions(questionId, optionElement.targetRef, elementsByFlow, dataToDisplay); // 更新后续问题
        } else if (typeof previousAnswer === 'undefined') {
            userAnswers[questionId] = newAnswer;
            updateFollowingQuestions(questionId, optionElement.targetRef, elementsByFlow, dataToDisplay);
        }

        
    });
    optionsContainer.appendChild(optionButton);
}

function markOptionAsSelected(optionsContainer, selectedButton) {
    optionsContainer.querySelectorAll('.option-button.button.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    selectedButton.classList.add('selected');
}

function removeAllFollowingQuestions(currentQuestionId) {
    const questionsContainer = document.getElementById('questionsContainer');

    // Get the div that has the ID "question-Activity_Ovsgn8X" (or similar)
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

    console.log('Current question index:', currentIndex); // Should no longer be -1

    // Remove all following question divs
    while (questionsContainer.children.length > currentIndex + 1) {
        questionsContainer.removeChild(questionsContainer.children[currentIndex + 1]);
    }
}



function updateFollowingQuestions(currentQuestionId, answerID, elementsByFlow, dataToDisplay) {

    const currentQuestion = dataToDisplay.find(item => item.sourceRef === currentQuestionId);

    if (!currentQuestion || !currentQuestion.outgoing) return;

    // 找到当前问题的后续问题并开始更新流程
    let nextQuestionId = answerID;
    while (nextQuestionId) {
        const nextQuestion = dataToDisplay.find(item => item.sourceRef === nextQuestionId);
        // 如果没有找到后续问题，则结束更新
        if (!nextQuestion) break;

        // 显示下一个问题
        const optionsContainer = displayCurrentQuestion(nextQuestion);

        // 更新选项
        const nextOptionIds = elementsByFlow[nextQuestion.outgoing];
        // console.log("nextOptionIds:", nextOptionIds)
        if (nextOptionIds && nextOptionIds.targetRef) {
            updateOptions(nextOptionIds, nextQuestion, elementsByFlow, dataToDisplay, optionsContainer);
        }
        // 准备寻找下一个后续问题
        nextQuestionId = nextQuestion.outgoing;
    }
   
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
        
            if (closestMatch && lowestDistance <= 3) { // threshold 3

                var closeMatchElement = dataToDisplay.find(item => item.sourceRef === closestMatch.targetRef);
                if (closeMatchElement) {
                    let newOptionsContainer = displayCurrentQuestion(closeMatchElement);

                    if (closeMatchElement.outgoing) {
                        updateOptions(elementsByFlow[closeMatchElement.outgoing], elementsByFlow, dataToDisplay, newOptionsContainer);
                    }
                     
                }
            } else {
                optionsContainer.innerHTML = 'Please try again. No close match found for the input.';
                optionsContainer.className = 'error-message';
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