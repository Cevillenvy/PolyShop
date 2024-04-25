document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("imageCanvas");
    const colorInfo = document.getElementById("color-info");
    const positionInfo = document.getElementById("position-info");
    const imageSizeInfo = document.getElementById("image-size-info");
    const fileUploadBtn = document.getElementById("file-upload");
    const urlUploadBtn = document.getElementById("url-upload");
    const colorSample = document.getElementById("color-sample");

    let ctx;
    let image;

    // Функция для получения информации о цвете и координатах при клике на холсте
    function getPixelInfo(event) {
        const x = event.offsetX;
        const y = event.offsetY;
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const color = `RGB: ${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}`;
        const colorString = `Color: ${color}`;
        colorInfo.textContent = colorString;
        positionInfo.textContent = `Position: ${x}, ${y}`;
        colorSample.style.backgroundColor = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
    }

    // Функция загрузки изображения
    function loadImage(src) {
        image = new Image();
        image.onload = function() {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            imageSizeInfo.textContent = `Image Size: ${image.width} x ${image.height}`;

            // Навешиваем обработчики событий на холст после загрузки изображения
            canvas.addEventListener("click", getPixelInfo);
            canvas.addEventListener("mousemove", getPixelInfo);
        };
        image.onerror = function() {
            console.error("Failed to load image:", src);
            alert("Failed to load image. Please check the URL and try again.");
        };
        image.src = src;
    }

    // Обработчик события клика на кнопке "Upload File"
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

    // Обработчик события клика на кнопке "Upload from URL"
    urlUploadBtn.addEventListener("click", function() {
        const url = prompt("Enter Image URL:");
        if (url) {
            loadImageFromURL(url);
        }
    });

    // Функция загрузки изображения по URL
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
                alert("Failed to load image. Please check the URL and try again.");
            });
    }
});
