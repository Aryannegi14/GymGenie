const steps = document.querySelectorAll('.step');
const options = document.querySelectorAll('.options button');
const goBackButtons = document.querySelectorAll('.go-back');
let userSelections = {};
let currentStep = 0;

// Hard-coded video IDs
const videoMap = {
    "push up": "IODx7oqm-Sg",
    "dumbbell row": "roGqW-S4818",
    "bodyweight squat": "YaN9gB7yv40",
    "plank": "T-nUjJ2M5Lw",
    "jumping jack": "c4dKq_K_G0M",
    "bicep curl": "s41J8QgnFJM",
    "tricep extension": "y2M02D-f4Q4",
    "chest press": "u5uU_zYQy9I",
    "pull up": "eGo4ig5BXyU",
    "russian twists": "2l9J4BvJ-kM",
    "lunge": "QO4_V-5d_3g",
    "deadlift": "OpvJ2fD50X0",
    "front raises": "s2Sg272Xz9Q",
    "lateral raises": "V295bY64z2Y",
    "reverse fly": "Z0z6w2yD-sM",
    "incline dumbbell press": "8I4Mh5g5_pA"
};

// 🔑 Replace with your YouTube Data API key
const YOUTUBE_API_KEY = "AIzaSyCLSA1UFlVxmPITXqxwMWbBkIqe851ul00";

// Fetch video from YouTube API
async function fetchYouTubeVideoId(query) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`
        );
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].id.videoId;
        }
    } catch (error) {
        console.error("YouTube API error:", error);
    }
    return null;
}

// Step display
function showStep(stepIndex) {
    steps.forEach((step, index) => {
        step.classList.toggle('hidden', index !== stepIndex);
    });
}

// Handle option click
function handleOptionClick(event) {
    const selectedValue = event.target.dataset.value;
    const parentStep = event.target.closest('.step');
    const stepId = parentStep.id;

    if (stepId === 'step-1') userSelections.muscle = selectedValue;
    if (stepId === 'step-2') userSelections.time = selectedValue;
    if (stepId === 'step-3') userSelections.level = selectedValue;
    if (stepId === 'step-4') userSelections.location = selectedValue;

    currentStep++;
    if (currentStep < steps.length - 2) {
        showStep(currentStep);
    } else {
        showStep(steps.length - 2);
        generateWorkout();
    }
}

// Handle go back
function handleGoBackClick() {
    currentStep--;
    if (currentStep >= 0) showStep(currentStep);
}

options.forEach(button => button.addEventListener('click', handleOptionClick));
goBackButtons.forEach(button => button.addEventListener('click', handleGoBackClick));

// Markdown converter
function convertMarkdownToHtml(text) {
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>');
    html = html.replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>');
    html = html.replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>');
    return html;
}

// Generate workout
async function generateWorkout() {
    console.log("Generating workout with these selections:", userSelections);
    
    try {
        const response = await fetch('/generate-workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userSelections)
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        if (data.success) {
            const lines = data.workout.split('\n');
            let workoutHTML = '';
            
            for (const line of lines) {
                if (line.toLowerCase().includes('video search:') || line.toLowerCase().includes('youtube search:')) {
                    const videoQuery = line.split(':')[1].trim().toLowerCase();
                    console.log("Fetching video for query:", videoQuery);
                    let videoId = videoMap[videoQuery] || await fetchYouTubeVideoId(videoQuery);

                    if (videoId) {
                        workoutHTML += `
                            <div class="video-container">
                                <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                            </div>
                        `;
                    } else {
                        workoutHTML += `<p>Couldn't find video for: ${videoQuery}</p>`;
                    }
                } else if (line.trim() !== '') {
                    workoutHTML += `<p>${convertMarkdownToHtml(line)}</p>`;
                }
            }
            
            document.getElementById('workout-content').innerHTML = workoutHTML;
            showStep(steps.length - 1);
        } else {
            document.getElementById('loading').innerHTML = '<p>Error generating workout. Please try again.</p>';
        }

    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById('loading').innerHTML = '<p>Something went wrong. Please check the console.</p>';
    }
}

// Back to homepage button
document.getElementById('back-home').addEventListener('click', () => {
    userSelections = {};
    currentStep = 0;
    showStep(0);
});

showStep(0);

