/*
    A lot of the "appendChild" and "createElement" could be handled with string literals, 
    but this explains DOM manipulation a bit better than innerHTML.
*/
// Nice. Would you say that this is safe for a production site?
import { baseUrl, iconUrl } from "./config.js";
const form = document.getElementById("location");
const content = document.getElementById("content");
const submitButton = document.getElementById("submit");
const errorContainer = document.getElementById("errors");

//create the functions
const createWeatherCard = (result) => {
    errorContainer.innerHTML = "";

    let card = document.createElement("div");
    card.setAttribute("class", "weather-card");
    let title = document.createElement("h3");
    title.appendChild(document.createTextNode(result.name));
    card.appendChild(title);

    let close = document.createElement("button");
    close.setAttribute("class", "close");
    close.appendChild(document.createTextNode("X"));
    title.appendChild(close);
    close.addEventListener("click", () => {
        content.removeChild(card);
    });

    let cardContent = document.createElement("div");
    cardContent.setAttribute("class", "card-content");
    card.appendChild(cardContent);

    //handle images
    let imageContainer = document.createElement("div");
    imageContainer.setAttribute("class", "image-container");
    //result.weather is an array. I've only seen it with one, 
    //so im just going with the first
    let weather = result.weather[0];
    if (weather) {
        let imageDesc = document.createElement("label");
        imageDesc.appendChild(document.createTextNode(weather.description));

        let imgUrl = `${iconUrl}${weather.icon}@2x.png`;
        let image = new Image();
        image.src = imgUrl;

        let imageBox = document.createElement("div");
        imageBox.setAttribute("class", "image-box");

        imageBox.appendChild(imageDesc);
        imageBox.appendChild(image);

        imageContainer.appendChild(imageBox);
    }

    cardContent.appendChild(imageContainer);

    //handle tempeture
    let tempContainer = document.createElement("div");
    tempContainer.setAttribute("class", "temps")

    let tempNow = document.createElement("div");
    let temp;
    let curTemp = result.main.temp;
    if (curTemp <= 32) {
        temp = "freezing";
    } else if (curTemp > 32 && curTemp <= 55) {
        temp = "cold";
    } else if (curTemp > 55 && curTemp <= 70) {
        temp = "comfortable"
    } else if (curTemp > 70 && curTemp <= 90) {
        temp = "hot";
    } else {
        temp = "hell"; // lol
    }

    tempNow.setAttribute("class", `current-temp ${temp}`);
    tempNow.appendChild(document.createTextNode(Math.round(curTemp)));
    tempContainer.appendChild(tempNow);

    //add high and low
    let high = document.createElement("div");
    high.setAttribute("class", "high");
    high.appendChild(document.createTextNode(`High : ${Math.round(result.main.temp_max)}`));
    let low = document.createElement("div");
    low.setAttribute("class", "low");
    low.appendChild(document.createTextNode(`Low : ${Math.round(result.main.temp_min)}`));


    tempContainer.appendChild(high);
    tempContainer.appendChild(low);
    cardContent.appendChild(tempContainer);
    return card;

};

const resetForm = () => {
    form.childNodes.forEach(node => {
        if (node.tagName === "INPUT") node.value = null;
    })
};

const updatePage = (result) => {

    //if there is an error handle it.
    if (result.hasOwnProperty("error")) {
        let error = document.createElement("div");
        error.setAttribute("class", "error");
        error.appendChild(document.createTextNode(result.error));
        errorContainer.appendChild(error);
        return;
    }

    let card = createWeatherCard(result);
    //cards.push(card);
    content.appendChild(card);

    resetForm();
}

const buildQuery = () => {
    // What are some resons for doing `querySelector` from the `form` object
    // and not using `document.getElementById`?    
    let city = form.querySelector("#city").value;
    let state = form.querySelector("#state").value;
    let zip = form.querySelector("#zip").value;
    let units = 'imperial';

    if (!(city && state) && !zip) return false;

    let queryString = "&";
    if (city) queryString += `q=${city}`;
    if (city && state) queryString += `,${state}`;
    queryString += ",us";
    if (zip) queryString += `&zip=${zip},us`;
    queryString += `&units=${units}`;
    return queryString;

    // I appreciate choosing the more easily explainable version
    /*
    This would be how I write it normally, but it is complex to explain
    `${city ? city : ""}${state ? `,${state}` :""},us${zip? `&zip=${zip},us` :""}&units=${units}`;
    */
}

const findWeather = () => {

    let queryString = buildQuery();
    if (!queryString) {
        updatePage({ "error": "A city and state or a zip code is required." });
        return;//prevent fetch if error
    }

    let fetchOptions = {
        method: "GET",
        mode: "cors",
        headers: {
            'Content-Type': 'application/json'
        }
    }

    fetch(`${baseUrl}${queryString}`, fetchOptions)
        .then(result => result.json())
        .then(json => {
            //just in case json strings it later
            if (Number(json.cod) === 200) {
                updatePage(json);
                return;
            }
            updatePage({ error: json.message });
        })
        .catch(err => updatePage({ error: err }));//if the fetch returns an error
};

//add the event listeners
submitButton.addEventListener("click", findWeather);