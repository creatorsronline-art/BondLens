let allData = [];
let yearSlider;
let selectedRatings = [];

fetch("bonds.json")
.then(response => response.json())
.then(data => {

    allData = data;

    buildSummary(data);
    loadFilters(data);
    initializeYearSlider(data);
    renderCards(data);

});

function buildSummary(data){

    document.getElementById("bondCount").innerText =
        data.length;

    let maxYield =
        Math.max(
            ...data.map(
                x => parseFloat(x["ApproxYTM%"]) || 0
            )
        );

    document.getElementById("maxYield").innerText =
        maxYield.toFixed(2) + "%";

    let sellerCount =
        data.filter(
            x =>
            x["BestAsk"] &&
            x["BestAsk"] !== ""
        ).length;

    document.getElementById("sellerCount").innerText =
        sellerCount;

}

function loadFilters(data){

    loadRatingDropdown(data);

    loadFrequencyDropdown(data);

    document
    .getElementById("ratingToggle")
    .addEventListener("click", () => {

        document
        .getElementById("ratingDropdown")
        .classList
        .toggle("show");

    });

}

function loadRatingDropdown(data){

    const dropdown =
        document.getElementById("ratingDropdown");

    dropdown.innerHTML = "";

    const ratings =
        [...new Set(
            data
            .map(
                x => x["Credit Rating Value"]
            )
            .filter(Boolean)
        )];

    const ratingOrder = [

        "AAA",

        "AA+",
        "AA",
        "AA-",

        "A+",
        "A",
        "A-",

        "BBB+",
        "BBB",
        "BBB-",

        "BB+",
        "BB",
        "BB-"

    ];

    ratingOrder.forEach(rating => {

        if(!ratings.includes(rating))
            return;

        dropdown.innerHTML +=
        `
        <div class="checkbox-item">

            <input
                type="checkbox"
                value="${rating}"
                class="rating-checkbox">

            <span>${rating}</span>

        </div>
        `;

    });

}

function loadFrequencyDropdown(data){

    const freqFilter =
        document.getElementById("freqFilter");

    let freqs =
        [...new Set(
            data
            .map(
                x =>
                x["Frequency of Interest Payment"]
            )
            .filter(Boolean)
        )];

    freqs.sort();

    freqs.forEach(freq => {

        let option =
            document.createElement("option");

        option.value = freq;
        option.textContent = freq;

        freqFilter.appendChild(option);

    });

}

function initializeYearSlider(data){

    const maxYears =
        Math.ceil(
            Math.max(
                ...data.map(
                    x =>
                    parseFloat(
                        x["YearsToMaturity"]
                    ) || 0
                )
            )
        );

    const slider =
        document.getElementById("yearSlider");

    noUiSlider.create(slider, {

        start:[0,maxYears],

        connect:true,

        range:{
            min:0,
            max:maxYears
        }

    });

    slider.noUiSlider.on("update", values => {

        document
        .getElementById("yearMinValue")
        .innerText =
        parseFloat(values[0]).toFixed(1);

        document
        .getElementById("yearMaxValue")
        .innerText =
        parseFloat(values[1]).toFixed(1);

    });

    yearSlider = slider;

}

function getYieldClass(ytm){

    ytm = parseFloat(ytm);

    if(ytm < 10)
        return "ytm-orange";

    if(ytm <= 12)
        return "ytm-green";

    return "ytm-red";

}

function formatDate(ms){

    if(!ms)
        return "-";

    return new Date(ms)
    .toLocaleDateString(
        "en-IN",
        {
            day:"2-digit",
            month:"short",
            year:"numeric"
        }
    );

}

