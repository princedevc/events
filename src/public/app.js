async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(path, { method: 'POST', body: JSON.stringify(body), headers });
  return res.json();
}

document.getElementById('init-btn').addEventListener('click', async () => {
  const eventId = document.getElementById('init-event-id').value;
  const tickets = Number(document.getElementById('init-tickets').value || 0);
  const basic = document.getElementById('init-basic').value || 'admin:password';
  const tokenRes = await fetch('/auth/token', { method: 'POST', headers: { Authorization: 'Basic ' + btoa(basic) } }).then(r => r.json());
  const token = tokenRes.token;
  const r = await post('/initialize', { eventId, tickets }, token);
  document.getElementById('init-result').textContent = JSON.stringify(r);
  // populate other fields
  document.getElementById('status-event-id').value = eventId;
});

document.getElementById('book-btn').addEventListener('click', async () => {
  const eventId = document.getElementById('book-event-id').value;
  const userId = document.getElementById('book-user-id').value;
  const r = await post('/book', { eventId, userId });
  document.getElementById('book-result').textContent = JSON.stringify(r);
});

document.getElementById('status-btn').addEventListener('click', async () => {
  const eventId = document.getElementById('status-event-id').value;
  const r = await fetch('/status/' + encodeURIComponent(eventId)).then(r => r.json());
  document.getElementById('status-result').textContent = JSON.stringify(r, null, 2);
});

document.getElementById('cancel-btn').addEventListener('click', async () => {
  const eventId = document.getElementById('cancel-event-id').value;
  const userId = document.getElementById('cancel-user-id').value;
  const token = document.getElementById('cancel-token').value;
  const r = await post('/cancel', { eventId, userId }, token);
  document.getElementById('cancel-result').textContent = JSON.stringify(r);
});
