const openBtn = document.getElementById("openDonate");
const popup = document.getElementById("donationPopup");
const closeBtn = document.getElementById("closeDonate");

openBtn.addEventListener("click", function (e) {
    e.preventDefault();
    popup.classList.add("active");
});

closeBtn.addEventListener("click", function () {
    popup.classList.remove("active");
});

popup.addEventListener("click", function (e) {
    if (e.target === popup) {
        popup.classList.remove("active");
    }
});

const amount = document.getElementById("amount");
const custom = document.getElementById("customAmount");

amount.addEventListener("change", function () {
    custom.style.display = amount.value === "custom" ? "block" : "none";
});
