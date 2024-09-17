document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("imageCanvas");
    const colorInfo = document.getElementById("color-info");
    const positionInfo = document.getElementById("position-info");
    const imageSizeInfo = document.getElementById("image-size-info");
    const fileUploadBtn = document.getElementById("file-upload");
    const urlUploadBtn = document.getElementById("url-upload");
    const resizeBtn = document.getElementById("resize-button");
    const saveBtn = document.getElementById("save-button");
    const colorSample = document.getElementById("color-sample");
    const scrollContainer = document.querySelector(".scroll-container");
    const scaleSelect = document.getElementById("scale-select");

    const resizeModal = document.getElementById("resize-modal");
    const closeModalBtn = document.querySelector(".close");
    const resizeConfirmBtn = document.getElementById("resize-confirm");
    const resizeTypeSelect = document.getElementById("resize-type");
    const resizeWidthInput = document.getElementById("resize-width");
    const resizeHeightInput = document.getElementById("resize-height");
    const maintainAspectRatioCheckbox = document.getElementById("maintain-aspect-ratio");
    const interpolationSelect = document.getElementById("interpolation");
    const pixelInfo = document.getElementById("pixel-info");
    const newPixelInfo = document.getElementById("new-pixel-info");
    const interpolationTooltip = document.getElementById("interpolation-tooltip")
    const interpolationTooltipText = document.querySelector(".tooltiptext")

    const handToolBtn = document.getElementById("hand-tool");

    const eyedropperPanel = document.getElementById("eyedropper-panel");
    const eyedropperToolBtn = document.getElementById("eyedropper-tool");
    const eyedropperCloseBtn = document.getElementById("eyedropper-close");
    const eyedropperSwatch1 = document.getElementById("eyedropper-swatch-1");
    const eyedropperSwatch2 = document.getElementById("eyedropper-swatch-2");
    const eyedropperColor1RGB = document.getElementById("eyedropper-color-1-rgb");
    const eyedropperColor2RGB = document.getElementById("eyedropper-color-2-rgb");
    const eyedropperColor1XYZ = document.getElementById("eyedropper-color-1-xyz");
    const eyedropperColor2XYZ = document.getElementById("eyedropper-color-2-xyz");
    const eyedropperColor1LAB = document.getElementById("eyedropper-color-1-lab");
    const eyedropperColor2LAB = document.getElementById("eyedropper-color-2-lab");
    const eyedropperPositionInfo1 = document.getElementById("eyedropper-position-info-1");
    const eyedropperPositionInfo2 = document.getElementById("eyedropper-position-info-2");
    const eyedropperContrastInfo = document.getElementById("eyedropper-contrast-info");

    const curvesModal = document.getElementById("curves-modal");
    const curvesModalCloseIcon = document.getElementById("curves-modal-close-icon");
    const curvesModalCloseBtn = document.getElementById("curves-modal-close-button")
    const applyCurvesBtn = document.getElementById("apply-curves");
    const resetCurvesBtn = document.getElementById("reset-curves");
    const previewCheckbox = document.getElementById("preview-checkbox");
    const point1InputIn = document.getElementById("point1-input-in");
    const point1InputOut = document.getElementById("point1-input-out");
    const point2InputIn = document.getElementById("point2-input-in");
    const point2InputOut = document.getElementById("point2-input-out");
    const svg = document.getElementById("curves-graph");
    const point1 = document.getElementById("point1-circle");
    const point2 = document.getElementById("point2-circle");
    const curveLine = document.getElementById("curve-line");

    const filterButton = document.getElementById('filter-button');
    const filterModal = document.getElementById('filterModal');
    const filterClose = document.getElementById('filter-close');
    const presetSelect = document.getElementById('presetSelect');
    const matrixInputs = document.querySelectorAll('.matrix');
    const matrix11 = document.getElementById('m11')
    const filterApplyBtn = document.getElementById('filter-apply');
    const filterResetBtn = document.getElementById('filter-reset');
    const previewCheck = document.getElementById('previewCheck');

    let ctx;
    let image;
    let aspectRatio;
    let scale = 1;
    let activeTool = 'none';
    let originalPixels;

    function getPixelInfo(event) {
        const rect = canvas.getBoundingClientRect();
        let x = Math.round(event.clientX - rect.left);
        let y = Math.round(event.clientY - rect.top);

        if (x < 0) {
            x = 0;
        }
        if (y < 0) {
            y = 0;
        }

        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const color = `RGB: ${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}`;
        const colorString = `Color: ${color}`;
        
        colorInfo.textContent = colorString;
        positionInfo.textContent = `Position: ${x}, ${y}`;
        colorSample.style.backgroundColor = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
    }

    function loadImage(src) {
        image = new Image();
        image.onload = function() {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx = canvas.getContext("2d");
            drawImage();
            originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
            aspectRatio = image.width / image.height;
            imageSizeInfo.textContent = `Image Size: ${image.width} x ${image.height}`;

            scrollContainer.scrollLeft = 0;
            scrollContainer.scrollTop = 0;

            canvas.addEventListener("click", getPixelInfo);
            canvas.addEventListener("mousemove", getPixelInfo);
        };
        image.onerror = function() {
            console.error("Failed to load image:", src);
            alert("Failed to load image. Please try again.");
        };
        image.src = src;
    }

    function drawImage() {
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    function scaleImage(factor) {
        scale = factor;
        
        drawImage();
    }

    fileUploadBtn.addEventListener("click", function() {
        const input = document.createElement("input");

        input.type = "file";
        input.accept = "image/*";
        input.onchange = function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = function() {
                loadImage(reader.result);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    });

    urlUploadBtn.addEventListener("click", function() {
        const url = prompt("Enter Image URL:");
        if (url) {
            loadImageFromURL(url);
        }
    });

    function loadImageFromURL(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const imageURL = URL.createObjectURL(blob);
                loadImage(imageURL);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                if (error == "Error: Network response was not ok") {
                    alert("Failed to load image. Response from third party website was not ok. Try again or try load image from another website");
                } else if (error == "TypeError: Failed to fetch") {
                    alert("Failed to load image. Your image has been probably blocked by CORS policy. Please try load image from another website.");
                } else {
                    alert("Failed to load image. Please check the URL and try again.");
                }
            });
    }

    scaleSelect.addEventListener("change", function() {
        const factor = parseFloat(this.value);
        scaleImage(factor);
    });

    resizeBtn.addEventListener("click", function() {
        try {
            (function () {
                pixelInfo.textContent = `Original: ${(image.width * image.height / 1e6).toFixed(2)} MP`;
                resizeModal.style.display = "block";
            }())
        } catch (error) {
            console.error("No image\n",error)
            return
        }
    });

    closeModalBtn.addEventListener("click", function() {
        resizeModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target == resizeModal) {
            resizeModal.style.display = "none";
        }
        if (event.target == curvesModal) {
            curvesModal.style.display = "none";            
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.code == "Escape") {
            resizeModal.style.display = "none";
            curvesModal.style.display = "none";
            filterModal.style.display = "none";
        }
    });

    interpolationTooltip.addEventListener("click", function() {
        interpolationTooltipText.classList.toggle("display-none")
    })

    maintainAspectRatioCheckbox.addEventListener("change", function() {
        if (resizeTypeSelect.value === "percentage") {
            if (this.checked) {
                const value = resizeWidthInput.value;
                resizeHeightInput.value = value;
            }
        }
    });

    resizeTypeSelect.addEventListener("change", function() {
        if (resizeTypeSelect.value === "percentage") {
            resizeWidthInput.placeholder = "%"
            resizeHeightInput.placeholder = "%"
        } else {
            resizeWidthInput.placeholder = "px"
            resizeHeightInput.placeholder = "px"
        }
    });

    resizeWidthInput.addEventListener("input", function() {
        if (resizeTypeSelect.value === "percentage") {
            if (maintainAspectRatioCheckbox.checked) {
                resizeHeightInput.value = this.value;
            }
            const widthFactor = parseFloat(this.value) / 100;
            const heightFactor = parseFloat(resizeHeightInput.value) / 100;
            const newWidth = Math.round(image.width * widthFactor);
            const newHeight = Math.round(image.height * heightFactor);
            newPixelInfo.textContent = `New: ${(newWidth * newHeight / 1e6).toFixed(2)} MP`;
        } else {
            if (maintainAspectRatioCheckbox.checked) {
                resizeHeightInput.value = Math.round(this.value / aspectRatio);
            }
            const newWidth = parseInt(this.value);
            const newHeight = parseInt(resizeHeightInput.value);
            newPixelInfo.textContent = `New: ${(newWidth * newHeight / 1e6).toFixed(2)} MP`;
        }

        if (newPixelInfo.textContent == "New: NaN MP") {
            newPixelInfo.textContent = "New: Waiting for input..."
        }
    });

    resizeHeightInput.addEventListener("input", function() {
        if (resizeTypeSelect.value === "percentage") {
            if (maintainAspectRatioCheckbox.checked) {
                resizeWidthInput.value = this.value;
            }
            const heightFactor = parseFloat(this.value) / 100;
            const widthFactor = parseFloat(resizeWidthInput.value) / 100;
            const newHeight = Math.round(image.height * heightFactor);
            const newWidth = Math.round(image.width * widthFactor);
            newPixelInfo.textContent = `New: ${(newWidth * newHeight / 1e6).toFixed(2)} MP`;
        } else {
            if (maintainAspectRatioCheckbox.checked) {
                resizeWidthInput.value = Math.round(this.value * aspectRatio);
            }
            const newWidth = parseInt(resizeWidthInput.value);
            const newHeight = parseInt(this.value);
            newPixelInfo.textContent = `New: ${(newWidth * newHeight / 1e6).toFixed(2)} MP`;
        }

        if (newPixelInfo.textContent == "New: NaN MP") {
            newPixelInfo.textContent = "New: Waiting for input..."
        }
    });

    resizeConfirmBtn.addEventListener("click", function() {
        let newWidth, newHeight;
        if (resizeTypeSelect.value === "percentage") {
            const widthPercentage = resizeWidthInput.value;
            const heightPercentage = resizeHeightInput.value;

            if (!widthPercentage || !heightPercentage) {
                alert("Please fill in both width and height percentages.");
                return;
            }

            const widthFactor = parseFloat(widthPercentage) / 100;
            const heightFactor = parseFloat(heightPercentage) / 100;
            newWidth = Math.round(image.width * widthFactor);
            newHeight = Math.round(image.height * heightFactor);
        } else {
            newWidth = parseInt(resizeWidthInput.value);
            newHeight = parseInt(resizeHeightInput.value);
        }

        if (newWidth <= 0 || newHeight <= 0) {
            alert("Width or height cannot be less or equals 0. Please input correct values.");
            return;
        }
        const resizedImageData = resizeImage(image, newWidth, newHeight, interpolationSelect.value);
        const resizedImage = new Image();
        resizedImage.onload = function() {
            image = resizedImage;
            drawImage();
            aspectRatio = image.width / image.height;
            imageSizeInfo.textContent = `Image Size: ${image.width} x ${image.height}`;
            resizeModal.style.display = "none";
        };
        resizedImage.src = resizedImageData;

        resizeHeightInput.value = null
        resizeWidthInput.value = null
    });

    function resizeImage(image, width, height, interpolation) {
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        const offscreenCtx = offscreenCanvas.getContext("2d");
        if (interpolation === "nearest-neighbor") {
            offscreenCtx.imageSmoothingEnabled = false;
        }
        offscreenCtx.drawImage(image, 0, 0, width, height);
        return offscreenCanvas.toDataURL();
    }

    saveBtn.addEventListener("click", function() {
        try {
            (function () {
                image.width
            }())
        } catch (error) {
            console.error("No image\n",error)
            return
        }
        const link = document.createElement("a");

        link.download = "new-image-polyshop.png";
        link.href = canvas.toDataURL();
        link.click();
    });

    function activateTool(tool) {
        try {
            (function () {
                image.width
            }())
        } catch (error) {
            console.error("No image\n",error)
            return
        }
        activeTool = tool;

        if (tool === 'hand') {
            handToolBtn.classList.toggle('active');
            if (eyedropperToolBtn.classList.contains('active')) {
                eyedropperToolBtn.classList.remove('active')
            }
        } else if (tool === `eyedropper`) {
            if (eyedropperToolBtn.classList.contains('active')) {
                eyedropperToolBtn.classList.remove('active');
            } else {
                eyedropperToolBtn.classList.add('active')
                eyedropperPanel.classList.remove("display-none")
            }
            if (handToolBtn.classList.contains('active')) {
                handToolBtn.classList.remove('active')
            }
        }
    }

    handToolBtn.addEventListener("click", () => activateTool('hand'));
    eyedropperToolBtn.addEventListener("click", () => activateTool('eyedropper'));

    fileUploadBtn.addEventListener("click", function() {
    });

    urlUploadBtn.addEventListener("click", function() {
    });

    let currentR1, currentR2, currentG1, currentG2, currentB1, currentB2

    canvas.addEventListener("mousedown", function(e) {
        if (activeTool === 'eyedropper') {
            const x = e.offsetX;
            const y = e.offsetY;
            const imageData = ctx.getImageData(x, y, 1, 1).data;

            const rgbColor = `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
            const xyzColorData = RGBtoXYZ(imageData)
            const labColorData = XYZtoLAB(xyzColorData)

            const xyzColor = `xyz(${xyzColorData[0].toFixed(2)}, ${xyzColorData[1].toFixed(2)}, ${xyzColorData[2].toFixed(2)})`
            const labColor = `lab(${labColorData[0].toFixed(2)}, ${labColorData[1].toFixed(2)}, ${labColorData[2].toFixed(2)})`

            const rgbColorString = `${rgbColor}`;
            const xyzColorString = `${xyzColor}`
            const labColorString = `${labColor}`

            if (e.button === 0 && (e.shiftKey || e.ctrlKey || e.altKey)) {
                eyedropperSwatch2.style.backgroundColor = rgbColor;

                eyedropperColor2RGB.textContent = rgbColorString
                eyedropperColor2XYZ.textContent = xyzColorString
                eyedropperColor2LAB.textContent = labColorString

                eyedropperPositionInfo2.textContent = `Position: ${x}, ${y}`

                currentR2 = imageData[0]
                currentG2 = imageData[1]
                currentB2 = imageData[2]

                checkContrastRatio(currentR1, currentR2, currentG1, currentG2, currentB1, currentB2)
            } else {
                eyedropperSwatch1.style.backgroundColor = rgbColor;

                eyedropperColor1RGB.textContent = rgbColorString
                eyedropperColor1XYZ.textContent = xyzColorString
                eyedropperColor1LAB.textContent = labColorString

                eyedropperPositionInfo1.textContent = `Position: ${x}, ${y}`

                currentR1 = imageData[0]
                currentG1 = imageData[1]
                currentB1 = imageData[2]

                checkContrastRatio(currentR1, currentR2, currentG1, currentG2, currentB1, currentB2)
            }
        }
    });

    let isDragging = false;
    let lastX, lastY;

    scrollContainer.addEventListener('mousedown', (e) => {
        if (activeTool === 'hand') {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        }
    });

    scrollContainer.addEventListener('mousemove', (e) => {
        if (isDragging && activeTool === 'hand') {
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;

            scrollContainer.scrollLeft -= dx;
            scrollContainer.scrollTop -= dy;

            lastX = e.clientX;
            lastY = e.clientY;
        }
    });

    scrollContainer.addEventListener('mouseup', () => {
        isDragging = false;
    });

    scrollContainer.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    eyedropperCloseBtn.addEventListener("click", function() {
        eyedropperPanel.classList.add("display-none");
        if (eyedropperToolBtn.classList.contains('active')) {
            eyedropperToolBtn.classList.remove('active');
        }
    });

    document.addEventListener("keydown", function(e) {
        if (e.key === 'h') {
            activateTool('hand');
        } else if (e.key === 'e') {
            activateTool('eyedropper');
        }
    });


    document.getElementById("curves-button").addEventListener("click", function() {
        try {
            (function () {
                image.width
            }())
        } catch (error) {
            console.error("No image\n",error)
            return
        }
        curvesModal.style.display = "grid";
        updateSVGCurve();
    });

    curvesModalCloseIcon.addEventListener("click", function() {
        curvesModal.style.display = "none";
    });

    curvesModalCloseBtn.addEventListener("click", function() {
        curvesModal.style.display = "none";
    });


    let activePoint = null;

    function resetValues() {
        point1InputIn.value = 0;
        point1InputOut.value = 0;
        point2InputIn.value = 255;
        point2InputOut.value = 255;

        updateSVGCurve();
    }

    function updateSVGCurve() {
        const x1 = parseInt(point1InputIn.value);
        const y1 = 255 - parseInt(point1InputOut.value);
        const x2 = parseInt(point2InputIn.value);
        const y2 = 255 - parseInt(point2InputOut.value);

        point1.setAttribute("cx", x1);
        point1.setAttribute("cy", y1);
        point2.setAttribute("cx", x2);
        point2.setAttribute("cy", y2);

        const curvePoints = `${x1},${y1} ${x2},${y2}`
        curveLine.setAttribute("points", curvePoints)
    }

    function validateInput() {
        if (parseInt(point1InputIn.value) >= parseInt(point2InputIn.value)) {
            point2InputIn.value = parseInt(point1InputIn.value) + 1;
        }
    }

    let originalImageData = null;

    function applyCurvesCorrection() {
        if (!originalImageData) {
            try {
                (function () {
                    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
                }())
            } catch (error) {
                console.error("No image\n",error)
                return
            }
        }

        const x1 = parseInt(point1InputIn.value);
        const y1 = parseInt(point1InputOut.value);
        const x2 = parseInt(point2InputIn.value);
        const y2 = parseInt(point2InputOut.value);

        // LUT (Look-Up Table)
        let lut = new Array(256);
        for (let i = 0; i <= 255; i++) {
            if (i <= x1) {
                lut[i] = y1;
            } else if (i >= x2) {
                lut[i] = y2;
            } else {
                lut[i] = Math.round(((y2 - y1) / (x2 - x1)) * (i - x1) + y1);
            }
        }

        let imageData
        let data
        let originalData
        try {
            (function () {
                imageData = ctx.createImageData(originalImageData.width, originalImageData.height);
                data = imageData.data;
                originalData = originalImageData.data;
            }())
        } catch (error) {
            console.error("No image\n",error)
            return
        }

        for (let i = 0; i < originalData.length; i += 4) {
            data[i] = lut[originalData[i]];         // Red
            data[i + 1] = lut[originalData[i + 1]]; // Green
            data[i + 2] = lut[originalData[i + 2]]; // Blue
            data[i + 3] = originalData[i + 3];      // Alpha остается неизменным
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function resetImage() {
        if (!originalImageData) {
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        let x1 = 0
        let y1 = 0
        let x2 = 255
        let y2 = 255

        let lut = new Array(256);
        for (let i = 0; i <= 255; i++) {
            if (i <= x1) {
                lut[i] = y1;
            } else if (i >= x2) {
                lut[i] = y2;
            } else {
                lut[i] = Math.round(((y2 - y1) / (x2 - x1)) * (i - x1) + y1);
            }
        }

        let imageData
        let data
        let originalData
        try {
            (function () {
                imageData = ctx.createImageData(originalImageData.width, originalImageData.height);
                data = imageData.data;
                originalData = originalImageData.data;
            }())
        } catch (error) {
            console.error("No image\n",error)
            return
        }

        for (let i = 0; i < originalData.length; i += 4) {
            data[i] = lut[originalData[i]];
            data[i + 1] = lut[originalData[i + 1]];
            data[i + 2] = lut[originalData[i + 2]];
            data[i + 3] = originalData[i + 3];
        }

        ctx.putImageData(imageData, 0, 0);
    }

    point1.addEventListener("mousedown", function() {
        activePoint = "point1";
    });
    point2.addEventListener("mousedown", function() {
        activePoint = "point2";
    });

    document.addEventListener("mousemove", function(event) {
        if (activePoint) {
            const svgRect = svg.getBoundingClientRect();
            let x = event.clientX - svgRect.left;
            let y = event.clientY - svgRect.top;

            x = Math.max(0, Math.min(255, x));
            y = Math.max(0, Math.min(255, y));

            if (activePoint === "point1" && x < parseInt(point2InputIn.value)) {
                point1InputIn.value = Math.round(x);
                point1InputOut.value = Math.round(255 - y);
            } else if (activePoint === "point2" && x > parseInt(point1InputIn.value)) {
                point2InputIn.value = Math.round(x);
                point2InputOut.value = Math.round(255 - y);
            }

            updateSVGCurve();
            if (previewCheckbox.checked) {
                applyCurvesCorrection();
            }
        }
    });

    document.addEventListener("mouseup", function() {
        activePoint = null;
    });

    point1InputIn.addEventListener("input", function() {
        validateInput();
        updateSVGCurve();
        if (previewCheckbox.checked) {
            applyCurvesCorrection();
        }
    });

    point1InputOut.addEventListener("input", function() {
        updateSVGCurve();
        if (previewCheckbox.checked) {
            applyCurvesCorrection();
        }
    });

    point2InputIn.addEventListener("input", function() {
        validateInput();
        updateSVGCurve();
        if (previewCheckbox.checked) {
            applyCurvesCorrection();
        }
    });

    point2InputOut.addEventListener("input", function() {
        updateSVGCurve();
        if (previewCheckbox.checked) {
            applyCurvesCorrection();
        }
    });

    applyCurvesBtn.addEventListener("click", function() {
        applyCurvesCorrection();
        resetValues();
        previewCheckbox.checked = false
        curvesModal.style.display = "none";

        try {
            (function () {
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }())
        } catch (error) {
            console.error("No image\n",error)
            return
        }
    });

    resetCurvesBtn.addEventListener("click", function() {
        resetValues();
        if (previewCheckbox.checked) {
            applyCurvesCorrection();
        }
    });

    previewCheckbox.addEventListener("click", function() {
        if (previewCheckbox.checked) {
            updateSVGCurve();
            applyCurvesCorrection();
        } else {
            resetImage()
        }
    })

    filterButton.addEventListener('click', function() {
        try {
            (function () {
                image.width
            }())
        } catch (error) {
            console.error("No image\n",error)
            return
        }
        filterModal.style.display = 'block'
    });
    filterClose.addEventListener('click', () => filterModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === filterModal) filterModal.style.display = 'none'; });

    presetSelect.addEventListener('change', handlePresetChange);
    filterResetBtn.addEventListener('click', resetFilter);
    filterApplyBtn.addEventListener('click', function () {
        if (previewCheck.checked == true) {
            originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } else {
            applyFilter(false);
        }
        filterModal.style.display = "none";
        resetFilter();
        previewCheck.checked = false;
    });

    const presets = {
        identity: [0, 0, 0, 0, 1, 0, 0, 0, 0],
        sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
        gaussian: [1/16, 2/16, 1/16, 2/16, 4/16, 2/16, 1/16, 2/16, 1/16],  // Gaussian Blur 3x3
        box: [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9]  // Box Blur 3x3
    };

    previewCheck.addEventListener('change', handlePreview);

    matrixInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (previewCheck.checked) {
                applyFilter(true);
            }
        });
    });

    function handlePreview() {
        if (previewCheck.checked) {
            applyFilter(true);
        } else {
            resetFilter();
        }
    }

    function handlePresetChange() {
        const preset = presets[presetSelect.value];
        if (preset) {
            matrixInputs.forEach((input, index) => {
                input.value = preset[index];
            });
        }
        if (previewCheck.checked) {
            applyFilter(true)
        }
    }

    function applyFilter(isPreview = false) {
        const canvas = document.getElementById("imageCanvas");
        const ctx = canvas.getContext('2d');
    
        const kernel = Array.from(matrixInputs).map(input => parseFloat(input.value));
        
        let sourcePixels = originalPixels;

        if (isPreview) {
            sourcePixels = originalPixels;
        } else {
            sourcePixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        const filteredPixels = applyConvolution(sourcePixels, kernel);

        ctx.putImageData(filteredPixels, 0, 0);

        if (!isPreview) {
            originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
    }

    function resetFilter() {
        if (originalPixels) {
            ctx.putImageData(originalPixels, 0, 0);
        }

        let i = 0
        switch (presetSelect.value){
            case 'identity':
                matrixInputs.forEach((input) => {
                    input.value = presets.identity[i];
                    i++
                });
                i = 0
                if (previewCheck.checked) {
                    applyFilter(true)
                }
                break
            case 'sharpen':
                matrixInputs.forEach((input) => {
                    input.value = presets.sharpen[i];
                    i++
                });
                i = 0
                if (previewCheck.checked) {
                    applyFilter(true)
                }
                break
            case 'gaussian':
                matrixInputs.forEach((input) => {
                    input.value = presets.gaussian[i];
                    i++
                });
                i = 0
                if (previewCheck.checked) {
                    applyFilter(true)
                }
                break
            case 'box':
                matrixInputs.forEach((input) => {
                    input.value = presets.box[i];
                    i++
                });
                i = 0
                if (previewCheck.checked) {
                    applyFilter(true)
                }
                break
        }
    }

    function applyConvolution(imageData, kernel) {
        const canvas = document.getElementById("imageCanvas");
        const ctx = canvas.getContext('2d');
        const { data, width, height } = imageData;
        const side = Math.sqrt(kernel.length);
        const half = Math.floor(side / 2);
        const output = ctx.createImageData(width, height);
        const outputData = output.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = (y * width + x) * 4;
                let r = 0, g = 0, b = 0;

                for (let ky = 0; ky < side; ky++) {
                    for (let kx = 0; kx < side; kx++) {
                        const offsetX = Math.min(width - 1, Math.max(0, x + kx - half));
                        const offsetY = Math.min(height - 1, Math.max(0, y + ky - half));

                        const offsetIndex = (offsetY * width + offsetX) * 4;
                        const weight = kernel[ky * side + kx];

                        r += data[offsetIndex] * weight;
                        g += data[offsetIndex + 1] * weight;
                        b += data[offsetIndex + 2] * weight;
                    }
                }

                outputData[pixelIndex] = Math.min(Math.max(r, 0), 255);
                outputData[pixelIndex + 1] = Math.min(Math.max(g, 0), 255);
                outputData[pixelIndex + 2] = Math.min(Math.max(b, 0), 255);
                outputData[pixelIndex + 3] = data[pixelIndex + 3];
            }
        }

        return output;
    }

    // Референс для функций - https://www.easyrgb.com/en/math.php

    function RGBtoXYZ([R, G, B]) {
        const [var_R, var_G, var_B] = [R, G, B]
            .map(x => x / 255)
            .map(x => x > 0.04045
                ? Math.pow(((x + 0.055) / 1.055), 2.4)
                : x / 12.92)
            .map(x => x * 100)
    
        X = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805
        Y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722
        Z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505
        return [X, Y, Z]
    }

    function XYZtoLAB([x, y, z]) {
        const ref_X =  95.047;
        const ref_Y = 100.000;
        const ref_Z = 108.883;

        const [ var_X, var_Y, var_Z ] = [ x / ref_X, y / ref_Y, z / ref_Z ]
            .map(a => a > 0.008856
                ? Math.pow(a, 1 / 3)
                : (7.787 * a) + (16 / 116))
    
        CIE_L = (116 * var_Y) - 16
        CIE_a = 500 * (var_X - var_Y)
        CIE_b = 200 * (var_Y - var_Z)
    
        return [CIE_L, CIE_a, CIE_b]
    }


    // Функция написана по методике описанной в https://www.w3.org/TR/WCAG20-TECHS/G18.html
    function checkContrastRatio(r1_8bit, r2_8bit, g1_8bit, g2_8bit, b1_8bit, b2_8bit) {
        const sr1 = r1_8bit / 255
        const sr2 = r2_8bit / 255
        const sg1 = g1_8bit / 255
        const sg2 = g2_8bit / 255
        const sb1 = b1_8bit / 255
        const sb2 = b2_8bit / 255

        if (isNaN(sr1) || isNaN(sr2) || isNaN(sg1) || isNaN(sg2) || isNaN(sb1) || isNaN(sb2)) {
            return
        }

        let r1, r2, g1, g2, b1, b2

        if (sr1 <= 0.03928) {
            r1 = sr1 / 12.92
        } else {
            r1 = ((sr1 + 0.055) / 1.055 ) ** 2.4
        }

        if (sr2 <= 0.03928) {
            r2 = sr2 / 12.92
        } else {
            r2 = ((sr2 + 0.055) / 1.055 ) ** 2.4
        }

        if (sg1 <= 0.03928) {
            g1 = sg1 / 12.92
        } else {
            g1 = ((sg1 + 0.055) / 1.055 ) ** 2.4
        }

        if (sg2 <= 0.03928) {
            g2 = sg2 / 12.92
        } else {
            g2 = ((sg2 + 0.055) / 1.055 ) ** 2.4
        }

        if (sb1 <= 0.03928) {
            b1 = sb1 / 12.92
        } else {
            b1 = ((sb1 + 0.055) / 1.055 ) ** 2.4
        }

        if (sb2 <= 0.03928) {
            b2 = sb2 / 12.92
        } else {
            b2 = ((sb2 + 0.055) / 1.055 ) ** 2.4
        }

        const l1 = 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1
        const l2 = 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2

        if ((l1 + 0.05) / (l2 + 0.05) >= 4.5) {
            eyedropperContrastInfo.textContent = `Contrast Ratio: ${((l1+0.05) / (l2 + 0.05)).toFixed(2)}`

            eyedropperContrastInfo.classList.add("green")
        } else if ((l2 + 0.05) / (l1 + 0.05) >= 4.5) {
            eyedropperContrastInfo.textContent = `Contrast Ratio: ${((l2+0.05) / (l1 + 0.05)).toFixed(2)}`

            eyedropperContrastInfo.classList.add("green")
        } else {
            // Контраст меньше 4.5
            if (((l1 + 0.05) / (l2 + 0.05)) >= ((l2 + 0.05) / (l1 + 0.05))) {
                eyedropperContrastInfo.textContent = `Contrast Ratio: ${((l1+0.05) / (l2 + 0.05)).toFixed(2)}`

                eyedropperContrastInfo.classList.remove("green")
                eyedropperContrastInfo.classList.add("red")
            } else {
                eyedropperContrastInfo.textContent = `Contrast Ratio: ${((l2+0.05) / (l1 + 0.05)).toFixed(2)}`

                eyedropperContrastInfo.classList.remove("green")
                eyedropperContrastInfo.classList.add("red")
            }
        }
    }
});