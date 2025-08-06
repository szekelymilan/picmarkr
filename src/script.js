const CROP_WIDTH = 1080;
const CROP_HEIGHT = 1350;
const LOGO_URL = 'logo.svg';
const LOGO_SIZE = 0.05; // Logo size as a fraction of canvas height.
const LOGO_MARGIN = 1; // Margin around logo as a fraction of logo height.
const DEFAULT_SETTINGS = { keepOriginal: false, addGradient: false, logoPosition: 'top-right' };
const FILE_NAME_SUFFIX = '-watermarked'; // Suffix for downloaded files (set to empty string to disable).

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWrapper = document.getElementById('canvas-wrapper');
const imageUploadBtn = document.getElementById('image-upload-btn');
const imageUpload = document.getElementById('image-upload');
const imageNameDisplay = document.getElementById('image-name-display');
const keepOriginalChk = document.getElementById('keep-original');
const addGradientChk = document.getElementById('add-gradient');
const logoPositionSel = document.getElementById('logo-position');
const applyToAllBtn = document.getElementById('apply-to-all-btn');
const downloadBtn = document.getElementById('download-btn');
const imageNav = document.getElementById('image-nav');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const imageCounter = document.getElementById('image-counter');

// Load the logo image.
const logo = new Image();
logo.src = LOGO_URL;

// Image array to hold uploaded images and their settings.
let images = [];
let currentImageIndex = 0;

// Reset controls to default settings.
function resetControls() {
  keepOriginalChk.checked = DEFAULT_SETTINGS.keepOriginal;
  addGradientChk.checked = DEFAULT_SETTINGS.addGradient;
  logoPositionSel.value = DEFAULT_SETTINGS.logoPosition;
}

