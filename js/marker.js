function logToUser(msg) {
    console.log(msg);
    let msgBar = document.getElementById("message");
    msgBar.innerText = msg;
    setTimeout(function () {
        msgBar.innerText = "";
    }, 3000);
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

let filename = "lovefool.mp3";
let finalFilename = "lovefool_marked.yaml";

function onUpload({target}) {
    // Make sure we have files to use
    if (!target.files.length) return;

    filename = target.files.item(0).name;
    finalFilename = filename.replace(/\.[^/.]+$/, "") + ".yaml";

    console.log(`Uploaded '${filename}' to become ${finalFilename}`);

    let button = document.getElementById("upload-btn");
    button.innerText = "Change audio";
    // Create a blob that we can use as a src for our audio element
    const urlObj = URL.createObjectURL(target.files[0]);

    // Create an audio element, removing existing if it exists
    let existingAudioElement = document.getElementById("audio-player");
    if (existingAudioElement !== null) {
        existingAudioElement.remove();
    }
    const audio = document.createElement("audio");
    audio.id = "audio-player"

    // Append the audio element
    let holder = document.getElementById("audio-player-wrapper");
    holder.appendChild(audio);

    // Allow us to control and see the audio element
    audio.controls = true;

    // Set the src and start loading the audio from the file
    audio.src = urlObj;
}

let startTime = new Date();
let isMarking = false;
let marks = [];
let secondaryMarks = [];

function offerMarksDownload(){
    let endTime = new Date();
    let elapsedMs = endTime - startTime;
    let text = "type1:\n";
    marks.forEach(item => {
        text += " - " + item + "\n";
    });
    text += "type2:\n"

    secondaryMarks.forEach(item => {
        text += " - " + item + "\n";
    });

    download(finalFilename, text);
}


function startMarking() {
    let audioPlayer = document.getElementById("audio-player");
    if (audioPlayer === null) { // ignore if no audio is uploaded yet
        return;
    }

    // reset state from previous marking
    audioPlayer.currentTime = 0;
    let markersHolder = document.getElementById("markers");
    markersHolder.innerHTML = "";
    let progress = document.getElementById("progression-info");
    progress.innerHTML = "";
    marks = [];
    secondaryMarks = [];

    audioPlayer.play();
    startTime = new Date();
    isMarking = true;
}

function stopMarking() {
    let endTime = new Date();
    let elapsedMs = endTime - startTime;
    logToUser(`Elapsed: ${elapsedMs}ms`);
    let audioPlayer = document.getElementById("audio-player");
    audioPlayer.pause();
    isMarking = false;
}

function mark(secondary = false) {
    if (!isMarking) {
        return;
    }

    let currentTime = new Date();
    let elapsedMs = currentTime - startTime;
    if (secondary) {
        secondaryMarks.push(elapsedMs);
    } else {
        marks.push(elapsedMs);
    }
    let markersHolder = document.getElementById("markers");
    let suffix = "&#9;";
    if ((marks.length + secondaryMarks.length - 1) % 8 === 0) {
        suffix = "<br>"
    }
    markersHolder.innerHTML = elapsedMs + suffix + markersHolder.innerHTML;

    let progress = document.getElementById("progression-info");
    progress.innerHTML = `<button onclick="offerMarksDownload()" class="link-button link-button-inverse">Download '${finalFilename}'</button><br><br>`;
    progress.innerHTML += `Markers recorded:&#9;&#9;${marks.length}<br>`;
    progress.innerHTML += `Secondary markers recorded:&#9;${secondaryMarks.length}<br>`;
    progress.innerHTML += `Total markers recorded:&#9;&#9;${secondaryMarks.length + marks.length}<br>`;

}

let audioInput = document.getElementById("audio-upload");
audioInput.addEventListener("change", onUpload);

let leftKeys = ["q", "w", "e", "r", "t", "a", "s", "d", "f", "g", "z", "x", "c", "v", "b"];
let rightKeys = ["y", "u", "i", "o", "p", "h", "j", "k", "l", "n", "m"];
document.addEventListener("keypress", event => {
    console.log("Key pressed: " + event);
    if (event.key === " ") {
        if (isMarking) {
            stopMarking();
        } else {
            startMarking();
        }
        event.stopPropagation();
        return;
    }
    if (leftKeys.includes(event.key)) {
        mark();
    } else if (rightKeys.includes(event.key)) {
        mark(true);
    }


})
