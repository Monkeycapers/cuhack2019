
var myAudio = document.querySelector('audio');

let audioCtx
let audioSource
let audioPlayer
let recorder
let analyser
let chunks = []
let blob

let timer

let running = false

const FFT_SIZE = 8192
let MIN_DB = -32

STATES = {
    zero: 0,
    reading: 1
}

let state = STATES.zero

//inputs
let startButton
let stopButton
let testFreq
let saveButton
let selectMic
let selectOpus
let serverOutput

//draw stuff
let canvas
let context

let sizeX = 1500
let sizeY = 300

let csvContent = []

let notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
let readings = []
let finalNote

let noteStart = 0
let noteStop = 0
let counter = 0

//let VexTabDiv = document.getElementById("boo")

vextab = VexTabDiv
let temp = "tabstave notation=true tablature=false time=4/4\nnotes "
VexTab = vextab.VexTab
Artist = vextab.Artist
Renderer = Vex.Flow.Renderer
let first = true

function onDataAvailable(evt) {
    console.log("push chunk data")
    chunks.push(evt.data)
}

function onStop(evt) {
    console.log("////stopping///")
    //console.log(chunks)
    blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
    document.getElementById("audioPlayer").src = URL.createObjectURL(blob);
}

function start() {

    readings = []

    audioCtx = new AudioContext()

    if (running) {
        alert("Already started!")
        return
    }
    if (navigator.mediaDevices && selectMic.checked) {
        console.log('getUserMedia supported.');
        navigator.mediaDevices.getUserMedia ({audio: true, video: false})
        .then(function(stream) {
            //timer = window.setInterval(getFrequencies, 1);
            
    console.log("in then func")
            
    // Create a MediaStreamAudioSourceNode
    // Feed the HTMLMediaElement into it

    running = true

    analyser = audioCtx.createAnalyser()
    recorder = new MediaRecorder(stream)

    audioSource = audioCtx.createMediaStreamSource(stream)

    audioSource.connect(analyser)
    analyser.connect(audioCtx.destination)

    recorder = new MediaRecorder(stream)

    recorder.ondataavailable = onDataAvailable
    recorder.onstop = onStop

    recorder.start()

    drawArray()
        })
        .catch(function(err) {
            console.log('The following gUM error occured: ' + err);
            console.log(err.stack)
        });
        
    }
    else if (selectOpus.checked) {
        
        let fileReader = new FileReader()
        let arrayBuffer
        //let source

        console.log("load opus")

        fileReader.onloadend = () => {
            
            arrayBuffer = fileReader.result
            //console.log(arrayBuffer)
            //fileReader.readAsArrayBuffer(blob)

            audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
                audioSource = audioCtx.createBufferSource()
                audioSource.buffer = buffer
                //timer = window.setInterval(getFrequencies, 1);
            
                console.log("loaded opus, running...")

                running = true

                analyser = audioCtx.createAnalyser()

                audioSource.connect(analyser)
                analyser.connect(audioCtx.destination)

                audioSource.start()

                drawArray()

            }, function(err) {
            console.log(err)
            }
            );

        }

        fileReader.readAsArrayBuffer(blob)
        console.log("loading opus....")

    }
     else {
        console.log('getUserMedia not supported on your browser!');
    }

    console.log("test")
    
}

var stop = function () {
    running = false
    if (audioCtx) {
         audioCtx.close().then(function () {
            //for now, refresh the window
            //location.reload()

            for(let i = 0;i < csvContent.length;i++){
                let nonzero = false
                for(let j = 0;j < csvContent[i].length;j++){
                    if(csvContent[i][j] != 0) {
                        nonzero = true
                        break
                    }
                }
                if(!nonzero) csvContent.splice(i,1);
            }
            //var data = encodeURI('data:text/csv;charset=utf-8,' + csvContent.join("\n"));
            
            //console.log("thinking")

            //var textarea = document.getElementById("textarea");
            //textarea.value = csvContent.join("\n")

            // var link = document.createElement('a');
            // link.setAttribute('href', data);
            // link.setAttribute('download', 'data.csv');
            // link.click();

        })
    }
    if (recorder) {
        recorder.stop()
    }
    if (timer) {
        window.clearInterval(timer)
        timer = null
    }
    
}

