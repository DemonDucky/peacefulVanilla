const searchValue = document.querySelector("#search")
const headers = document.querySelectorAll(".clusterize thead td")
const textBox = document.querySelector(".meta-data")
const arrowDown = "<i id=\"down\" class=\"arrow\"><box-icon size='xs' color='white' type='solid' name='down-arrow'></box-icon></i>"
const defaultArrow = "<i id=\"down\" class=\"arrow-default\"><box-icon size='xs' color='white' name='expand-vertical'></box-icon></i>"
const arrowUp = "<i id=\"up\" class=\"arrow\"><box-icon size='xs' color='white' type='solid' name='up-arrow'></box-icon></i>"
let rawLink = ""
let clusterize = null
let flattenedData = []
let dataDisplaying = []
let sponsorsData = []

async function getData() {

    const raw = await fetch("./data.json")

    return await raw.json()
}

async function writeData() {

    headers.forEach(header => {
        header.innerHTML += defaultArrow
    })

    const data = await getData()
    flattenedData = flattenData(data.data)
    shuffleArray(flattenedData)
    dataDisplaying = [...flattenedData]

    sponsorsData = flattenedData.filter((value) => {
        if (value.expiredDate && Date.now() < value.expiredDate) return true
    })

    rawLink = data.information.link

    clusterize = Clusterize({
        rows: convertData(dataDisplaying), scrollId: 'scrollArea', contentId: 'contentArea'
    });

    addEvent()
    sortEvent()


    document.getElementById('contentArea').onmouseover = function (e) {
        const target = e.target
        if (target.nodeName !== 'TD') return
        const name = target.dataset.name
        const lore = target.dataset.lore
        const enchants = target.dataset.enchants
        if (target.dataset.hoverable === "true") {
            if (name !== "" || lore !== "" || enchants !== "") {
                textBox.style.display = "block"
                textBox.innerHTML = `Name: ${name}<br><br>Lore:<br>${lore}<br><br>Enchants:<br>${enchants}`
            }
        }

        if (target.closest("tr").dataset.hoverable === "true" && (name === undefined || name === "") && (lore === undefined || lore === "") && (enchants === undefined || enchants === "")) {
            const message = target.closest("tr").dataset.message
            textBox.style.display = "block"
            textBox.innerHTML = message === "" ? "[no message]" : message
        }
    }

    document.getElementById("contentArea").onmouseout = function (e) {
        const target = e.target
        if (target.nodeName !== 'TD' || (target.dataset.hoverable !== "true" && target.parentElement.dataset.hoverable !== "true")) return


        textBox.style.display = "none"
    }

    document.getElementById("contentArea").onmousemove = function (e) {
        const target = e.target
        if (target.nodeName !== 'TD') return
        const mouseX = e.pageX + 10;
        const mouseY = e.pageY + 10;
        textBox.style.left = mouseX + 'px';
        textBox.style.top = mouseY + 'px';
    }

    let time = data.information.timeDumped
    time = time.split("T")
    document.querySelector("#timeDumped").innerHTML = `Last Update: ${time[0]} (${time[1].split(".")[0]})`
}

function addRandomSponsor(tradings) {

    shuffleArray(sponsorsData).forEach((value, index) => {
        const random = Math.floor(Math.random() * 51 + index * 50)
        if (tradings.length >= random) {
            tradings.splice(Math.floor(Math.random() * 51 + index * 50), 0, value)
        }
    })
}

function removeAllSponsors(tradings) {
    return tradings.filter(value => !value.expiredDate)
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array
}


function flattenData(shopkeepers) {

    const result = []

    // Loop through all shopkeeper
    shopkeepers.forEach(shopkeeper => {

        // Loop through all trade
        shopkeeper.recipes.forEach(trade => {

            result.push({
                message: trade.message !== null ? trade.message : null,
                expiredDate: trade.expiredDate ? Date.parse(trade.expiredDate) : null,
                shopName: shopkeeper.shopName,
                shopOwner: shopkeeper.shopOwner,
                location: shopkeeper.location,
                world: shopkeeper.world,
                resultItem: trade.resultItem,
                item1: trade.item1,
                item2: trade.item2,
                stock: trade.stock
            })

        })
    })

    return result
}