// Create a gradient based on the specified logo position.
function createGradient(position, width, height) {
  let gradient;

  switch (position) {
    case 'top-left':
      gradient = ctx.createLinearGradient(0, 0, width, height);
      break;
    case 'top-right':
      gradient = ctx.createLinearGradient(width, 0, 0, height);
      break;
    case 'bottom-left':
      gradient = ctx.createLinearGradient(0, height, width, 0);
      break;
    case 'bottom-right':
      gradient = ctx.createLinearGradient(width, height, 0, 0);
      break;
  }

  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
  gradient.addColorStop(0.1, 'rgba(0, 0, 0, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  return gradient;
}

// Get the logo size based on the canvas height and original logo dimensions.
function getLogoSize(logo, canvasHeight) {
  let origWidth = logo.naturalWidth || logo.width;
  let origHeight = logo.naturalHeight || logo.height;

  if (!origWidth || !origHeight || origWidth <= 0 || origHeight <= 0) {
    console.warn('Invalid logo dimensions:', origWidth, origHeight);
    return { width: 0, height: 0 };
  }

  const height = canvasHeight * LOGO_SIZE;
  const width = origWidth * (height / origHeight);
  return { width, height };
}

// Fit the image to the canvas based on the settings.
function fitImageToCanvas(img, keepOriginal) {
  let drawW, drawH, offsetX, offsetY, maxOffsetX, maxOffsetY;

  if (keepOriginal) {
    drawW = img.width;
    drawH = img.height;
    offsetX = maxOffsetX = 0;
    offsetY = maxOffsetY = 0;
  } else {
    // Fit image to crop area.
    const scale = Math.max(CROP_WIDTH / img.width, CROP_HEIGHT / img.height);
    drawW = img.width * scale;
    drawH = img.height * scale;
    maxOffsetX = drawW - CROP_WIDTH;
    maxOffsetY = drawH - CROP_HEIGHT;
    offsetX = maxOffsetX / 2;
    offsetY = maxOffsetY / 2;
  }

  return { drawW, drawH, offsetX, offsetY, maxOffsetX, maxOffsetY };
}

// Fix for Chrome's canvas size issue by setting the display size explicitly.
function setCanvasDisplaySize() {
  canvas.style.height = canvasWrapper.clientHeight + 'px';
  canvas.style.width = canvasWrapper.clientHeight * (canvas.width / canvas.height) + 'px';
}

const resizeObserver = new ResizeObserver((entries) => {
  // Resize the canvas when the wrapper size changes.
  setCanvasDisplaySize();
});

// Observe the canvas wrapper for size changes.
resizeObserver.observe(canvasWrapper);

// Render the current image based on the current settings.
function renderCurrent() {
  if (images.length <= currentImageIndex) return;

  const imgObj = images[currentImageIndex];
  const settings = imgObj.settings;

  // Resize canvas.
  if (settings.keepOriginal) {
    canvas.width = imgObj.img.width;
    canvas.height = imgObj.img.height;
  } else {
    canvas.width = CROP_WIDTH;
    canvas.height = CROP_HEIGHT;
  }

  // Fix for Chrome's canvas size issue.
  setCanvasDisplaySize();

  // Draw the image.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imgObj.img, -settings.offsetX, -settings.offsetY, settings.drawW, settings.drawH);

  // Draw gradient if enabled.
  if (settings.addGradient) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = createGradient(settings.logoPosition, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // Draw the logo if it has loaded.
  if (logo.complete) {
    const { width: logoWidth, height: logoHeight } = getLogoSize(logo, canvas.height);

    if (logoWidth !== 0 && logoHeight !== 0) {
      const marginSize = logoHeight * LOGO_MARGIN;
      let logoX, logoY;
      switch (settings.logoPosition) {
        case 'top-left':
          logoX = marginSize;
          logoY = marginSize;
          break;
        case 'top-right':
          logoX = canvas.width - logoWidth - marginSize;
          logoY = marginSize;
          break;
        case 'bottom-left':
          logoX = marginSize;
          logoY = canvas.height - logoHeight - marginSize;
          break;
        case 'bottom-right':
          logoX = canvas.width - logoWidth - marginSize;
          logoY = canvas.height - logoHeight - marginSize;
          break;
      }

      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
    }
  }
}

// Handle image upload.
imageUpload.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);

  if (files.length === 1) {
    imageNameDisplay.textContent = files[0].name;
    imageNameDisplay.classList.remove('hide');
    downloadBtn.disabled = false;
    imageNav.classList.add('hide');
    applyToAllBtn.classList.add('hide');
  } else if (files.length > 1) {
    imageNameDisplay.textContent = `${files.length} images selected`;
    imageNameDisplay.classList.remove('hide');
    downloadBtn.disabled = false;
    imageNav.classList.remove('hide');
    applyToAllBtn.classList.remove('hide');
  } else {
    imageNameDisplay.textContent = '';
    imageNameDisplay.classList.add('hide');
    downloadBtn.disabled = true;
    imageNav.classList.add('hide');
    applyToAllBtn.classList.add('hide');
    return;
  }

  // Reset state.
  images = [];

  // Load each image file.
  let loadedImages = 0;
  files.forEach((file, idx) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    // Once the image loads, fit it to the canvas and store settings.
    img.onload = () => {
      images[idx].img = img;
      images[idx].settings = {
        ...DEFAULT_SETTINGS,
        ...fitImageToCanvas(img, DEFAULT_SETTINGS.keepOriginal),
      };
      URL.revokeObjectURL(url);

      if (++loadedImages === files.length) {
        // All images loaded, show the first one.
        showImage(0);
      }
    };

    images.push({ file, img, settings: {} });
    img.src = url;
  });

  // Reset controls to default settings.
  resetControls();
});

// Handle image upload button click.
imageUploadBtn.addEventListener('click', () => {
  imageUpload.click();
});

// Show the desired image when the user clicks on the navigation buttons.
function showImage(index) {
  if (images.length <= index) return;

  currentImageIndex = index;
  const settings = images[currentImageIndex].settings;

  // Update controls to match the current image settings.
  keepOriginalChk.checked = settings.keepOriginal;
  addGradientChk.checked = settings.addGradient;
  logoPositionSel.value = settings.logoPosition;
  imageCounter.textContent = `Image ${currentImageIndex + 1} of ${images.length}`;

  // Render the current image.
  renderCurrent();
}

prevBtn.addEventListener('click', () => showImage((currentImageIndex - 1 + images.length) % images.length));
nextBtn.addEventListener('click', () => showImage((currentImageIndex + 1) % images.length));

// Event listener for keep original checkbox.
keepOriginalChk.addEventListener('change', () => {
  if (images.length <= currentImageIndex) return;

  const imgObj = images[currentImageIndex];
  const settings = imgObj.settings;
  settings.keepOriginal = keepOriginalChk.checked;
  Object.assign(settings, fitImageToCanvas(imgObj.img, settings.keepOriginal));

  renderCurrent();
});

