async function loadCalendar() {
  const status = document.getElementById('status');
  status.textContent = "Loading...";

  try {
    const res = await fetch('whiskeys.json');
    const whiskeys = await res.json();

    // Get current time in EST
    const now = new Date();
    const estOffset = -5 * 60; // EST = UTC-5
    const estNow = new Date(now.getTime() + estOffset * 60 * 1000);

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    let revealedCount = 0;

    whiskeys.forEach(w => {
      // Build whiskey unlock time: 8:00 AM EST on its date
      const unlockTime = new Date(w.date + 'T08:00:00-05:00');

      if (estNow >= unlockTime) {
        // Unlocked!
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
        revealedCount++;
      }
    });

    // Find next pour
    const nextWhiskey = whiskeys.find(w => {
      const unlockTime = new Date(w.date + 'T08:00:00-05:00');
      return estNow < unlockTime;
    });

    if (nextWhiskey) {
      const nextDate = new Date(nextWhiskey.date + 'T08:00:00-05:00');
      const formatted = nextDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }) + ' at 8:00 AM EST';
      document.getElementById('next-hint').textContent = `Next pour: ${formatted}`;
      document.getElementById('next-hint').classList.remove('hidden');
    }

    status.innerHTML = `Revealed: <strong>${revealedCount}</strong> of 12`;

  } catch (err) {
    status.textContent = "Error. Try refreshing.";
    console.error(err);
  }
}