function convertData(tradings) {

    const result = ['<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>']

    const modifiedTradings = removeAllSponsors(tradings)
    addRandomSponsor(modifiedTradings)

    modifiedTradings.forEach(trading => {
        const {message, expiredDate, shopName, shopOwner, location, world, resultItem, item1, item2, stock} = trading
        const locationSplited = location.split(", ")

        const link = rawLink
            .replace("%{world}", world.toLowerCase())
            .replace("%{x}", locationSplited[0])
            .replace("%{y}", locationSplited[1])
            .replace("%{z}", locationSplited[2])

        const resultItemMeta = getMetaData(resultItem)
        const item1Meta = getMetaData(item1)
        const item2Meta = getMetaData(item2)


        result.push(`
    <tr data-message="${message}" data-hoverable="${(!!expiredDate)}" class="${expiredDate ? "sponsor" : null}">
        <td class="${expiredDate ? "test" : null}">${shopName}</td>
        <td>${shopOwner}</td>
        <td><a href="${link}" target="_blank">${location}</a></td>
        <td>${world}</td>
        <td data-hoverable="true" data-enchants="${resultItemMeta.enchant}" data-lore="${resultItemMeta.lore}" data-name="${resultItem.name ?? ""}">${resultItem.amount}x ${resultItem.type.replaceAll("_", " ")}</td>
        <td data-hoverable="true" data-enchants="${item1Meta.enchant}" data-lore="${item1Meta.lore}" data-name="${item1.name ?? ""}">${resultItem.amount}x ${item1.type.replaceAll("_", " ")}</td>
        <td data-hoverable="true" data-enchants="${item2Meta.enchant}" data-lore="${item2Meta.lore}" data-name="${item2 ? item2.name : ""}">${item2 ? `${resultItem.amount}x ${item2.type.replaceAll("_", " ")}` : ""}</td>
        <td>${stock}</td>
    </tr>`)
    })

    return result
}

function getMetaData(item) {

    if (item === undefined) return {lore: "", enchant: ""}

    const resultItemLore = item.lore ? item.lore.join("<br>").replace(/§./g, "") : ""
    const itemEnchant = []

    if (item.enchant && Object.keys(item.enchant).length !== 0) {
        for (const [key, value] of Object.entries(item.enchant)) {
            itemEnchant.push(`- ${key.replaceAll("minecraft:", "").replace("_", " ")}: ${value}`)
        }
    }

    return {
        lore: resultItemLore, enchant: itemEnchant.join("<br>")
    }
}


function addEvent() {
    searchValue.addEventListener("input", () => {

        const dataFiltered = filterData()
        const result = convertData(dataFiltered)
        if (result.length === 0) result.push(`<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`)

        dataDisplaying = dataFiltered
        clusterize.update(result)
    })
}

function filterData() {

    const value = searchValue.value

    if (value === "") {
        return shuffleArray(flattenedData)
    }

    const searchFilter = document.querySelector('#searchBy')


    return flattenedData.filter(trading => {
        if (searchFilter.value !== "resultItem" && trading[searchFilter.value].toLowerCase().includes(value.toLowerCase())) {
            return true
        } else if (searchFilter.value === "resultItem") {

            if (trading.resultItem[typeOrName(trading.resultItem)].toLowerCase().includes(value.toString())) return true
        }
    })

}

function typeOrName(item) {

    return "type"
    // if (!item) return null
    //
    // let typeOrName = "type"
    // if (item.name !== "") typeOrName = "name"

    // return typeOrName
}

function sortEvent() {
    headers.forEach(header => {
        header.addEventListener('click', () => addIcon(header))
    })
}

