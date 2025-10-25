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
    const today = new Date(); today.setHours(0,0,0,0);

    const revealed = whiskeys.filter(w => new Date(w.date) <= today).map(({date, ...rest}) => rest);
    const next = whiskeys.find(w => new Date(w.date) > today);

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    revealed.forEach(w => {
      const div = document.createElement('div');
      div.className = 'day';
      div.innerHTML = `<h3>Day ${w.day}</h3><p><strong>${w.name}</strong></p><p>${w.distiller}</p>${w.notes ? `<p><em>${w.notes}</em></p>` : ''}${w.selectedBy ? `<p>Selected by: <strong>${w.selectedBy}</strong></p>` : ''}<p>${w.type} • ${w.age} • ${w.proof}</p>`;
      calendar.appendChild(div);
    });

    if (next) {
      const nextDate = new Date(next.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      document.getElementById('next-hint').textContent = `Next pour: ${nextDate}`;
      document.getElementById('next-hint').classList.remove('hidden');
    }

    status.innerHTML = `Revealed: <strong>${revealed.length}</strong> of 12`;
  } catch (err) {
    status.textContent = "Error. Try refreshing.";
  }
}
