const signUp = document.querySelector("button")

const nameInput = document.querySelector("#name")
const numberInput = document.querySelector("#number")
const emailInput = document.querySelector("#email")
const passwordInput = document.querySelector("#Password")
const weightInput = document.querySelector("#weight")
const heightInput = document.querySelector("#height")
const ageInput = document.querySelector("#age")
const genderInput = document.querySelector("#gender")

signUp.addEventListener("click", async (e) => {
    e.preventDefault()
    let name = nameInput.value
    let number = numberInput.value
    let email = emailInput.value
    let password = passwordInput.value
    let weight = weightInput.value
    let height = heightInput.value
    let age = ageInput.value
    let gender = genderInput.value

    if (!email || !password || !name || !number || !weight || !height || !gender || !age) {
        return alert("Input fields Empty")
    }
    if (!validateEmail(email)) return alert("Enter a valid email")
    if (!validateMobileNumber(number)) alert("Enter a l0 digit valid mobile number")

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    function validateMobileNumber(number) {
        const mobileRegex = /^[0-9]{10}$/;
        return mobileRegex.test(number);
    }

    const user = {
        name,
        number,
        email,
        password: password,
        weight,
        height,
        age,
        gender: gender.toLowerCase()
    }
    try {
        await fetch("http://localhost:8080/auth/register", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        }).then(res => res.json()).then(res => {
            alert(res.status)
            localStorage.setItem("refreshToken", JSON.stringify(res.token))
            window.location.replace('/')
        }).catch(error => console.error('Error:', error))
    } catch (error) {
        console.error('Error:', error);
    }
})