function addIcon(header) {

    const defaultArrow = document.querySelectorAll(".arrow-default")
    if (defaultArrow) {
        defaultArrow.forEach(value => value.remove())
    }

    headers.forEach(headerAgain => {
        const arrow = headerAgain.querySelector(".arrow")
        if (arrow && headerAgain !== header) {
            headerAgain.removeChild(arrow)
        }
    })

    const getArrow = header.querySelector(".arrow")
    if (getArrow) {
        switch (getArrow.id) {
            case "down":
                header.removeChild(getArrow)
                header.innerHTML += arrowUp
                sortTable(header.dataset.value, true)
                break
            case "up":
                header.removeChild(getArrow)
                header.innerHTML += arrowDown
                sortTable(header.dataset.value, false)
        }
    } else {
        header.innerHTML += arrowDown
        sortTable(header.dataset.value, false)
    }
}

function sortTable(sortByColumn, desc) {

    const allData = [flattenedData, dataDisplaying]

    if (sortByColumn === "shopOwner" || sortByColumn === "shopName" || sortByColumn === "world") {

        allData.forEach(data => data.sort((a, b) => sortString(a[sortByColumn], b[sortByColumn], desc)))

    } else if (sortByColumn === "resultItem" || sortByColumn === "item1" || sortByColumn === "item2") {

        allData.forEach(data => {
            data.sort((a, b) => {
                const curItem = a[sortByColumn]
                const nextItem = b[sortByColumn]

                switch (true) {
                    case (curItem === undefined && nextItem === undefined):
                        return desc ? 1 : -1
                    case (curItem !== undefined && nextItem === undefined):
                        return desc ? -1 : 1
                    case (curItem === undefined && nextItem !== undefined):
                        return desc ? 1 : -1
                }

                return sortString(curItem[typeOrName(curItem)], nextItem[typeOrName(nextItem)], desc)
            })
        })
    } else if (sortByColumn === "stock") {
        allData.forEach(data => data.sort((a, b) => sortNumber(a[sortByColumn], b[sortByColumn], desc)))
    } else if (sortByColumn === "location") {

        allData.forEach(data => data.sort((a, b) => {
            const curLoc = a[sortByColumn].split(", ")
            const nextLoc = b[sortByColumn].split(", ")
            let [curLocX, curLocY, curLocZ] = curLoc
            let [nextLocX, nextLocY, nextLocZ] = nextLoc

            curLocX = curLocX * 1
            curLocY = curLocY * 1
            curLocZ = curLocZ * 1

            nextLocX = nextLocX * 1
            nextLocY = nextLocY * 1
            nextLocZ = nextLocZ * 1

            if (curLocX !== nextLocX) {
                return sortNumber(curLocX, nextLocX, desc)
            }

            if (curLocY !== nextLocY) {
                return sortNumber(curLocY, nextLocY, desc)
            }

            if (curLocZ !== nextLocZ) {
                return sortNumber(curLocZ, nextLocZ, desc)
            }


        }))
    }

    clusterize.update(convertData(dataDisplaying))

}

function sortString(a, b, desc) {
    return desc ? -(a.localeCompare(b)) : a.localeCompare(b)
}

function sortNumber(a, b, desc) {
    const swap = b * 1 - a * 1 >= 0 ? -1 : 1
    return desc ? -swap : swap
}

window.addEventListener("load", () => {

    writeData()
})

const header = document.querySelector(".clusterize thead tr")

header.style.width = `${document.querySelector(".clusterize thead").offsetWidth}px`

const scrollArea = document.querySelector(".clusterize .clusterize-scroll")

window.onresize = function () {
    header.style.width = `${document.querySelector(".clusterize thead").offsetWidth}px`
    header.style.marginLeft = window.innerWidth > 1200 ? "40px" : scrollArea.scrollLeft

}

scrollArea.onscroll = function () {
    if (window.innerWidth > 1200) {
        header.style.marginLeft = "40px"
    } else {
        header.style.marginLeft = `-${this.scrollLeft}px`
    }
}
