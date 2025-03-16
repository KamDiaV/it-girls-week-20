const cache = JSON.parse(localStorage.getItem("swapiCache")) || {};

async function fetchData() {
    const category = document.getElementById("category").value;
    const id = document.getElementById("id").value;
    const output = document.getElementById("output");
    const errorDiv = document.getElementById("error");
    const loader = document.getElementById("loader");
    const button = document.getElementById("fetchButton");
    
    output.classList.remove("visible");
    errorDiv.classList.remove("show");
    loader.classList.add("visible");
    button.disabled = true;

    if (!id || id < 1 || id > 10) {
        loader.classList.remove("visible");
        button.disabled = false;
        showError("Введите корректный ID (от 1 до 10)!");
        return;
    }

    if (!navigator.onLine) {
        loader.classList.remove("visible");
        button.disabled = false;
        showError("Нет соединения с интернетом!", "https://http.cat/500");
        return;
    }

    const url = `https://swapi.py4e.com/api/${category}/${id}/`;

    if (cache[url]) {
        loader.classList.remove("visible");
        button.disabled = false;
        output.classList.add("visible");
        output.textContent = cache[url].name || "Имя не найдено";
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                showError("Ошибка 404: Не найдено!", "https://http.cat/404");
            } else {
                throw new Error(`Ошибка: ${response.status}`);
            }
            return;
        }
        const data = await response.json();
        cache[url] = data;
        localStorage.setItem("swapiCache", JSON.stringify(cache));

        output.classList.add("visible");
        output.textContent = data.name || "Имя не найдено";
    } catch (error) {
        showError(error.message || "Ошибка запроса");
    } finally {
        loader.classList.remove("visible");
        button.disabled = false;
    }
}

function showError(message, imageUrl = "") {
    const errorDiv = document.getElementById("error");
    errorDiv.innerHTML = `<p>${message}</p>`;
    if (imageUrl) {
        errorDiv.innerHTML += `<img src="${imageUrl}" alt="Ошибка">`;
    }
    errorDiv.classList.add("show");
}

document.getElementById("fetchButton").addEventListener("click", fetchData);

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        fetchData();
    }
});

// window.addEventListener("load", () => localStorage.clear());
