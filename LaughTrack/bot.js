// CONNECT TO ATRIOC CHAT.
const tmi = require('tmi.js');

const client = new tmi.Client({
    channels: ['atrioc']
});

client.connect();

// LOAD AUDIO FILES
const audio_files = [new Audio('media/laugh1.mp3'), new Audio('media/laugh2.mp3'), new Audio('media/laugh3.mp3'), new Audio('media/laugh4.mp3'), new Audio('media/laugh5.mp3'), new Audio('media/laugh6.mp3')];
let last_laugh_time = new Date() / 1000;
const LAUGH_THRESHOLD = 2;
const LAUGH_COOLDOWN_IN_SECONDS = 15;
let current_laugh_count = 0;

client.on('message', (channel, tags, message, self) => {
    message = message.trim();
    console.log(`${tags['display-name']}: ${message}`);
    console.log(`${current_laugh_count}`);
    let is_icant = true;
    words = message.split(" ");
    for (let i = 0; i < words.length; ++i)
    {
        if (words[i].length > 0 && words[i] != 'ICANT')
        {
            is_icant = false;
            break;
        }
    }
    if (is_icant)
    {
        current_laugh_count += 1;
        if (current_laugh_count == LAUGH_THRESHOLD)
        {
            let current_time = new Date() / 1000;
            if (current_time - last_laugh_time > LAUGH_THRESHOLD)
            {
                last_laugh_time = current_time;
                const audio = audio_files[Math.floor(Math.random() * audio_files.length)];
                audio.play();
            }
            current_laugh_count = 0;
        }
    }
    else
    {
        current_laugh_count = 0;
    }
});