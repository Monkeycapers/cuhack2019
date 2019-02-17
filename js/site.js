
var myAudio = document.querySelector('audio');
let audioCtx
let audioSource
let analyser
const FFT_SIZE = 8192

STATES = {
    zero: 0,
    reading: 1
}

let state = STATES.zero

//inputs

let startButton
let stopButton
let testFreq
let canvas
let context

let sizeX = 1500
let sizeY = 300

let timer

let running = false

let csvContent = []

let notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
let counter = 0
const COUNTER_MAX = 70
let readings = []
let finalNote

let noteStart = 0
let noteStop = 0


//var startButton = document.getElementById("start");
//var stopButton = document.getElementById("stop");

var start = function () {
    if (running) {
        alert("Already started!")
        return
    }
    if (navigator.mediaDevices) {
        console.log('getUserMedia supported.');
        navigator.mediaDevices.getUserMedia ({audio: true, video: false})
        .then(function(stream) {

            //timer = window.setInterval(getFrequencies, 1);
            
            console.log("in then func")
            
            // Create a MediaStreamAudioSourceNode
            // Feed the HTMLMediaElement into it

            running = true
            
            audioCtx = new AudioContext()

            analyser = audioCtx.createAnalyser()

            audioSource = audioCtx.createMediaStreamSource(stream)

            audioSource.connect(analyser)
            analyser.connect(audioCtx.destination)

            drawArray()
            
        })
        .catch(function(err) {
            console.log('The following gUM error occured: ' + err);
        }); 
        
    } else {
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

            var textarea = document.getElementById("textarea");
            textarea.value = csvContent.join("\n")



            // var link = document.createElement('a');
            // link.setAttribute('href', data);
            // link.setAttribute('download', 'data.csv');
            // link.click();

        })
    }
    if (timer) {
        window.clearInterval(timer)
        timer = null
    }
}

var getFrequencies = function () {
    analyser.fftSize = FFT_SIZE //todo: what should this be?
    let bufferLength = analyser.frequencyBinCount
    let dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    //drawArray(dataArray, bufferLength)
    //console.log(dataArray)
    isNote = !allZeroes(dataArray)

    if(state == STATES.zero){
        if(isNote) {
            console.log("changing to one state")
            state = STATES.one

            noteStart = Date.now()
            let length = noteStart - noteStop
            console.log(length) // LENGTH OF REST in ms
            displayNote({note: "##", duration: length}, vextab, artist)
        }
        //if no result state is not changing
    } 
    if(state == STATES.one){ //state = reading
        if(isNote) {
            result = analyzeInput(dataArray)
            if(result) finalNote = result
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
            console.log(length) // LENGTH OF NOMTE in ms
            console.log(finalNote) // NOTE TO STEPH: FINAL NOTE HAS THE NOTE THAT YOU WANT
            displayNote({note: finalNote, duration: length}, vextab, artist)
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
    context.clearRect(0, 0, sizeX, sizeY)
    context.lineWidth = 1
    let barWidth = 4
    for (var i = 0; i < freq.length; i++) {
        context.strokeStyle = "red"
        context.fillStyle = "black"
        context.fillRect(i * barWidth, 255 - freq.array[i], barWidth, freq.array[i])
        context.strokeRect(i * barWidth, 255 - freq.array[i], barWidth, freq.array[i])
    }

    

}

window.onload = function () {
    startButton = document.getElementById("start")
    stopButton = document.getElementById("stop")
    testFreq = document.getElementById("whatFreq")

    canvas = document.getElementById("canvas")
    canvas.width = sizeX
    canvas.height = sizeY
    context = canvas.getContext("2d")
    //testFreq.onclick = getFrequencies()

    startButton.onclick = start
    stopButton.onclick = stop

    var textarea = document.getElementById("textarea")
    textarea.value = ""
}

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