var getFrequencies = function () {
    analyser.fftSize = FFT_SIZE

    if(showVis.checked) analyser.minDecibels = -100
    else analyser.minDecibels = -32

    let bufferLength = analyser.frequencyBinCount
    let dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    //drawArray(dataArray, bufferLength)
    //console.log(dataArray)
    isNote = !allZeroes(dataArray)

    if(state == STATES.zero){
        if(isNote) {
            //console.log("changing to one state")
            state = STATES.one

            noteStart = Date.now()
            let length = noteStart - noteStop
            console.log(length) // LENGTH OF REST in ms
            if(length > 1000 && noteStop != 0) displayNote({note: "##", duration: length})
        }
        //if no result state is not changing
    } else if(state == STATES.one){ //state = reading
        if(isNote) {
            let prev = finalNote
            result = analyzeInput(dataArray)
            if(result) {
                finalNote = result
                
                let index = notes.indexOf(prev)
                if(prev && finalNote != prev && finalNote != notes[(index-1)%12] && finalNote != notes[(index+1)%12]) {
                    noteStop = Date.now()
                    let length = noteStop - noteStart
                    if(length > 150){
                        console.log("Length: " + length + " " + "Note: " + finalNote) // LENGTH OF NOTE in ms
                        displayNote({note: prev, duration: length})
                    }
                    noteStart = Date.now()
                }
            }
            //readings.push(getMaxFreq(dataArray))
        } else { //when no more notes
            // let sum = 0;
            // for(let i = 0;i < readings.length;i++){
            //     sum += readings[i]
            // }
            // let avg = sum / readings.length
            // console.log(getNote(getKeyNum(avg))
            noteStop = Date.now()
            let length = noteStop - noteStart
            while(length > 0){
                console.log("Length: " + length + " " + "Note: " + finalNote) // LENGTH OF NOMTE in ms
                displayNote({note: finalNote, duration: length})
                length -= 700
            }
            //console.log("changing to zero state")
            state = STATES.zero
            readings = []
        }
    }

    // let result = analyzeInput(dataArray)
    // if(result) console.log(result)

    // let row = dataArray.join(",")
    // csvContent.push(row)

    return {"array":dataArray, "length":bufferLength}
}

function getNote(){
    return finalNote
}

function drawArray() {
    if (!running) return;
    requestAnimationFrame(drawArray)
    //let context = canvas.getContext("2d")
    freq = getFrequencies()
    context.clearRect(0, 0, canvas.width, sizeY)
    context.lineWidth = 1
    let barWidth = 4
    for (var i = 0; i < freq.length; i++) {
        context.strokeStyle = "white"

        var grd = context.createLinearGradient(i * barWidth, 0, i *barWidth, 255);
        grd.addColorStop(0, "red");
        grd.addColorStop(0.5, "orange");
        grd.addColorStop(1, "#87ffff");

        context.fillStyle = grd
        context.fillRect((i * barWidth), 255 - freq.array[i], barWidth - 1, freq.array[i])
        context.fillStyle = "white"
        context.fillRect((i * barWidth), 255 - freq.array[i], 1, freq.array[i])
        //context.strokeRect(i * barWidth, 255 - freq.array[i], barWidth, freq.array[i])
    }
}

function save() {
    if (!blob)  {
        alert("You need to have played and then stopped to save!")
        return
    }
    else {
        let name = saveText.value
        if (name == "") {
            alert("Must include a name for the recording!")
            return
        }

        var formData = new FormData();
        console.log(blob)
        formData.append('file', blob, name + '.opus');
        $.ajax({
            type: 'POST',
            url: '/saveRecording',
            data: formData,
            processData: false,
            contentType: false
        }).done(function(data) {
            console.log(data);
            jobj = JSON.parse(data)
            serverOutput.innerHTML = 'Saved file as: ' + jobj['file']
        });

        //todo: If you need it... posting json to server
        // let requestJson = {
        //     name:name,
        //     blob:blob
        // }

        // $.post("saveRecording", JSON.stringify(requestJson), function(data, status) {
        //     console.log("save status: " + status)
        // })
    }

}

