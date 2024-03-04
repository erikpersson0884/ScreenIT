const imageContainer = document.getElementById('imageContainer');
const imageCarousel = document.getElementById('imageCarousel');

const settingsDiv = document.getElementById('settingsDiv');
const hours = document.getElementById('hours');
const minutes = document.getElementById('minutes');
const seconds = document.getElementById('seconds');
const carouselSpeedInput = document.getElementById('carouselSpeedInput');


const pathToEventImages = '/img/eventImages/';


let currentIndex = 0;
let images = [];

let autoRefreshTime = 10 * 60 * 1000; //time before fetching from the server again (in milliseconds)
let carouselSpeed = 8 * 1000; // time each images is shows before going to the next (in milliseconds)
let timeBeforeHidingMenus = 5 * 1000; //milliseconds
let mouseAutoHideTime = 5 * 1000; // Time until the mosuse is hidden (in milliseconds)

if (localStorage.getItem('carouselSpeed')) {
    carouselSpeed = localStorage.getItem('carouselSpeed');
}
if (localStorage.getItem('autoRefreshTime')) {
    autoRefreshTime = localStorage.getItem('autoRefreshTime');
}


let mouseAutoHideTimer; // Variable to store the mouseAutoHideTime ID
let carouselTimer; // Variable to store the carouselTimer ID
let refreshContentTimer; // Variable to store the refreshContentTimer ID


carouselSpeedInput.value = carouselSpeed / 1000; // Set the defualt load value of the carousel speed input
hours.value = Math.floor(autoRefreshTime / (60 * 60 * 1000)); // Set the default load value of the hours input
minutes.value = Math.floor((autoRefreshTime % (60 * 60 * 1000)) / (60 * 1000)); // Set the default load value of the minutes input

imageCarousel.onerror = function() {
    console.log("Error loading image:", imageCarousel.src);
    images.splice(currentIndex, 1);
}


function displayNextImage() {
    const currentImage = images[currentIndex];
    imageCarousel.src = pathToEventImages + currentImage.path;
    currentIndex = (currentIndex + 1) % images.length;
    console.log("Next image");
}

function continueCarousel() {
    clearTimeout(carouselTimer);
    if (images.length > 0) {
        displayNextImage();
    } else {
        console.log("No images to display");
    }
    carouselTimer = setTimeout(continueCarousel, carouselSpeed);
}


function fetchUpcomingImages() {
    fetch('/api/getFutureImages')
    .then(response => response.json())
    .then(incomingImages => {
        images = incomingImages;
        console.log(images);
        continueCarousel();
    })
    .catch(error => console.error('Error fetching upcoming images:', error));
}

// hide optionsMenu after a few seconds
setTimeout(function() {
    const optionsMenu = document.getElementById('optionsMenu');

    optionsMenu.classList.add('invisible')
    settingsDiv.classList.add('invisible')
}, timeBeforeHidingMenus);


[hours, minutes, seconds].forEach(time => {
    time.addEventListener('change', function() {
        autoRefreshTime = hours.value * 60 * 60 * 1000 + minutes.value * 60 * 1000 + seconds.value * 1000;
        if (autoRefreshTime < (10 * 1000)) { 
            autoRefreshTime = 10000; // if less than 10 seconds, set to 10 seconds
        }
        console.log("Auto refresh time:", autoRefreshTime);
        fetchUpcomingImages();
        localStorage.setItem('autoRefreshTime', autoRefreshTime);
    });
});

carouselSpeedInput.addEventListener('change', function() {
    carouselSpeed = carouselSpeedInput.value * 1000;
    if (carouselSpeed < 1000) {
        carouselSpeed = 1000;
    }
    console.log("Carousel speed:", carouselSpeed);
    continueCarousel();
    localStorage.setItem('carouselSpeed', carouselSpeed);
});

// Automatically refresh the page
function automaticallyFetchImages() {
    clearTimeout(refreshContentTimer);
    fetchUpcomingImages();
    refreshContentTimer = setTimeout(automaticallyFetchImages, autoRefreshTime);
}


automaticallyFetchImages();
continueCarousel();



// Function to hide the cursor
function hideCursor() {
    document.body.style.cursor = 'none';
}

// Function to reset the mouseAutoHideTimer
function resetTimer() {
    // Clear the previous mouseAutoHideTimer
    clearTimeout(mouseAutoHideTimer);

    // Start a new mouseAutoHideTime
    mouseAutoHideTimer = setTimeout(hideCursor, mouseAutoHideTime);
}

// Event listener for mousemove event
document.addEventListener('mousemove', () => {
    // Reset the mouseAutoHideTimer when the mouse moves
    resetTimer();
    document.body.style.cursor = 'default';
});

// Initial call to reset the mouseAutoHideTimer
resetTimer();