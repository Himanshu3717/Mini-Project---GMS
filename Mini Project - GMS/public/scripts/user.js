let logout = document.querySelector(".logoutBtn")

logout.addEventListener("click", (e) => {
    e.preventDefault()
    fetch("http://localhost:8080/auth/logout", {
        method: "POST", // Assuming you are making a POST request
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("refreshToken")}`
        }, body: JSON.stringify({ id: localStorage.getItem("id") })
    })
        .then(res => res.json())
        .then(res => {
            console.log(res);
            localStorage.removeItem("refreshToken");
            window.location.reload() // Trigger the click event on the refresh button
        })
        .catch(error => {
            console.error("Error:", error);
        });
})

// let details = document.querySelector(".details")
// let display = document.querySelector(".display")

// details.addEventListener("click", (e) => {
//     e.preventDefault()
//     display.style.display = "none"
//     display.innerHTML =
//         ""
// })