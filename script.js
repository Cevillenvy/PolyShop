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

    let ctx;
    let image;
    let aspectRatio;
    let scale = 1;

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
        pixelInfo.textContent = `Original: ${(image.width * image.height / 1e6).toFixed(2)} MP`;
        resizeModal.style.display = "block";
    });

    closeModalBtn.addEventListener("click", function() {
        resizeModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target == resizeModal) {
            resizeModal.style.display = "none";
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.code == "Escape") {
            resizeModal.style.display = "none";
        }
      });

    maintainAspectRatioCheckbox.addEventListener("change", function() {
        if (resizeTypeSelect.value === "percentage") {
            if (this.checked) {
                const value = resizeWidthInput.value;
                resizeHeightInput.value = value;
            }
        }
    });

    resizeWidthInput.addEventListener("input", function() {
        if (resizeTypeSelect.value === "percentage") {
            const factor = parseFloat(this.value) / 100;
            const newWidth = Math.round(image.width * factor);
            const newHeight = Math.round(image.height * factor);
            newPixelInfo.textContent = `New: ${(newWidth * newHeight / 1e6).toFixed(2)} MP`;
            if (maintainAspectRatioCheckbox.checked) {
                resizeHeightInput.value = this.value;
            }
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
            const factor = parseFloat(this.value) / 100;
            const newHeight = Math.round(image.height * factor);
            const newWidth = Math.round(image.width * factor);
            newPixelInfo.textContent = `New: ${(newWidth * newHeight / 1e6).toFixed(2)} MP`;
            if (maintainAspectRatioCheckbox.checked) {
                resizeWidthInput.value = this.value;
            }
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

    resizeTypeSelect.addEventListener("change", function() {
        if (this.value === "percentage") {
            resizeWidthInput.placeholder = "%";
            resizeHeightInput.placeholder = "%";
        } else {
            resizeWidthInput.placeholder = "px";
            resizeHeightInput.placeholder = "px";
        }
        resizeWidthInput.value = "";
        resizeHeightInput.value = "";
        newPixelInfo.textContent = "";
    });

    resizeConfirmBtn.addEventListener("click", function() {
        let newWidth, newHeight;
        if (resizeTypeSelect.value === "percentage") {
            const factor = parseFloat(resizeWidthInput.value) / 100;
            newWidth = Math.round(image.width * factor);
            newHeight = Math.round(image.height * factor);
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

    function updateNewPixelInfo() {
        let newWidth, newHeight;
        if (resizeTypeSelect.value === "percentage") {
            const factor = parseFloat(resizeWidthInput.value) / 100;
            newWidth = Math.round(image.width * factor);
            newHeight = Math.round(image.height * factor);
        } else {
            newWidth = parseInt(resizeWidthInput.value);
            newHeight = parseInt(resizeHeightInput.value);
        }
        newPixelInfo.textContent = `New: ${(newWidth * newHeight / 1e6).toFixed(2)} MP`;
    }

    saveBtn.addEventListener("click", function() {
        const link = document.createElement("a");
        link.download = "scaled-image.png";
        link.href = canvas.toDataURL();
        link.click();
    });
});
