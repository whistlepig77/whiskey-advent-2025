const PASSWORD = "whiskey2025";

function checkPassword() {
  const input = document.getElementById('pass').value.trim();
  if (input === PASSWORD) {
    document.getElementById('password-screen').classList.add('hidden');
    document.getElementById('status').classList.remove('hidden');
    document.getElementById('calendar').classList.remove('hidden');
    loadCalendar();
  } else {
    alert("Wrong password. Ask the host.");
  }
}

async function loadCalendar() {
  const status = document.getElementById('status');
  status.textContent = "Loading...";

  try {
    const res = await fetch('whiskeys.json');
    const whiskeys = await res.json();

    // === 8:00 AM EST UNLOCK LOGIC ===
    const now = new Date();
    const estOffset = -5 * 60; // EST = UTC-5
    const estNow = new Date(now.getTime() + estOffset * 60 * 1000);
    estNow.setHours(8, 0, 0, 0); // Set to 8:00 AM EST today
    const today = estNow;
    // ================================

    // Compare whiskey date at 8:00 AM EST
    const revealed = whiskeys
      .filter(w => new Date(w.date + 'T08:00:00-05:00') <= today)
      .map(({ date, ...rest }) => rest);

    const next = whiskeys.find(w => new Date(w.date + 'T08:00:00-05:00') > today);

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    revealed.forEach(w => {
      const div = document.createElement('div');
      div.className = 'day';
      div.innerHTML = `
        <h3>Day ${w.day}</h3>
        <p><strong>${w.name}</strong></p>
        <p>${w.distiller}</p>
        ${w.notes ? `<p><em>${w.notes}</em></p>` : ''}
        ${w.selectedBy ? `<p>Selected by: <strong>${w.selectedBy}</strong></p>` : ''}
        <p>${w.type} • ${w.age} • ${w.proof}</p>
      `;
      calendar.appendChild(div);
    });

    if (next) {
      const nextDate = new Date(next.date + 'T08:00:00-05:00');
      const formatted = nextDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }) + ' at 8:00 AM EST';
      document.getElementById('next-hint').textContent = `Next pour: ${formatted}`;
      document.getElementById('next-hint').classList.remove('hidden');
    }

    status.innerHTML = `Revealed: <strong>${revealed.length}</strong> of 12`;

  } catch (err) {
    status.textContent = "Error. Try refreshing.";
    console.error(err);
  }
}
