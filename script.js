const PASSWORD = "wally";

function checkPassword() {
  const input = document.getElementById('pass').value.trim();
  if (input === PASSWORD) {
    document.getElementById('password-screen').classList.add('hidden');
    document.getElementById('status').classList.remove('hidden');
    document.getElementById('calendar').classList.remove('hidden');
    document.getElementById('next-hint').classList.remove('hidden');
    loadCalendar().then(startCountdown);
  } else {
    alert("Wrong password. Ask the host.");
  }
}

async function loadCalendar() {
  const status = document.getElementById('status');
  status.textContent = "Loading...";

  try {
    const res = await fetch('whiskeys.json');
    if (!res.ok) throw new Error('Failed to load whiskeys.json');
    const whiskeys = await res.json();

    const now = new Date();
    const estOffset = -5 * 60;
    const estNow = new Date(now.getTime() + estOffset * 60 * 1000);

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    let revealedCount = 0;
    let nextWhiskey = null;

    whiskeys.forEach(w => {
      const unlockTime = new Date(w.date + 'T08:00:00-05:00');
      if (estNow >= unlockTime) {
        const div = document.createElement('div');
        div.className = 'day';

        const imgHTML = w.image 
          ? `<img src="${w.image}" alt="${w.name} bottle" class="bottle-img" onclick="openModal('${w.image}')">` 
          : '';

        const tastingHTML = w.tastingNotes ? `
          <div class="tasting-notes">
            <h4>Tasting Notes</h4>
            <div><strong>Nose:</strong> ${w.tastingNotes.nose}</div>
            <div><strong>Palate:</strong> ${w.tastingNotes.palate}</div>
            <div><strong>Finish:</strong> ${w.tastingNotes.finish}</div>
          </div>
        ` : '';

        div.innerHTML = `
          ${imgHTML}
          <h3>Day ${w.day}</h3>
          <p><strong>${w.name}</strong></p>
          <p>${w.distillery}</p>
          ${w.notes ? `<p><em>${w.notes}</em></p>` : ''}
          ${w.selectedBy ? `<p>Selected by: <strong>${w.selectedBy}</strong></p>` : ''}
          <p>${w.type} • ${w.age} • ${w.proof}</p>
          ${tastingHTML}
        `;
        calendar.appendChild(div);
        revealedCount++;
      } else if (!nextWhiskey) {
        nextWhiskey = w;  // Save first future whiskey
      }
    });

    const nextHint = document.getElementById('next-hint');
    if (nextWhiskey) {
      const nextDate = new Date(nextWhiskey.date + 'T08:00:00-05:00');
      const formatted = nextDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      nextHint.innerHTML = `Next pour in: <strong id="countdown">Calculating...</strong> (${formatted} at 8:00 AM EST)`;
    } else {
      nextHint.textContent = "All whiskeys revealed! Merry Christmas!";
    }

    status.innerHTML = `Revealed: <strong>${revealedCount}</strong> of 12`;

    // Store next unlock time for countdown
    window.nextUnlockTime = nextWhiskey 
      ? new Date(nextWhiskey.date + 'T08:00:00-05:00') 
      : null;

  } catch (err) {
    status.textContent = "Error. Try refreshing.";
    console.error(err);
  }
}

function startCountdown() {
  const countdownEl = document.getElementById('countdown');
  if (!countdownEl || !window.nextUnlockTime) return;

  updateCountdown(countdownEl);
  setInterval(() => updateCountdown(countdownEl), 1000);
}

function updateCountdown(el) {
  const now = new Date();
  const estOffset = -5 * 60;
  const estNow = new Date(now.getTime() + estOffset * 60 * 1000);

  const nextUnlock = window.nextUnlockTime;
  if (!nextUnlock) {
    el.textContent = "All done!";
    return;
  }

  const diff = nextUnlock - estNow;
  if (diff <= 0) {
    el.textContent = "UNLOCKED!";
    loadCalendar();
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  el.innerHTML = days > 0 
    ? `${days}d ${hours}h ${minutes}m ${seconds}s`
    : `${hours}h ${minutes}m ${seconds}s`;
}
