async function test() {
    const raw = await fetch("./data.json")
    const data = await raw.json()
    size = data.size

    return data
}

function hello(data) {
    console.log(data)
}
async function writeData() {

    const data = await test()
    const result = []

    for (let shopkeeper of data) {

        for (let recipe of shopkeeper.recipes) {
            const {shopName, shopOwner, location, world} = shopkeeper
            const locationSplited = location.split(", ")
            const {resultItem, item1, item2, stock} = recipe
            result.push(`
    <tr>
        <td>${shopName}</td>
        <td>${shopOwner}</td>
        <td><a href="https://peacefulvaanilla.club/mapping-test/#${world};flat;${locationSplited[0]},${locationSplited[1]},${locationSplited[2]};5" target="_blank">${location}</a></td>
        <td>${world}</td>
        <td onmouseover="hello('${resultItem.type}')">${resultItem.name || `${resultItem.amount}x ${resultItem.type.replaceAll("_", " ")}`}</td>
        <td>${item1.name || `${item1.amount}x ${item1.type.replaceAll("_", " ")}`}</td>
        <td>${item2 ? item2.name || `${item2.amount}x ${item2.type.replaceAll("_", " ")}` : ""}</td>
        <td>${stock}</td>
    </tr>`)
        }
    }

    Clusterize({
        rows: result,
        scrollId: 'scrollArea',
        contentId: 'contentArea'
    });

}

writeData()
