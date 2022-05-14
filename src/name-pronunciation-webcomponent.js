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
        }

        .record {
        }

        .stop {
        }

    </style>

    <div>
        <img id="play-btn" class="icon" src="/images/icons8-play-button-circled-24.png">
        <img id="pause-btn" class="pause icon" src="/images/icons8-pause-button-24.png">
        <img id="record-btn" class="record icon" src="/images/icons8-microphone-24.png">
        <img id="stop-btn" class="stop icon" src="/images/icons8-block-microphone-24.png">
    </div>

`;

export default class NamePronunciationToolComponent extends HTMLElement {

    config = {
        url: {
            speechSynthesis: "http://localhost:8080/spellbind/speechSynthesis"
        }
    }
    mediaConstraints = {
        audio: true
    };
    recorder = null;
    audioChunks = [];
    legalName = "";
    preferredName = "";

    constructor() {
        super();

        // Create a shadow root
        let shadowDOM = this.attachShadow({mode: 'open'});
        shadowDOM.appendChild(template.content.cloneNode(true));

        if (this.hasAttribute("data-legal-name")) {
            this.legalName = this.getAttribute("data-legal-name");
            console.debug("legal name:", this.legalName);
        }

        if (this.hasAttribute("data-preferred-name")) {
            this.preferredName = this.getAttribute("data-preferred-name");
            console.debug("preferred name:", this.preferredName);
        }
    }

    // Fires when an instance was inserted into the document
    connectedCallback() {
        this.shadowRoot.querySelector("#play-btn").addEventListener("click", () => {
            this.play();
        });

        this.shadowRoot.querySelector("#pause-btn").addEventListener("click", () => {
            this.pause();
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

    play() {
        console.debug("Clicked play!");
        this.pronounceText();
    }

    pause() {
        console.debug("Clicked pause!");
    }

    async record() {
        console.debug("Clicked record!");
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
        console.info("Recorder state:", this.recorder.state);
    }

    stop() {
        console.debug("Clicked stop!");

        if (this.recorder != null && this.recorder.state !== "inactive") {
            this.recorder.stop();
            console.info("Recorder state:", this.recorder.state);
        }
    }

    onDataAvailable(event) {
        this.audioChunks.push(event.data);
    }

    onStopRecording(event) {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        this.clear();
    }

    clear() {
        this.recorder = null;
        this.audioChunks = [];
    }

    pronounceText() {
        if (this.preferredName.trim().length > 0) {
            let url = new URL(this.config.url.speechSynthesis);
            let params = {
                text: this.preferredName
            };
            url.search = new URLSearchParams(params).toString();

            fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/octet-stream'
                }
            })
            .then(response => response.blob())
            .then(getBlob => {
                const audioUrl = URL.createObjectURL(getBlob);
                const audio = new Audio(audioUrl);
                audio.play();
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
        }
    }

}
