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
            const {resultItem, item1, item2, stock} = recipe
            result.push(`
    <tr>
        <td>${shopName}</td>
        <td>${shopOwner}</td>
        <td>${location}</td>
        <td>${world}</td>
        <td onmouseover="hello('${resultItem.type}')">${resultItem.type}</td>
        <td>${item1.type}</td>
        <td>${item2.type}</td>
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
