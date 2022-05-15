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
            speechSynthesis: "http://localhost:8080/spellbind/speechSynthesis",
            saveRecording: "http://localhost:8080/spellbind/storeAudioFile"
        }
    }
    mediaConstraints = {
        audio: true
    };
    recorder = null;
    audioChunks = [];
    audioData = [];
    isRecording = false;
    audioRecording = null;
    recorderTimeoutId = null;
    recordedAudioData = [];
    audioPlayer = null;
    preferredName = "";
    legalName = "";
    
    constructor() {
        super();

        // Create a shadow root
        let shadowDOM = this.attachShadow({mode: 'open'});
        shadowDOM.appendChild(template.content.cloneNode(true));
    }

    // Lifecycle callbacks
    // Fires when an instance was inserted into the document
    connectedCallback() {
        if (this.hasAttribute("data-audio-data")) {
            let audioData = this.getAttribute("data-audio-data");

            
        }

        if (this.hasAttribute("data-preferred-name")) {
            this.preferredName = this.getAttribute("data-preferred-name");
            console.debug("preferred name:", this.preferredName);
        }

        if (this.hasAttribute("data-legal-name")) {
            this.legalName = this.getAttribute("data-legal-name");
            console.debug("legal name:", this.legalName);
        }

        this.shadowRoot.querySelector("#play-btn").addEventListener("click", () => {
            this.play();
        });

        this.shadowRoot.querySelector("#pause-btn").addEventListener("click", () => {
            this.pauseHandler();
        });

        this.shadowRoot.querySelector("#record-btn").addEventListener("click", () => {
            this.record();
        });

        this.shadowRoot.querySelector("#stop-btn").addEventListener("click", () => {
            this.stop();
        });
    }

    // Fires when an instance was removed from the document
    disconnectedCallback() {
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

    play() {
        console.debug("Triggered play!");

        if (this.hasAudioRecording()) {
            this.playAudioRecording();
            return;
        }

        let text = "";

        if (this.preferredName != null && this.preferredName.trim().length > 0) {
            text = this.preferredName;
        }

        if (this.legalName != null && this.legalName.trim().length > 0) {
            text = this.legalName;
        }

        this.textToSpeech(text)
            .then(response => response.blob())
            .then(blob => {
                const audioUrl = URL.createObjectURL(blob);
                this.audioRecording = new Audio(audioUrl);
                this.audioRecording.play();
            })
            .catch(error => {
                console.error('Could not text to speech:', error);
            });
    }

    hasAudioRecording() {
        return this.audioRecording != null;
    }

    playAudioRecording() {
        if (this.hasAudioRecording()) {
            this.audioRecording.play();
            this.audioRecording.addEventListener("ended", this.pause());
            this.shadowRoot.querySelector("#play-btn").style.display = "none";
            this.shadowRoot.querySelector("#pause-btn").style.display = "inline-block";
        } else {
            console.debug("No audio recording found!")
        }
    }

    pauseHandler() {
        console.debug("Triggered pause!");
        this.pause();
    }

    pause() {
        if (this.audioRecording != null) {
            this.audioRecording.pause();
            this.shadowRoot.querySelector("#pause-btn").style.display = "none";
            this.shadowRoot.querySelector("#play-btn").style.display = "inline-block";
            this.audioRecording.removeEventListener("ended", this.pause());
        }
    }

    async record() {
        console.debug("Triggered record!");
        const stream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
        this.recorder = new MediaRecorder(stream);

        // Record stream
        this.recorder.addEventListener('dataavailable', event => { this.onDataAvailable(event) });

        // Stop stream
        this.recorder.addEventListener('stop', event => { this.onStopRecording(event) });

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

    stop() {
        console.debug("Triggered stop!");

        if (this.recorder != null && this.recorder.state !== "inactive") {
            this.recorder.stop();
            this.shadowRoot.querySelector("#stop-btn").style.display = "none";
            this.shadowRoot.querySelector("#record-btn").style.display = "inline-block";

            if (this.recorderTimeoutId != null && isFinite(this.recorderTimeoutId)) {
                clearTimeout(this.recorderTimeoutId);
            }

            console.info("Recorder state:", this.recorder.state);
        }
    }

    onDataAvailable(event) {
        this.audioChunks.push(event.data);
    }

    onStopRecording(event) {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        //audio.play();
        let confirmation = window.confirm("Do you want to save the audio recording?");
        console.debug(confirmation);

        if (confirmation) {
            this.saveRecording(audioBlob)
                .then(response => {
                    console.dir(response);
                })
                .catch(err => {
                    console.error("Could not save the recording:", err);
                });
        }

        this.clear();
    }

    clear() {
        this.recorder = null;
        this.audioChunks = [];
    }

    textToSpeech(text) {
        if (text != null && text.trim().length > 0) {
            let url = new URL(this.config.urls.speechSynthesis);
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

    saveRecording(audioBlob) {
        let url = new URL(this.config.urls.saveRecording);
        let formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");
        return fetch(url, {
            method: "POST",
            body: formData
        });
    }

}