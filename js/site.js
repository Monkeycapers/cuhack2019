
var myAudio = document.querySelector('audio');
let audioCtx
let audioSource
let analyser


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
            
            console.log("thinking")

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
    analyser.fftSize = 2048 //todo: what should this be?
    let bufferLength = analyser.frequencyBinCount
    let dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    //drawArray(dataArray, bufferLength)
    //console.log(dataArray)

    let row = dataArray.join(",")
    csvContent.push(row)

    return {"array":dataArray, "length":bufferLength}
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


// // create float32 arrays for getFrequencyResponse
// var myFrequencyArray = new Float32Array(5);
// myFrequencyArray[0] = 1000;
// myFrequencyArray[1] = 2000;
// myFrequencyArray[2] = 3000;
// myFrequencyArray[3] = 4000;
// myFrequencyArray[4] = 5000;
// var magResponseOutput = new Float32Array(5);
// var phaseResponseOutput = new Float32Array(5);
// // getUserMedia block - grab stream
// // put it into a MediaStreamAudioSourceNode
// // also output the visuals into a video element 
// if (navigator.mediaDevices) {
//     console.log('getUserMedia supported.');
//     navigator.mediaDevices.getUserMedia ({audio: true, video: false})
//     .then(function(stream) {
        
//         // Create a MediaStreamAudioSourceNode
//         // Feed the HTMLMediaElement into it
//         audioCtx = new AudioContext();
//         audioSource = audioCtx.createMediaStreamSource(stream);

//         // // Create a biquadfilter
//         // var biquadFilter = audioCtx.createBiquadFilter();
//         // biquadFilter.type = "lowshelf";
//         // biquadFilter.frequency.value = 1000;
//         // biquadFilter.gain.value = range.value;

//         // connect the AudioBufferSourceNode to the gainNode
//         // and the gainNode to the destination, so we can play the
//         // music and adjust the volume using the mouse cursor
//         //source.connect(biquadFilter);

//         //biquadFilter.connect(audioCtx.destination);
//         // Get new mouse pointer coordinates when mouse is moved
//         // then set new gain value
//         // range.oninput = function() {
//         //     biquadFilter.gain.value = range.value;
//         // }
//         // function calcFrequencyResponse() {
//         //     biquadFilter.getFrequencyResponse(myFrequencyArray,magResponseOutput,phaseResponseOutput);
//         //     for (i = 0; i <= myFrequencyArray.length-1;i++){
//         //         var listItem = document.createElement('li');
//         //         listItem.innerHTML = '<strong>' + myFrequencyArray[i] + 'Hz</strong>: Magnitude ' + magResponseOutput[i] + ', Phase ' + phaseResponseOutput[i] + ' radians.';
//         //         freqResponseOutput.appendChild(listItem);
//         //     }
//         // }
//         // calcFrequencyResponse();
//     })
//     .catch(function(err) {
//         console.log('The following gUM error occured: ' + err);
//     });
// } else {
//     console.log('getUserMedia not supported on your browser!');
// }
