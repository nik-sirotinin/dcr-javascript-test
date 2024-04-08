let plotData = [];

let plotChoice = "";

const formElement = document.querySelector("[data-plot-choice-form]");
const submitButton = formElement.querySelector("button[type=submit]");
const plotContainer = document.querySelector("[data-plot-container]");

formElement.addEventListener(
  "change",
  () => {
    submitButton.removeAttribute("disabled");
  },
  { once: true }
);

formElement.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(formElement);

  plotChoice = data.get("plot-choice");

  updatePlotData(plotChoice);

  createPlot();
});

console.log(countries[0]);

function updater(plotChoice) {
  let populationsCache = [];
  let bordersCache = [];
  let countryTimezonesCache = [];
  let languagesCache = [];
  let regionCountriesCache = [];
  let regionTimezonesCache = [];

  const updaters = {
    "population-by-country": () => {
      if (populationsCache.length <= 0) {
        populationsCache = countries.map((country) => ({
          name: country.alpha3Code,
          size: country.population,
        }));
      }
      return populationsCache;
    },
    "borders-by-country": () => {
      if (bordersCache.length <= 0) {
        bordersCache = countries.map((country) => ({
          name: country.alpha3Code,
          size: country.borders.length,
        }));
      }
      return bordersCache;
    },
    "timezones-by-country": () => {
      if (countryTimezonesCache.length <= 0) {
        countryTimezonesCache = countries.map((country) => ({
          name: country.alpha3Code,
          size: country.timezones.length,
        }));
      }
      return countryTimezonesCache;
    },
    "languages-by-country": () => {
      if (languagesCache.length <= 0) {
        languagesCache = countries.map((country) => ({
          name: country.alpha3Code,
          size: country.languages.length,
        }));
      }
      return languagesCache;
    },
    "countries-by-region": () => {
      if (regionCountriesCache.length <= 0) {
        const regionData = {};
        for (const country of countries) {
          const regionName = country.region;
          if (!regionData.hasOwnProperty(regionName)) {
            regionData[regionName] = 0;
          }
          regionData[regionName] += 1;
        }

        regionCountriesCache = Object.keys(regionData).map((regionName) => ({
          name: regionName,
          size: regionData[regionName],
        }));
      }
      return regionCountriesCache;
    },
    "timezones-by-region": () => {
      if (regionTimezonesCache.length <= 0) {
        const regionData = {};
        for (const country of countries) {
          const regionName = country.region;
          if (!regionData.hasOwnProperty(regionName)) {
            regionData[regionName] = new Set();
          }
          const timezones = regionData[regionName];
          for (const tz in country.timezones) {
            timezones.add(tz);
          }
        }

        regionTimezonesCache = Object.keys(regionData).map((regionName) => ({
          name: regionName,
          size: regionData[regionName].size,
        }));
      }
      return regionTimezonesCache;
    },
  };

  return updaters[plotChoice];
}

function updatePlotData(plotChoice) {
  const getNewData = updater(plotChoice);
  console.log("updating plot data...");

  plotData = getNewData();
}

function createPlot() {
  const width = window.innerWidth;
  const height = 800;
  const svg = d3.create("svg").attr("width", width).attr("height", height);

  const numberFormat = d3.format(",d");

  const hierarchy = (data) =>
    d3.hierarchy({ children: data }).sum((d) => d.size);

  const pack = d3.pack().size([width, height]).padding(5);

  const bubble = (data) =>
    d3.pack().size([width, height]).padding(5)(
      d3.hierarchy({ children: data }).sum((d) => d.size)
    );

  const root = bubble(plotData);
  const node = svg
    .selectAll()
    .data(root.children)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

  const circle = node
    .append("circle")
    .attr("r", (d) => d.r)
    .style("fill", "steelblue")
    .style("stroke", "black");

  const label = node
    .append("text")
    .attr("text-anchor", "middle")
    .attr("clip-path", (d) => `circle(${d.r})`);
  label
    .append("tspan")
    .style("font-size", (d) => `${d.r / 5}px`)
    .attr("dy", 2)
    .text((d) => d.data.name.substring(0, d.r / 2));
  label
    .append("tspan")
    .style("font-size", (d) => `${d.r / 8}px`)
    .attr("x", 0)
    .attr("y", (d) => `${d.r / 5}px`)
    .attr("fill-opacity", 0.7)
    .text((d) => numberFormat(d.data.size));

  plotContainer.innerHTML = "";
  plotContainer.append(svg.node());
}
