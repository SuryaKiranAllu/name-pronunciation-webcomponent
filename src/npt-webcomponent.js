const template = document.createElement('template');
template.innerHTML = `

    <style>

        .icon {
            cursor: pointer;
            width: 24px;
            height: 24px;
        }

        .play {
        }

        .pause {
            display: none;
        }

        .record {
        }

        .stop {
            display: none;
        }

    </style>

    <div>
        <img id="play-btn" class="play" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA/0lEQVRIid2USQoCMRREH0o3iBdx41kUh3bX53G6gCs3opfRjSC20ynatbpIAiIZfkdXFtTmU6lKfn4C/44UGAFroADumoWuZVoThT5wA54BXoFeFeM6MBcYf3IG1CQBMeaGk5B5/wtzw67LPMXf84Mw4ILj4keBhU1gKQwZ2gI2gUUGOWpUfdqVLeAsDABoAXuPtrAFlBUCABrAwqEtjUg0txF42Ionx25iWnQ0wvcT7IS7y4Et0PZotrZiFjhBlTEd2AJS1Mf1i4eWuI7WE5r42HGZG8y+MB+HzEFd/DTCfELFse+i+inpebAtLiSoj2uFmu1S86hrAzwX+h94AcCGAP/8i2hpAAAAAElFTkSuQmCC"/>
        <img id="pause-btn" class="pause" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA4UlEQVRIid2UQQ6CMBBFXzRwPQmoXEnEYxDXeg9dS0RcegFcqwtaQ5oWSumKn/yknUz/bzudwtwRAilwBErgLViK2FbkOCEBauA7wAcQjxFeAgcLYZU5sLAxcBGXzIbEkwnikpFJPKS9z6kGTwyFT3sWSZjmKjcyoVsU49EcsNIF7z07UneszlWWOoPGo0EjE6zerQM+OoOXR4O/Vtfg6tHgojM4eTQ464IBUDG90Wp6ftjYg4G2B7rIJ4jvhsShrcveQTxj5LOPsKtJhcW1mBDQflwFcKPt0EaMC2AtcmaMHxiD0QtCeo1+AAAAAElFTkSuQmCC"/>
        <img id="record-btn" class="record" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA1UlEQVRIie2Uuw3CMBRFDxSpIjpgERaADfhMgyhANGGObACMARukTegCQpSRQuFngRIDdpQCRI5kPdm+713LP/gXPGADJEAMBDJWGwGQF1pQp0FiMDjZJLYsDfKq+W1Lg8o0Bt9rcEPdHF/6iUETS+yI9upiEEkcSAwNmrCgiQyal6xlVVvpe6iXG1P+KvaiXbkY9IGLJM7f6BaiOQNdFwOAGZBJgR0wRJ2JD4x4rDwDJq7FNVMgpfwP6ZYC46rFNT3U/h6fCh+ApczVijaw5vdfcsNH7larOieCuRIxAAAAAElFTkSuQmCC"/>
        <img id="stop-btn" class="stop" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABFElEQVRIie3UsUrDUBTG8Z8OnYROjZsg2M3JCs6Ci7M+jZu41OfwDXTq0lkF6+CqY+smDoKD0jrklIQa2jRmcOgH4XIu3z3/k5Pcw0o1qYFLjDBEN/ZqUxeTmadbJ2BUAHgtc3CtJGBS9fx6SUBlrQD/F/Ah/XM2Ih4VeIZ/ATzHuh/rVYGnaK+0LqRvcB1xQ3pzh2oaFZt4D8jZAu8u+kgibqKHg0WQU3wH5AaH0m/Swk7O1w/PE9q4jXigxE0/wZvfc+gTx+FJIvkEX7G+YGtR8qkSnOMhBxhIWzetsJ1LPkanbPJZTQF5NWVtGcvalaigIkBP1paOrF33yk/ruYA9PGI74hbucLRs8nmarXTpyivrB1TQTQ/5Ey3KAAAAAElFTkSuQmCC"/>
    </div>

`;

