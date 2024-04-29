const signIn = document.querySelector("button")

const emailInput = document.querySelector("#email")
const passwordInput = document.querySelector("#password")


signIn.addEventListener("click", async (e) => {
    e.preventDefault()
    let email = emailInput.value
    let password = passwordInput.value

    if (!email && !password) return alert("Input fields Empty")
    if (!email) return alert("Email field empty")
    if (!password) return alert("Password field empty")
    if (!validateEmail(email)) return alert("Enter a valid email")


    const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        return alert(data.status)
    }
    localStorage.setItem("refreshToken", JSON.stringify(data.token))
    // alert(data.status)
    validatedFetch("http://localhost:8080/loggedin", { id: data.user.id })
    // return window.location.replace('/')
})

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


function validatedFetch(url, body, fun) {
    fetch(url,
        {
            headers: {
                "Authorization": 'Bearer ' + localStorage.getItem("refreshToken")
            },
            method: "GET"
        }
    ).then(
        window.location.href = "http://localhost:8080/user"
    )
    // .then(res => res.text()).then(res => {
    //     if (res.status === "token expired") {
    //         fetch("http://localhost:8080/auth/regenrate", {
    //             headers: {
    //                 "Authorization": 'Bearer ' + localStorage.getItem("refreshToken")
    //             },
    //             method: "POST"
    //         },
    //         )
    //             .then(res => res.json()).then(res => {
    //                 console.log(res);
    //                 localStorage.setItem("access-token", res.token);
    //                 validatedFetch(url, body, fun);
    //             })
    //     } else {
    //         document.body.innerHTML = res
    //     }
    // })
}