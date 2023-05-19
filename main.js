const searchValue = document.querySelector("#search")


async function getData() {
    const raw = await fetch("./data.json")
    const data = await raw.json()
    size = data.size

    return data
}

async function writeData() {

    const data = await getData()
    const result = []

    for (let shopkeeper of data) {
        result.push(convertData(shopkeeper))
    }

    const clusterize = Clusterize({
        rows: result,
        scrollId: 'scrollArea',
        contentId: 'contentArea'
    });


    searchValue.addEventListener("input", () => {

        const dataFiltered = filterData(data, searchValue.value)
        const lastData = []
        for (shopkeeper of dataFiltered) {
            lastData.push(convertData(shopkeeper))
        }
        if (lastData.length === 0) lastData.push(`<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`)
        clusterize.update(lastData)
    })

}

function filterData(data, filter) {

    if (data === "") return data

    return data.filter(shopkeeper => shopkeeper.shopName.toLowerCase().includes(filter.toLowerCase())
    )
}

function convertData(shopkeeper) {
    for (let recipe of shopkeeper.recipes) {
        const {shopName, shopOwner, location, world} = shopkeeper
        const locationSplited = location.split(", ")
        const {resultItem, item1, item2, stock} = recipe
        return (`
    <tr>
        <td>${shopName}</td>
        <td>${shopOwner}</td>
        <td><a href="https://peacefulvanilla.club/mapping-test/#${world};flat;${locationSplited[0]},${locationSplited[1]},${locationSplited[2]};5" target="_blank">${location}</a></td>
        <td>${world}</td>
        <td>${resultItem.name || `${resultItem.amount}x ${resultItem.type.replaceAll("_", " ")}`}</td>
        <td>${item1.name || `${item1.amount}x ${item1.type.replaceAll("_", " ")}`}</td>
        <td>${item2 ? item2.name || `${item2.amount}x ${item2.type.replaceAll("_", " ")}` : ""}</td>
        <td>${stock}</td>
    </tr>`)
    }
}

writeData()