export default class NamePronunciationToolComponent extends HTMLElement {

    config = {
        recordingTime: 10, // 10 seconds
        urls: {
            textToSpeech: "",
            getAudioRecording: "",
            saveRecording: ""
        }
    }
    mediaConstraints = {
        audio: true
    };
    recorder = null;
    audioChunks = [];

    isRecording = false;
    audioRecording = null;
    recorderTimeoutId = null;

    storedAudioRecording = null;
    preferredName = "";
    legalName = "";
    recordId = "";

    audioPlayer = null;
    isPaused = false;
    
    constructor() {
        super();

        // Create a shadow root
        let shadowDOM = this.attachShadow({mode: 'open'});
        shadowDOM.appendChild(template.content.cloneNode(true));
    }

    // Lifecycle callbacks
    // Fires when an instance was inserted into the document
    connectedCallback() {
        if (!this.hasAttribute("data-text-to-speech-url") 
            || !this.getAttribute("data-text-to-speech-url").trim().length > 0) {
            throw new Error("data-text-to-speech-url attribute is required.");
        }

        this.config.urls.textToSpeech = this.getAttribute("data-text-to-speech-url");

        if (!this.hasAttribute("data-get-audio-recording") 
            || !this.getAttribute("data-get-audio-recording").trim().length > 0) {
            throw new Error("data-get-audio-recording attribute is required.");
        }

        this.config.urls.getAudioRecording = this.getAttribute("data-get-audio-recording");

        if (!this.hasAttribute("data-save-recording-url")
            || !this.getAttribute("data-save-recording-url").trim().length > 0) {
            throw new Error("data-save-recording-url attribute is required.")
        }

        this.config.urls.saveRecording = this.getAttribute("data-save-recording-url");

        if (this.hasAttribute("data-recording-timeout")) {
            try {
                this.config.recordingTime = parseInt(this.getAttribute("data-recording-timeout"));
            } catch(err) {
                this.config.recordingTime = 10; // 10 seconds
            }
        }

        if (this.hasAttribute("data-preferred-name")) {
            this.preferredName = this.getAttribute("data-preferred-name");
            console.debug("preferred name:", this.preferredName);
        }

        if (this.hasAttribute("data-legal-name")) {
            this.legalName = this.getAttribute("data-legal-name");
            console.debug("legal name:", this.legalName);
        }

        if (!this.hasAttribute("data-record-id") || !this.getAttribute("data-record-id").trim().length > 0) {
            throw new Error('data-record-id attribute is required.');
        }

        this.recordId = this.getAttribute("data-record-id");

        this.shadowRoot.querySelector("#play-btn").addEventListener("click", () => {
            this.playButtonHandler();
        });

        this.shadowRoot.querySelector("#pause-btn").addEventListener("click", () => {
            this.pauseButtonHandler();
        });

        this.shadowRoot.querySelector("#record-btn").addEventListener("click", () => {
            this.recordButtonHandler();
        });

        this.shadowRoot.querySelector("#stop-btn").addEventListener("click", () => {
            this.stopButtonHandler();
        });
    }

    // Fires when an instance was removed from the document
    disconnectedCallback() {
        this.shadowRoot.querySelector("#play-btn").removeEventListener("click", () => {
            this.playButtonHandler();
        });

        this.shadowRoot.querySelector("#pause-btn").removeEventListener("click", () => {
            this.pauseButtonHandler();
        });

        this.shadowRoot.querySelector("#record-btn").removeEventListener("click", () => {
            this.recordButtonHandler();
        });

        this.shadowRoot.querySelector("#stop-btn").removeEventListener("click", () => {
            this.stopButtonHandler();
        });
    }

    // Fires when an attribute was added, removed, or updated
    attributeChangedCallback(attrName, oldVal, newVal) {
    }

