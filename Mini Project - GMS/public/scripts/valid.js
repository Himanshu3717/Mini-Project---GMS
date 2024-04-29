function validatedFetch(url, body, fun) {
    fetch(url,
        {
            headers: { "Authorization": `Bearer ${localStorage.getItem("refreshToken")}` },
            method: "GET"
        }
    ).then(res => res.json()).then(res => {
        if (res.status === "token expired") {
            fetch("http://localhost:8080/auth/regenrate", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("refreshToken")}`
                },
                method: "POST"
            }).then(res => res.json()).then(res => {
                console.log(res);
                localStorage.setItem("access-token", res.token);
                validatedFetch(url, body, fun);
            })
        } else {
            fun();
        }
    })
}