// Загружаем кэш из localStorage
const cache = JSON.parse(localStorage.getItem("swapiCache")) || {};

async function fetchData() {
    const category = document.getElementById("category").value;
    const id = document.getElementById("id").value;
    const output = document.getElementById("output");
    const errorDiv = document.getElementById("error");
    const loader = document.getElementById("loader");
    const button = document.getElementById("fetchButton");

    // Сброс вывода перед новым запросом
    output.classList.remove("visible");
    errorDiv.classList.remove("show");
    loader.classList.add("visible");
    button.disabled = true;

    // Проверка корректности введенного ID
    if (!id || id < 1 || id > 10) {
        resetUI();
        showError("Введите корректный ID (от 1 до 10)!");
        return;
    }

    // Проверка интернет-соединения перед запросом
    if (!navigator.onLine) {
        resetUI();
        showError("No internet connection!", "https://http.cat/500");
        return;
    }

    const url = `https://swapi.py4e.com/api/${category}/${id}/`;

    // Если данные есть в кеше, показываем их без запроса
    if (cache[url]) {
        resetUI();
        displayData(cache[url], category);
        return;
    }

    try {
        const response = await fetch(url);

        // Обработка ошибок HTTP
        if (!response.ok) {
            if (response.status === 404) {
                showError("Error 404: Not Found!", "https://http.cat/404");
            } else {
                throw new Error(`Error: ${response.status}`);
            }
            return;
        }

        const data = await response.json();
        cache[url] = data;
        localStorage.setItem("swapiCache", JSON.stringify(cache)); // Сохраняем в кеш

        displayData(data, category);
    } catch (error) {
        showError(error.message || "Request Error");
    } finally {
        resetUI();
    }
}

// Функция сброса UI
function resetUI() {
    const loader = document.getElementById("loader");
    const button = document.getElementById("fetchButton");

    loader.classList.remove("visible");
    button.disabled = false;
}

// Функция отображения данных
function displayData(data, category) {
    const output = document.getElementById("output");

    let additionalInfo = "";

    switch (category) {
        case "people":
            additionalInfo = `Height: ${data.height} см, Mass: ${data.mass} кг`;
            break;
        case "planets":
            additionalInfo = `Climate: ${data.climate}, Population: ${data.population}`;
            break;
        case "starships":
            additionalInfo = `Model: ${data.model}, Starship class: ${data.starship_class}`;
            break;
        default:
            additionalInfo = "Additional data is unavailable.";
    }

    output.classList.add("visible");
    output.innerHTML = `<p><strong>${data.name}</strong></p><p>${additionalInfo}</p>`;
}

// Функция вывода ошибок
function showError(message, imageUrl = "") {
    const errorDiv = document.getElementById("error");
    errorDiv.innerHTML = `<p>${message}</p>`;

    if (imageUrl) {
        errorDiv.innerHTML += `<img src="${imageUrl}" alt="Error">`;
    }

    errorDiv.classList.add("show");
}

// Добавляем обработчики событий
document.getElementById("fetchButton").addEventListener("click", fetchData);

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        fetchData();
    }
});