
var myAudio = document.querySelector('audio');
let audioCtx = new AudioContext()
let audioSource
let analyser = audioCtx.createAnalyser()


//inputs

let startButton
let stopButton

let testFreq

let timer

//var startButton = document.getElementById("start");
//var stopButton = document.getElementById("stop");

var start = function () {
    if (navigator.mediaDevices) {
        console.log('getUserMedia supported.');
        navigator.mediaDevices.getUserMedia ({audio: true, video: false})
        .then(function(stream) {

            timer = window.setInterval(getFrequencies, 1);
            
            console.log("in then func")
            
            // Create a MediaStreamAudioSourceNode
            // Feed the HTMLMediaElement into it

            audioSource = audioCtx.createMediaStreamSource(stream)

            audioSource.connect(analyser)
            analyser.connect(audioCtx.destination)
            
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
    if (audioCtx) {
         audioCtx.close().then(function () {
            //for now, refresh the window
            location.reload()
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

    

    //console.log(dataArray.sort()[bufferLength - 1])
}

window.onload = function () {
    startButton = document.getElementById("start")
    stopButton = document.getElementById("stop")
    testFreq = document.getElementById("whatFreq")
    testFreq.onclick = getFrequencies()
    startButton.onclick = start
    stopButton.onclick = stop
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