function load() {
    let name = saveText.value
    if (name == "") {
        alert("Must include a name for the recording!")
        return
    }

    var oReq = new XMLHttpRequest();
    oReq.open("GET", "recordings/" + name + ".opus", true);
    oReq.responseType = "blob";

    oReq.onload = function(oEvent) {
    blob = oReq.response;
    serverOutput.innerHTML = "Loaded: " + name +".opus!";
    };

    oReq.send();

}

window.onload = function () {
    startButton = document.getElementById("start")
    stopButton = document.getElementById("stop")
    testFreq = document.getElementById("whatFreq")
    audioPlayer = document.getElementById("audioPlayer")
    saveText = document.getElementById("saveText")
    saveButton = document.getElementById("saveButton")
    selectMic = document.getElementById("selectMic")
    selectMic.checked = true
    selectOpus = document.getElementById("selectOpus")

    canvas = document.getElementById("canvas")
    canvas.width = $(document).width()
    canvas.height = sizeY
    context = canvas.getContext("2d")

    serverOutput = document.getElementById("serverOutput")
    //testFreq.onclick = getFrequencies()

    startButton.onclick = start
    stopButton.onclick = stop

    saveButton.onclick = save
    loadButton.onclick = load

    showVis = document.getElementById("showVis")
    noShowVis = document.getElementById("noShowVis")
    noShowVis.checked = true
    
    //var textarea = document.getElementById("textarea")
    //textarea.value = ""
}

$.ready(function () {
    canvas.width = $(document).width();
})

function analyzeInput(data){
    return getNote(getKeyNum(getMaxFreq(data)))
}

function getMaxFreq(data){
    let maxValue = 0
    let maxIndex = 0
    for(let i = 0;i < data.length;i++){
        if(data[i] > maxValue) {
            maxValue = data[i]
            maxIndex = i + 1
        }
    }
    freq = maxIndex * ((44100 / analyser.fftSize) / 2)
    return freq // Sample rate/FFT size
}

function getKeyNum(freq){
    return Math.round(12*Math.log2(freq/440) + 49)
}

function getNote(keyNum){
    return notes[(keyNum) % 12]
}

function allZeroes(data){
    for(let i = 0;i < data.length;i++){
        if(data[i] != 0) return false
    }
    return true
}
function clearCanvas(){
    var canvas = document.getElementById('boo')
    const context = canvas.getContext('2d')
    context.clearRect(100, 100, 1500, 1500)
    temp = ""
    first = true
}
function displayNote(obj){
    console.log(first)
    var canvas = document.getElementById('boo')
    const context = canvas.getContext('2d')
    context.clearRect(100, 100, 1500, 1500)

    renderer = new Renderer($('#boo')[0], Renderer.Backends.CANVAS)
    artist = new Artist(10, 10, 1500, {scale: 0.8})
    vextab = new VexTab(artist)

    if(counter%4 == 0){
        if(temp.charAt(temp.length-1) == '-'){
            temp = temp.substring(0, temp.length-1)
        }
        temp += "|"
        console.log(temp)
    }

    if (counter%32 == 0 && !first){
        temp += "\ntabstave notation=true tablature=false time=4/4\n notes "
        console.log(temp)
        first = !first
    }

    if(obj.note == "##"){
        if(temp.charAt(temp.length-1) == '-'){
            temp = temp.substring(0, temp.length-1)
        }
        temp+= "##"
        vextab.parse(temp)
        console.log(temp)
        artist.render(renderer);
    }else{
        temp+= obj.note + "/4"
        vextab.parse(temp)
        console.log(temp)
        artist.render(renderer);
        temp += "-"
    }
    counter ++
    
}
