// CONNECT TO ATRIOC CHAT.
const tmi = require('tmi.js');

const client = new tmi.Client({
    channels: ['atrioc']
});

client.connect();

// LOAD AUDIO FILES
const audio_files = [new Audio('media/laugh1.mp3'), new Audio('media/laugh2.mp3'), new Audio('media/laugh3.mp3'), new Audio('media/laugh4.mp3'), new Audio('media/laugh5.mp3'), new Audio('media/laugh6.mp3')];
const crickets = new Audio('media/cricket.mp3');
const moooo = new Audio('media/MOOOO.mp3');
let last_laugh_time = new Date() / 1000;
const LAUGH_COOLDOWN_IN_SECONDS = 15;

const THRESHOLD = 5;
const MESSAGES_KEPT = 10;
let recent_messages = [];

client.on('message', (channel, tags, message, self) => {
    message = message.trim();

    // UPDATE CURRENT MESSAGE.
    document.getElementById("chat").innerHTML = `${tags['display-name']}: ${message}`;

    // UPDATE RECENT MESSAGES.
    recent_messages.push(message);
    if (recent_messages.length > MESSAGES_KEPT)
    {
      recent_messages.shift();
    }

    // CHECK FOR SOUND EFFECTS.
    let icant_count = 0;
    let ican_count = 0;
    let moo_count = 0;
    for (let i = 0; i < recent_messages.length; ++i)
    {
      if (recent_messages[i].includes("ICANT"))
      {
        icant_count += 1;
      }
      else if (recent_messages[i].includes("ICAN"))
      {
        ican_count += 1;
      }
      else if (recent_messages[i].includes("MOOOO"))
      {
        moo_count += 1;
      }
    }

    console.log(`${icant_count} ${ican_count} ${moo_count}`);

    if (icant_count >= THRESHOLD)
    {
      let current_time = new Date() / 1000;
      if (current_time - last_laugh_time > LAUGH_COOLDOWN_IN_SECONDS)
      {
          last_laugh_time = current_time;
          const audio = audio_files[Math.floor(Math.random() * audio_files.length)];
          audio.play();
      }
    }
    else if (ican_count >= THRESHOLD)
    {
        let current_time = new Date() / 1000;
        if (current_time - last_laugh_time > LAUGH_COOLDOWN_IN_SECONDS)
        {
            last_laugh_time = current_time;
            crickets.play();
        }
    }
    else if (moo_count >= THRESHOLD)
    {
        let current_time = new Date() / 1000;
        if (current_time - last_laugh_time > LAUGH_COOLDOWN_IN_SECONDS)
        {
            last_laugh_time = current_time;
            moooo.play();
        }
    }
});