function renderCards(data){

    const container =
        document.getElementById("cardsContainer");

    container.innerHTML = "";

    if(data.length === 0){

        container.innerHTML =
        `
        <div class="bond-card">
            No bonds found
        </div>
        `;

        return;

    }

    data.forEach(bond => {

        const sellerAvailable =
            bond["BestAsk"] &&
            bond["BestAsk"] !== "";

        const ytm =
            parseFloat(
                bond["ApproxYTM%"]
            ).toFixed(2);

        const coupon =
            (
                parseFloat(
                    bond["Coupon Rate_Input"]
                ) * 100
            ).toFixed(2);

        const priceLabel =
            sellerAvailable
            ? "Ask Price"
            : "LTP";

        const priceValue =
            sellerAvailable
            ? bond["BestAsk"]
            : bond["LastRate"];

        container.innerHTML +=
        `
        <div class="bond-card">

            <div class="card-header">

                <div>

                    <div class="company-name">
                        ${bond["Name of Issuer"]}
                    </div>

                    <div class="scrip-name">
                        Scrip Name:
                        ${bond["ScripCode_Input"]}
                    </div>

                    <div class="isin">
                        ${bond["ISIN"]}
                    </div>

                </div>

                <div class="yield-badge ${getYieldClass(ytm)}">
                    ${ytm}%
                </div>

            </div>

            <div class="grid">

                <div>
                    <label>Credit Rating</label>
                    <p>${bond["Credit Rating Value"] || "-"}</p>
                </div>

                <div>
                    <label>Coupon (At the time of issue)</label>
                    <p>${coupon}%</p>
                </div>

                <div>
                    <label>Maturity Date</label>
                    <p>${formatDate(bond["Maturity Date"])}</p>
                </div>

                <div>
                    <label>Years To Maturity</label>
                    <p>${bond["YearsToMaturity"]}</p>
                </div>

                <div>
                    <label>Face Value</label>
                    <p>
                    ₹${Number(
                        bond["Face Value_Input"] || 0
                    ).toLocaleString("en-IN")}
                    </p>
                </div>

                <div>
                    <label>Interest Frequency</label>
                    <p>
                    ${bond["Frequency of Interest Payment"] || "-"}
                    </p>
                </div>

                <div>
                    <label>Sector</label>
                    <p>
                    ${bond["Business Sector"] || "-"}
                    </p>
                </div>

                <div>
                    <label>${priceLabel}</label>
                    <p>${priceValue || "-"}</p>
                </div>

                <div>
                    <label>Exchange</label>
                    <p>
                    ${
                        bond["Exchange"] === "N"
                        ? "NSE"
                        : bond["Exchange"] === "B"
                        ? "BSE"
                        : bond["Exchange"]
                    }
                    </p>
                </div>

            </div>

        </div>
        `;

    });

}

document
.getElementById("applyFilters")
.addEventListener("click", () => {

    selectedRatings =
        Array.from(
            document.querySelectorAll(
                ".rating-checkbox:checked"
            )
        )
        .map(x => x.value);

    const freq =
        document.getElementById("freqFilter").value;

    const seller =
        document.getElementById("sellerFilter").value;

    const search =
        document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const sliderValues =
        yearSlider
        .noUiSlider
        .get();

    const minYears =
        parseFloat(sliderValues[0]);

    const maxYears =
        parseFloat(sliderValues[1]);

    const filtered =
        allData.filter(bond => {

            const years =
                parseFloat(
                    bond["YearsToMaturity"]
                ) || 0;

            const sellerAvailable =
                bond["BestAsk"] &&
                bond["BestAsk"] !== "";

            const matchesSearch =

                !search ||

                (
                    bond["Name of Issuer"] || ""
                )
                .toLowerCase()
                .includes(search)

                ||

                (
                    bond["ISIN"] || ""
                )
                .toLowerCase()
                .includes(search)

                ||

                (
                    bond["ScripCode_Input"] || ""
                )
                .toLowerCase()
                .includes(search);

            return (

                matchesSearch &&

                years >= minYears &&
                years <= maxYears &&

                (

                    selectedRatings.length === 0 ||

                    selectedRatings.includes(

                        bond["Credit Rating Value"]

                    )

                ) &&

                (

                    !freq ||

                    bond["Frequency of Interest Payment"]
                    === freq

                ) &&

                (

                    !seller ||

                    (
                        seller === "Available" &&
                        sellerAvailable
                    )

                    ||

                    (
                        seller === "Not Available" &&
                        !sellerAvailable
                    )

                )

            );

        });

    renderCards(filtered);

});