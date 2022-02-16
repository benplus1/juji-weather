var app = new Vue({
    el: "#app",
    data: {
        chart: null,
        dates: [],
        temps: [],
        high_temps: [],
        low_temps: [],
        descriptions: [],

        curr_temp: null,
        curr_desc: null,
        curr_high: null,
        curr_low: null,

        curr_ws: null,
        curr_hum: null,
        curr_pres: null,
        curr_sunrise: null,
        curr_sunset: null,
        t_ws: false,
        t_hum: false,
        t_pres: false,
        t_sunrise: false,
        t_sunset: false,

        loading1: true,
        loading2: true,
        errored1: false,
        errored2: false,
    },
    methods: {
        getWeatherData: function () {
            axios
                .get("https://api.openweathermap.org/data/2.5/weather", {
                    params: {
                        lat: "40.71",
                        lon: "-74.00",
                        units: "imperial",
                        appid: "7c7c112dea9530046d6e9bc8f6a28cb8"
                    }
                })
                .then(response => {
                    console.log(response.data.dt);
                    this.curr_temp = Math.round(response.data.main.temp);                    
                    this.curr_desc = response.data.weather[0].main;                    
                    this.curr_high = Math.round(response.data.main.temp_max);
                    this.curr_low = Math.round(response.data.main.temp_min);

                    this.curr_ws = response.data.wind.speed;
                    this.curr_hum = response.data.main.humidity;
                    this.curr_pres = response.data.main.pressure;

                    let d1 = new Date(response.data.sys.sunrise*1000);
                    var hours1 = d1.getHours();
                    var minutes1 = "0" + d1.getMinutes();
                    var seconds1 = "0" + d1.getSeconds();
                    this.curr_sunrise = hours1 + ':' + minutes1.substr(-2) + ':' + seconds1.substr(-2);

                    let d2 = new Date(response.data.sys.sunset*1000);
                    var hours2 = d2.getHours();
                    var minutes2 = "0" + d2.getMinutes();
                    var seconds2 = "0" + d2.getSeconds();
                    this.curr_sunset = hours2 + ':' + minutes2.substr(-2) + ':' + seconds2.substr(-2);
                })
                .catch(error => {
                    console.log(error);
                    this.errored1 = true;
                })
                .finally(() => (this.loading1 = false));
        },
        getChartData: function () {
            axios
                .get("https://api.openweathermap.org/data/2.5/onecall", {
                    params: {
                        lat: "40.71",
                        lon: "-74.00",
                        units: "imperial",
                        appid: "7c7c112dea9530046d6e9bc8f6a28cb8"
                    }
                })
                .then(response => {
                    this.dates = response.data.daily.map(daily => {
                        var curr_date = new Date(daily.dt * 1000);
                        var out_string = curr_date.toISOString().substring(0, 19);
                        var true_string = out_string.substring(0, 10) + " " + out_string.substring(11);
                        return true_string;
                    });
                    this.dates=this.dates.slice(0, 7);

                    this.high_temps = response.data.daily.map(daily => {
                        return daily.temp.max;
                    });
                    this.high_temps=this.high_temps.slice(0, 7);

                    this.low_temps = response.data.daily.map(daily => {
                        return daily.temp.min;
                    });
                    this.low_temps=this.low_temps.slice(0, 7);

                    this.low_temps[0] = this.curr_low;
                    this.high_temps[0] = this.curr_high;
                    // this.curr_low = Math.round(this.low_temps[0]);
                    // this.curr_high = Math.round(this.high_temps[0]);
                    // this.curr_temp = Math.round(response.data.current.temp);

                    this.descriptions = response.data.daily.map(daily => {
                        return daily.weather[0].main;
                    });
                    this.descriptions=this.descriptions.slice(0, 7);


                    var ctx = document.getElementById("myChart");
                    this.chart = new Chart(ctx, {
                        type: "line",
                        data: {
                            labels: this.dates,
                            datasets: [
                                {
                                    label: "High Temp",
                                    backgroundColor: "rgba(235, 162, 54, 0.5)",
                                    borderColor: "rgb(235, 162, 54)",
                                    fill: false,
                                    data: this.high_temps
                                },
                                {
                                    label: "Low Temp",
                                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                                    borderColor: "rgb(54, 162, 235)",
                                    fill: false,
                                    data: this.low_temps
                                }
                            ],
                            descriptions: this.descriptions
                        },
                        options: {
                            title: {
                                display: false,
                                text: "High and Low Temperatures 7 Day Forecast"
                            },
                            tooltips: {
                                callbacks: {
                                    label: function (tooltipItem, data) {
                                        
                                        var label =
                                            data.datasets[tooltipItem.datasetIndex].label || "";

                                        if (label) {
                                            label += ": ";
                                        }

                                        label += Math.round(tooltipItem.yLabel);

                                        var status = data.descriptions[tooltipItem.index];
                                        return label + "°F || Status: " + status;
                                    }
                                }
                            },
                            scales: {
                                xAxes: [
                                    {
                                        type: "time",
                                        ticks: {
                                            source: 'labels'
                                        },
                                        time: {
                                            unit: "day",
                                            isoWeekday: true,
                                            displayFormats: {
                                                day: "M/DD"
                                            },
                                            tooltipFormat: "MMM. DD, dddd"
                                        },
                                        scaleLabel: {
                                            display: true,
                                            labelString: "Date"
                                        }
                                    }
                                ],
                                yAxes: [
                                    {
                                        scaleLabel: {
                                            display: true,
                                            labelString: "Temperature (°F)"
                                        },
                                        ticks: {
                                            callback: function (value, index, values) {
                                                return value + "°F";
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    });
                })
                .catch(error => {
                    console.log(error);
                    this.errored2 = true;
                })
                .finally(() => (this.loading2 = false));
        },
        dateBuilder () {
            let d = new Date();
            let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Satday", "Sunday"];

            let day = days[d.getDay()];
            let date = d.getDate();
            let month = months[d.getMonth()];
            let year = d.getFullYear();

            return `${day}, ${month} ${date}, ${year}`
        },
    },
    mounted() {
        this.getWeatherData();
        this.getChartData();
    }
});