// Focus div based on nav button click
document.getElementById("homenav").onclick = function() {
    document.getElementById("home").className = "active";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "hidden";
}

document.getElementById("singlenav").onclick = function(){
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "active";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "hidden";
}

document.getElementById("multinav").onclick = function() {
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "active";
    document.getElementById("guess").className = "hidden";
}

document.getElementById("guessnav").onclick = function() {
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "active";
}

// Flip one coin and show coin image to match result when button clicked
function flipCoin() {
    fetch("http://localhost:5000/app/flip/")
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            console.log(result);
            document.getElementById("result").innerHTML = result.flip;
            document.getElementById("smallcoin").setAttribute("src", "./assets/img/" + result.flip + ".png");
            coin.disabled = true;
        })
}

// Submit handler
function flipCoins() {
    // Prevents automatic form submission
    // Set endpoint and URL
    fetch("http://localhost:5555/app/flip/coins", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        body: JSON.stringify({"number" : document.getElementById("coinNums")})
        }).then(function (response) {
            return response.json();
        })
        .then(function (result) {
            console.log(result);

            // Put summary results into the summary table.
            document.getElementById("headFlipped").innerHTML = result.heads;
            document.getElementById("tailsFlipped").innerHTML = result.tails;
        })
    }

// Data sender
async function sendFlips({ url, formData }) {
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJson = JSON.stringify(plainFormData);
    console.log(formDataJson); 

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: formDataJson
    };
    const response = await fetch(url, options);
    return response.json();
}

function displayMultiResults(multi_results) { 
    document.getElementById('multi-ht-result').innerHTML = "";
    for (let i = 0; i < multi_results.length; i++) {
        document.getElementById('multi-ht-result').innerHTML += `
        <img id = "smallcoin" src="./assets/img/${multi_results[i]}.png"></img>
        <p>${multi_results[i]}</p>
        `
    }
}



// Guess a flip by clicking either heads or tails button
function guessHeads() {
    fetch("http://localhost:5000/app/flip/call/heads")
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            console.log(result);
            document.getElementById("call-result").innerHTML = result.call;
            document.getElementById("calls-coin").setAttribute("src", "./assets/img/" + result.call + ".png");
            document.getElementById("flips-result").innerHTML = result.flip;
            document.getElementById("flip-coin").setAttribute("src", "./assets/img/" + result.flip + ".png");
            document.getElementById("guess-result").innerHTML = result.result;
            coin.disabled = true;
        })
}

function guessTails() {
    fetch("http://localhost:5000/app/flip/call/tails")
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            console.log(result);
            document.getElementById("call-result").innerHTML = result.call;
            document.getElementById("calls-coin").setAttribute("src", "./assets/img/" + result.call + ".png");
            document.getElementById("flips-result").innerHTML = result.flip;
            document.getElementById("flip-coin").setAttribute("src", "./assets/img/" + result.flip + ".png");
            document.getElementById("guess-result").innerHTML = result.result;
            coin.disabled = true;
        })
}
