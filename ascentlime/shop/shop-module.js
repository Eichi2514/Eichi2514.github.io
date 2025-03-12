const moneyUnits = {
    0: "",
    1: "K",
    2: "M",
    3: "B",
    4: "T",
    5: "Q",
    6: "Qa",
    7: "Qi",
    8: "Sx",
    9: "Sp"
};

const urls = window.location.search;
const shopTap = urls ? urls.substring(1) : 0;

$(`.tab-${shopTap}`).css('z-index', 1);