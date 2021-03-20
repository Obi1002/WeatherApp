// create a button to clears the city lists
// create function to pull current location weather if no city is currently selected
// when I clear the browser data, the page stops functioning
// when I enter a new city, it doesn't refresh immediately, I have to refresh the page
// when I enter a new city, the previous city is still listed on the page

var cityList = [];
var id = "1fb9f764719cb87d0d40154ee206bffb";

// stores cityList in localStorage
function storeCities() {
    localStorage.setItem("cities", JSON.stringify(cityList));
}

// adds last searched city name to list-group as button for user to select city
function createCityList(){
    $(".cityList").empty();
    cityList.forEach(function(city) {
        $(".cityList").prepend($(`<button class="list-group-item list-group-item-action cityButton" data-city="${city}">${city}</button>`));
    })
}

// loads cityList from local storage and calls api to get data for last searched city if it exists
function init() {
    var storedCities = JSON.parse(localStorage.getItem("cities"));

    if (storedCities !== null) {
        cityList = storedCities;
    }

    createCityList();

    if (cityList.length>0) {
        var thisCity = cityList[cityList.length - 1]
        getCurrentWeather(thisCity, id);
        getForecast(thisCity, id);
    }
}

// gets current forecast for selected city and calls uv index function
function getCurrentWeather(thisCity, id) {
    var weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${thisCity}&units=imperial&appid=${id}`;
    var cityLat;
    var cityLong;

    $.ajax({
        url: weatherURL,
        method: "GET"
    }).then(function (data) {
        $(".cityToday").append(
            `<div class="row ml-1">
                <h3 class="mr-3">${data.name} (${(new Date(1000 * data.dt).getUTCMonth()) + 1}/${(new Date(1000 * data.dt).getUTCDate()) - 1}/${new Date(1000 * data.dt).getUTCFullYear()})</h3>
                <img src="http://openweathermap.org/img/w/${data.weather[0].icon}.png">
            </div>`
        )
        $(".cityToday").append(`<p>Temperature: ${data.main.temp} &degF</p>`)
        $(".cityToday").append(`<p>Humidity: ${data.main.humidity} %</p>`)
        $(".cityToday").append(`<p>Wind: ${data.wind.speed} mph</p>`)
        cityLat = data.coord.lat;
        cityLong = data.coord.lon;
        getUVI(id, cityLat, cityLong);
    })

}

// gets the 5-day forecast for selected city
function getForecast(thisCity, id) {
    var forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${thisCity}&units=imperial&appid=${id}`;

    $.ajax({
        url: forecastURL,
        method: "GET"
    }).then(function (data) {
        for (i = 0; i < data.list.length; i++) {
            if (data.list[i].dt_txt.search("15:00:00") != -1) {
                var forecastDate = data.list[i];
                $(".forecast").append(
                    `<div class="card bg-primary shadow m-4">
                        <div class="card-body">
                            <h4 class="card-title">${(new Date(1000 * forecastDate.dt).getUTCMonth()) + 1}/${new Date(1000 * forecastDate.dt).getUTCDate()}/${new Date(1000 * forecastDate.dt).getUTCFullYear()}</h4>
                            <div class="card-text">
                                <img src="http://openweathermap.org/img/w/${forecastDate.weather[0].icon}.png">
                                <p class="card-text">Temp: ${forecastDate.main.temp} &degF</p>
                                <p class="card-text">Humidity: ${forecastDate.main.humidity} %</p>
                            </div>
                        </div>
                    </div>`
                );
            }
        }

    })
}

// call in the getCurrentWeather() to get the uv index for selected city
function getUVI(id, cityLat, cityLong) {
    var uvURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${cityLat}&lon=${cityLong}&appid=${id}`;
    var color = "secondary"
    $.ajax({
        url: uvURL,
        method: "GET"
    }).then(function (data) {
        if (data.value >= 6 ){color = "danger"}
        else if (data.value >= 3 ){color = "warning"}
        else {color = "success"}
    $(".cityToday").append(`<p>UV Index: <span class="badge badge-${color} p-2">${data.value}</span></p>`);
            })
}

// function that clears data + calls both the current and 5-day forecasts for selected city
function displayCityWeather() {
    var thisCity = $(this).attr("data-city");

    $(".cityToday").empty();
    getCurrentWeather(thisCity, id);

    $(".forecast").empty();
    getForecast(thisCity, id);
    
}

// calls for the main page load function
init();

// submit the event that loads new data on the page
$("form").on("submit", function(event) {
    event.preventDefault();
    console.log("it works!")
    var newCity = $("#citySearchInput").val().trim();
        if (newCity !== "" ) {
    cityList.push(newCity);
    console.log(newCity);
    createCityList();
    storeCities();
    $("#citySearchInput").val("");
    // if (cityList) {
    //     var thisCity = cityList[cityList.length - 1]
    //     getCurrentWeather(thisCity, id);
    //     getForecast(thisCity, id);
    // }
    location.reload();
        }
})

// click event to displayCityWeather()
$(".cityList").on("click", ".cityButton", displayCityWeather);