// Event listener for add gradient checkbox.
addGradientChk.addEventListener('change', () => {
  if (images.length <= currentImageIndex) return;

  const settings = images[currentImageIndex].settings;
  settings.addGradient = addGradientChk.checked;

  renderCurrent();
});

// Event listener for logo position selector.
logoPositionSel.addEventListener('change', () => {
  if (images.length <= currentImageIndex) return;

  const settings = images[currentImageIndex].settings;
  settings.logoPosition = logoPositionSel.value;

  renderCurrent();
});

// Apply settings to all images when the `Apply to All` button is clicked.
applyToAllBtn.addEventListener('click', () => {
  if (images.length <= currentImageIndex) return;

  const settings = images[currentImageIndex].settings;
  images.forEach((imgObj) => {
    imgObj.settings.keepOriginal = keepOriginalChk.checked;
    imgObj.settings.addGradient = addGradientChk.checked;
    imgObj.settings.logoPosition = logoPositionSel.value;
    Object.assign(imgObj.settings, fitImageToCanvas(imgObj.img, imgObj.settings.keepOriginal));
  });

  renderCurrent();
});

// Render image when the logo loads.
logo.onload = () => {
  if (images.length > currentImageIndex) renderCurrent();
};

// Dragging logic for cropping.
let dragging = false,
  dragStartX = 0,
  dragStartY = 0,
  startOffsetX = 0,
  startOffsetY = 0;

// Handle mouse down event to start dragging.
canvas.addEventListener('mousedown', (e) => {
  if (images.length <= currentImageIndex) return;

  const settings = images[currentImageIndex].settings;
  if (settings.keepOriginal) return;

  dragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  startOffsetX = settings.offsetX;
  startOffsetY = settings.offsetY;
});

// Handle mouse up event to stop dragging.
window.addEventListener('mouseup', () => (dragging = false));

// Handle mouse move event to update offsets while dragging.
window.addEventListener('mousemove', (e) => {
  if (!dragging || images.length <= currentImageIndex) return;

  const settings = images[currentImageIndex].settings;
  if (settings.keepOriginal) return;

  // Calculate scaled offsets.
  const canvasRect = canvas.getBoundingClientRect();
  const dx = (dragStartX - e.clientX) * (canvas.width / canvasRect.width);
  const dy = (dragStartY - e.clientY) * (canvas.height / canvasRect.height);

  // Update offsets based on drag.
  if (settings.drawW > canvas.width && settings.drawH > canvas.height) {
    settings.offsetX = startOffsetX + dx;
    settings.offsetY = startOffsetY + dy;
  } else if (settings.drawW > canvas.width) {
    settings.offsetX = startOffsetX + dx;
  } else if (settings.drawH > canvas.height) {
    settings.offsetY = startOffsetY + dy;
  }

  // Clamp offsets to valid range.
  settings.offsetX = Math.max(0, Math.min(settings.maxOffsetX, settings.offsetX));
  settings.offsetY = Math.max(0, Math.min(settings.maxOffsetY, settings.offsetY));

  // Redraw the current image with updated offsets.
  renderCurrent();
});

// Prevent scrolling with mouse wheel on canvas.
canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
  },
  { passive: false },
);

// Download logic.
downloadBtn.addEventListener('click', async () => {
  if (!images.length) return;

  downloadBtn.disabled = true;

  if (images.length === 1) {
    canvas.toBlob((blob) => {
      const fileName = images[0].file.name.replace(/\.[^/.]+$/, '') + `${FILE_NAME_SUFFIX}.png`;
      saveAs(blob, fileName);
    }, 'image/png');
  } else {
    const zip = new JSZip();
    const lastCurrent = currentImageIndex;

    // Loop through all images and add them to the zip file.
    for (let i = 0; i < images.length; i++) {
      showImage(i);

      await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const fileName = images[i].file.name.replace(/\.[^/.]+$/, '') + `${FILE_NAME_SUFFIX}.png`;
          zip.file(fileName, blob);
          resolve();
        }, 'image/png');
      });
    }

    // Generate the zip file and trigger download.
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'images.zip');
    });

    // Restore the last shown image.
    showImage(lastCurrent);
  }

  downloadBtn.disabled = false;
});

// Reset controls and state when the page loads.
(() => {
  resetControls();
  imageNameDisplay.textContent = '';
  imageNameDisplay.classList.add('hide');
  downloadBtn.disabled = true;
  imageNav.classList.add('hide');
  applyToAllBtn.classList.add('hide');
  setCanvasDisplaySize();
})();
