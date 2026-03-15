const fetch = require('node-fetch');

async function getRandomJoke() {
    const response = await fetch('https://official-joke-api.appspot.com/random_joke');
    const joke = await response.json();
    return `${joke.setup} - ${joke.punchline}`;
}

getRandomJoke().then(joke => console.log(joke)).catch(err => console.error(err));