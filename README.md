[![DOI](https://zenodo.org/badge/760088895.svg)](https://zenodo.org/doi/10.5281/zenodo.12117819)

## Regulation Assessment for Data Spaces

The aim of the project is to develop a tool to ease data compliance tasks. 
In the framework of Common European Data Spaces, data needs to be assessed in terms of its compliance with new relevant EU regulations and policies. 
The tool would provide comprehensive reports and recommendations to help organizations ensure that their data spaces meet the necessary regulatory standards.

The objective of the system is to guide the user towards discovering the legal obligations derived from the data/AI operations made.
The system has the form of a wizard-like tool, where the user answers questions in a series of steps, and gets a report in the last step depending on the given answers.
We claim that a general tool is possible, where the logic is detached from the actual questions and results.
In order to make this tool general, a decision tree parser will be programmed. The logic of the system may be encoded in BPMN (flow of the decision tree), which can be encoded as XML (BPEL).

## Example: Regulation assessment checklist for Data Spaces data sharing.

This example demostrates an assessment process and how to operate the app.
### Diagram of the process
This assessment process includes Proprietary Data Check, Data Usage Approval, Legal Compliance Check of Digital Governance Act (DGA) and Data Act

![Data Space](https://github.com/chiachihsu/Regulation-Assessment-for-Data-Spaces/blob/main/image/Data%20Space.png)

### Run the app locally
#### Step 1: Clone the Github repository

```bash
git clone https://github.com/chiachihsu/Regulation-Assessment-for-Data-Spaces.git
```

#### Step 2: Initialize the Environment

Install the necessary dependencies using the following command:
```bash
pip install -r requirements.txt
```

#### Step 3: Run the application

Start the application with following command:
```bash
python app.py
```

#### Step 4: Use the application
1. Open a browser and navigate to  http://127.0.0.1:7000
2. Click the 'Start Assessment' button in the middle of homepage or the 'Assessmet' tab on the top-right corner.

   <img src="https://github.com/chiachihsu/Regulation-Assessment-for-Data-Spaces/blob/main/image/app_home.png" alt="Home" width="800"/>
3. Choose a scenario.

   <img src="https://github.com/chiachihsu/Regulation-Assessment-for-Data-Spaces/blob/main/image/app_assessment.png" alt="Assessment" width="800"/>
4. Start the assessment process.


#### Possible extension

The users can modify/create XML file and place the file in the 'BPMN' folder to add a new process into the app.

### Run the app online

Assess to the app directly through the following link:

https://reg-assess-data-spaces-ac4fc5063977.herokuapp.com/

## Acknowledgements
INESData (https://inesdata-project.eu/) is a Spanish Incubator of Data Spaces and AI Services using federated infrastructures in the Cloud. It focuses on simplifying the tech adoption and accelerating the industry deployment of the national Data Space ecosystem by contributing with four Data Spaces (language, mobility, legal and public tender, and media) to demonstrate the benefits of Data Spaces and applicability of the related technology. It is funded by the Spanish Ministry of Digital Transformation and NextGenerationEU, in the framework of the UNICO I+D CLOUD Program - Real Decreto 959/2022.

## Disclaimer
This work is for research purposes, and you should not trust the answers.
