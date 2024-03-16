document.addEventListener('DOMContentLoaded', function() {
    var submitButton = document.getElementById('submitKeyword');
    var keywordInput = document.getElementById('keywordInput');

    var onKeywordSubmit = function() {
        var enteredKeyword = keywordInput.value; // Captures the entered keyword
        var selectedFileName = determineXmlFile(enteredKeyword);
        if (selectedFileName) {
            displayXmlData(selectedFileName); // Pass the selected file name to the function
        } else {
            console.log("No matching XML file found for the entered keywords.");
        }
    };

    submitButton.addEventListener('click', onKeywordSubmit);
});

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