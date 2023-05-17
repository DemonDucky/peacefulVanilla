async function test() {
    const raw = await fetch("./data.json")
    const data = await raw.json()
    size = data.size

    return data
}

let currentPage = 0
let loading = false
let size = 0

const table = document.querySelector(".data_table")

async function writeData() {

    loading = true
    const data = await test()
    console.log("data loading")


    for (let i = 10 * currentPage; i <= 10 * currentPage + 10; i++) {

        if (i > data.size) break

        const shopkeeper = data[i]

        for (let recipe of shopkeeper.recipes) {
            table.innerHTML += `    
    <tr>
        <td>${shopkeeper.shopName}</td>
        <td>${shopkeeper.shopOwner}</td>
        <td>${shopkeeper.location}</td>
        <td>${shopkeeper.world}</td>
        <td>${recipe.resultItem.type}</td>
        <td>${recipe.item1.type}</td>
        <td>${recipe.item2.type}</td>
    </tr>`
        }
    }

    currentPage++
    console.log("data loaded")
    loading = false
}

writeData()

window.addEventListener('scroll', () => {
    if (
        window.scrollY + window.innerHeight >= document.body.offsetHeight - (window.innerHeight / 2)
    ) {
        console.log("End Page")
        if (!loading)
            if (10 * currentPage > size) console.log("All data printed")
            writeData()
    }
});