    // Fires when an element is moved to a new document
    adoptedCallback() {
    }

    // Accessors
    get legalName() {
        return this.legalName;
    }

    set legalName(pLegalName) {
        console.debug("Setter :: Legal Name:", pLegalName);
        this.legalName = pLegalName;
    }

    get preferredName() {
        return this.preferredName;
    }

    set preferredName(pPreferredName) {
        console.debug("Setter :: Preferred Name:", pLegalName);
        this.preferredName = pPreferredName;
    }

    // Button Click Handlers
    playButtonHandler() {
        console.debug("Triggered play!");

        if (this.isPaused) {
            this.audioPlayer.play();
            this.isPaused = false;
        }

        if (this.hasStoredAudioRecording()) {
            this.playAudioRecording(this.storedAudioRecording);
            return;
        } else {
            this.getAudioRecording(this.recordId)
                .then(response => {
                    if (response.ok) {
                        return response.blob()
                    } else {
                        return null;
                    }
                })
                .then(blob => {
                    if (blob != null) {
                        this.storedAudioRecording = blob;
                        this.playAudioRecording(this.storedAudioRecording);
                    } else {
                        this.continueProcessing();
                    }
                })
                .catch(err => {
                    console.error(err);
                    this.continueProcessing();
                });
        }
    }

    continueProcessing() {
        if (this.hasAudioRecording()) {
            this.playAudioRecording(this.audioRecording);
            return;
        }

        let text = "";

        if (this.preferredName != null && this.preferredName.trim().length > 0) {
            text = this.preferredName;
        } else if (this.legalName != null && this.legalName.trim().length > 0) {
            text = this.legalName;
        } else {
            text = "";
        }

        this.textToSpeech(text)
            .then(response => response.blob())
            .then(blob => {
                this.audioRecording = blob;
                this.playAudioRecording(this.audioRecording);
            })
            .catch(error => {
                console.error('Could not text to speech:', error);
            });
    }

    pauseButtonHandler() {
        console.debug("Triggered pause!");
        this.pauseAudioRecording();
    }

    async recordButtonHandler() {
        console.debug("Triggered record!");
        const stream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);

        this.recorder = new MediaRecorder(stream);
        console.debug("Supported Audio Formats:");
        console.debug("WAV:", MediaRecorder.isTypeSupported("audio/wav"));
        console.debug("WEBM:", MediaRecorder.isTypeSupported("audio/webm"));
        console.debug("OGG:", MediaRecorder.isTypeSupported("audio/ogg"));

        // Record stream
        this.recorder.addEventListener('dataavailable', event => { this.onDataAvailableHandler(event) });

        // Stop stream
        this.recorder.addEventListener('stop', event => { this.onStopHandler(event) });

        // Error handler
        this.recorder.addEventListener('error', (event) => {
            console.error(`error recording stream: ${event.error.name}`)
        });

        // Start recording
        this.recorder.start();
        this.shadowRoot.querySelector("#record-btn").style.display = "none";
        this.shadowRoot.querySelector("#stop-btn").style.display = "inline-block";

        // Set recording timeout
        this.recorderTimeoutId = setTimeout(() => {
            this.stop();
        }, this.config.recordingTime * 1000);
        
        console.info("Recorder state:", this.recorder.state);
    }

    stopButtonHandler() {
        console.debug("Triggered stop!");

        if (this.recorder != null && this.recorder.state !== "inactive") {
            this.recorder.stop();
            // TODO: check if removeEventListener should be called 
            //this.recorder.removeEventListener('dataavailable', event => { this.onDataAvailableHandler(event) });
            //this.recorder.removeEventListener('stop', event => { this.onStopHandler(event) });
            this.shadowRoot.querySelector("#stop-btn").style.display = "none";
            this.shadowRoot.querySelector("#record-btn").style.display = "inline-block";

            if (this.recorderTimeoutId != null && isFinite(this.recorderTimeoutId)) {
                clearTimeout(this.recorderTimeoutId);
            }

            console.info("Recorder state:", this.recorder.state);
        }
    }

    // Recorder Event Handlers
    onDataAvailableHandler(event) {
        this.audioChunks.push(event.data);
    }

    onStopHandler(event) {
        this.processAudioRecording();
    }

    hasStoredAudioRecording() {
        return this.storedAudioRecording != null;
    }

    hasAudioRecording() {
        return this.audioRecording != null;
    }

    clear() {
        this.recorder = null;
        this.audioChunks = [];
    }

    playAudioRecording(audioBlob) {
        if (audioBlob != null) {
            let audioURL = URL.createObjectURL(audioBlob);
            
            if (this.audioPlayer != null) {
                this.audioPlayer.removeEventListener("ended", (event) => { this.stopRecordingHandler(event) });
                this.audioPlayer = null;
            }

            this.audioPlayer = new Audio(audioURL);
            this.audioPlayer.addEventListener("ended", (event) => { this.stopRecordingHandler(event) });
            this.audioPlayer.play()
                .then(() => {
                    this.shadowRoot.querySelector("#play-btn").style.display = "none";
                    this.shadowRoot.querySelector("#pause-btn").style.display = "inline-block";
                })
                .catch(err => {
                    console.error(err);
                });
        } else {
            console.debug("No audio recording found!")
        }
    }

    pauseAudioRecording() {
        if (this.audioPlayer != null) {
            this.audioPlayer.pause();
            this.isPaused = true;
            this.shadowRoot.querySelector("#pause-btn").style.display = "none";
            this.shadowRoot.querySelector("#play-btn").style.display = "inline-block";
        }
    }

    stopRecordingHandler(event) {
        this.stopAudioRecording();
    }

    stopAudioRecording() {
        if (this.audioPlayer != null) {
            this.audioPlayer.removeEventListener("ended", (event) => { this.stopRecordingHandler(event) });
            this.shadowRoot.querySelector("#pause-btn").style.display = "none";
            this.shadowRoot.querySelector("#play-btn").style.display = "inline-block";
        }
    }

    processAudioRecording() {
        let audioBlob = new Blob(this.audioChunks);
        this.audioRecording = audioBlob;
        let confirmation = window.confirm("Do you want to save the audio recording?");
        console.debug("Confirmation dialog :: selected choice ",confirmation);

        if (confirmation) {
            this.saveAudioRecording(audioBlob)
                .then(response => {
                    console.dir("Save recording response:", response);
                })
                .catch(err => {
                    console.error("Could not save the audio recording:", err);
                    window.alert("Could not save the audio recording!");
                });
        }

        this.clear();
    }

    // Backend Service Calls
    textToSpeech(text) {
        if (text != null && text.trim().length > 0) {
            console.debug(this.config.urls.textToSpeech);
            let url = new URL(this.config.urls.textToSpeech);
            let params = {
                text: text.trim()
            };
            url.search = new URLSearchParams(params).toString();

            return fetch(url, {
                method: "GET",
                headers: {
                    "Accept": "application/octet-stream"
                }
            });
        }
    }

    getAudioRecording(recordId) {
        if (recordId != null && recordId.trim().length > 0) {
            console.debug(this.config.urls.getAudioRecording);
            let url = new URL(this.config.urls.getAudioRecording);
            let params = {
                employeeId: recordId.trim()
            };
            url.search = new URLSearchParams(params).toString();

            return fetch(url, {
                method: "GET",
                headers: {
                    "Accept": "application/octet-stream"
                }
            });
        }
    }

    saveAudioRecording(audioBlob) {
        console.debug(this.config.urls.saveRecording);
        let url = new URL(this.config.urls.saveRecording);
        let formData = new FormData();
        formData.set("recordId", this.recordId)
        formData.set("audioRecording", audioBlob)
        return fetch(url, {
            method: "POST",
            body: formData
        });
    }

}
