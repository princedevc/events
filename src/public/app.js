// Sample events data
const sampleEvents = [
  {
    id: 'tech-summit-2025',
    title: 'Annual Tech Summit 2025',
    date: 'Dec 15, 2025',
    dateObj: new Date('2025-12-15'),
    time: '9:00 AM - 6:00 PM',
    location: 'San Francisco Convention Center',
    category: 'Technology',
    description: 'Join industry leaders for a full day of talks, workshops, and networking opportunities. Explore the latest in AI, cloud computing, and web technologies.',
    price: '$129',
    capacity: '1,500 / 1,500',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23667eea" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="white" text-anchor="middle" dy=".3em" font-weight="bold"%3ETech Summit 2025%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'web-dev-workshop',
    title: 'Modern Web Development Workshop',
    date: 'Dec 20, 2025',
    dateObj: new Date('2025-12-20'),
    time: '2:00 PM - 5:00 PM',
    location: 'Downtown Innovation Hub',
    category: 'Workshop',
    description: 'Learn the latest web development practices including React, TypeScript, and modern CSS. Perfect for developers of all levels.',
    price: '$79',
    capacity: '50 / 50',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%2310b981" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="white" text-anchor="middle" dy=".3em" font-weight="bold"%3EWeb Dev Workshop%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'ai-masterclass',
    title: 'AI & Machine Learning Masterclass',
    date: 'Dec 28, 2025',
    dateObj: new Date('2025-12-28'),
    time: '10:00 AM - 4:00 PM',
    location: 'Tech Campus, Building A',
    category: 'Masterclass',
    description: 'Deep dive into artificial intelligence, machine learning models, and practical applications. Led by industry experts with 10+ years experience.',
    price: '$199',
    capacity: '200 / 200',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23f59e0b" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="white" text-anchor="middle" dy=".3em" font-weight="bold"%3EAI Masterclass%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'startup-pitch-night',
    title: 'Startup Pitch Night',
    date: 'Jan 5, 2026',
    dateObj: new Date('2026-01-05'),
    time: '6:00 PM - 9:00 PM',
    location: 'Venture Capital Headquarters',
    category: 'Networking',
    description: 'Watch emerging startups pitch their ideas to venture capitalists and investors. Network with entrepreneurs and innovators.',
    price: 'Free',
    capacity: '300 / 300',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%238b5cf6" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="white" text-anchor="middle" dy=".3em" font-weight="bold"%3EStartup Pitch Night%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'design-conference',
    title: 'UI/UX Design Conference',
    date: 'Jan 12, 2026',
    dateObj: new Date('2026-01-12'),
    time: '8:00 AM - 5:30 PM',
    location: 'Design District Convention Hall',
    category: 'Conference',
    description: 'Explore cutting-edge design trends, accessibility, and user research. Featuring talks from award-winning designers and companies.',
    price: '$149',
    capacity: '400 / 400',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23ec4899" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="white" text-anchor="middle" dy=".3em" font-weight="bold"%3EDesign Conference%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'cloud-native-summit',
    title: 'Cloud Native & DevOps Summit',
    date: 'Jan 20, 2026',
    dateObj: new Date('2026-01-20'),
    time: '9:00 AM - 6:00 PM',
    location: 'Enterprise Tech Center',
    category: 'Summit',
    description: 'Learn about cloud-native architectures, Kubernetes, containerization, and DevOps best practices from industry experts.',
    price: '$159',
    capacity: '600 / 600',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%230ea5e9" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="white" text-anchor="middle" dy=".3em" font-weight="bold"%3ECloud Native Summit%3C/text%3E%3C/svg%3E',
  },
];

// Current selected event
let selectedEvent = null;

// Helper function for API calls
async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(path, { method: 'POST', body: JSON.stringify(body), headers });
  return res.json();
}

// Initialize sample events
function initializeSampleEvents() {
  const eventsGrid = document.getElementById('events-grid');
  eventsGrid.innerHTML = '';

  sampleEvents.forEach(event => {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.onclick = () => openBookingModal(event);

    const capacity = event.capacity.split(' / ');
    const available = parseInt(capacity[0]);
    const total = parseInt(capacity[1]);
    const availableCount = total - available;

    eventCard.innerHTML = `
      <img src="${event.image}" alt="${event.title}" class="event-image" />
      <div class="event-card-content">
        <div class="event-date">${event.date}</div>
        <h3 class="event-title">${event.title}</h3>
        <div class="event-location">📍 ${event.location}</div>
        <div class="event-price">${event.price}</div>
      </div>
    `;

    eventsGrid.appendChild(eventCard);
  });
}

// Open booking modal
function openBookingModal(event) {
  selectedEvent = event;
  document.getElementById('modal-event-title').textContent = event.title;
  document.getElementById('modal-event-image').src = event.image;
  document.getElementById('modal-event-description').textContent = event.description;
  document.getElementById('modal-event-date').textContent = `${event.date} ${event.time}`;
  document.getElementById('modal-event-location').textContent = event.location;
  document.getElementById('modal-event-capacity').textContent = event.capacity;
  document.getElementById('modal-event-price').textContent = event.price;
  document.getElementById('book-user-id').value = '';
  document.getElementById('book-user-email').value = '';
  document.getElementById('book-user-phone').value = '';
  document.getElementById('book-quantity').value = 1;
  document.getElementById('book-result').textContent = '';

  document.getElementById('booking-modal').classList.add('active');
}

// Close modal
document.querySelector('.modal-close').addEventListener('click', () => {
  document.getElementById('booking-modal').classList.remove('active');
});

document.getElementById('booking-modal').addEventListener('click', (e) => {
  if (e.target.id === 'booking-modal') {
    document.getElementById('booking-modal').classList.remove('active');
  }
});

// Admin - Initialize Event
document.getElementById('init-btn').addEventListener('click', async () => {
  const eventId = document.getElementById('init-event-id').value;
  const tickets = Number(document.getElementById('init-tickets').value || 0);
  const basic = document.getElementById('init-basic').value || 'admin:password';

  if (!eventId || !tickets) {
    document.getElementById('init-result').textContent = 'Please fill in all fields';
    return;
  }

  try {
    const tokenRes = await fetch('/auth/token', {
      method: 'POST',
      headers: { Authorization: 'Basic ' + btoa(basic) }
    }).then(r => r.json());

    if (tokenRes.error) {
      document.getElementById('init-result').textContent = '❌ Authentication failed: ' + tokenRes.error;
      return;
    }

    if (!tokenRes.token) {
      document.getElementById('init-result').textContent = '❌ Authentication failed - no token received';
      return;
    }

    const token = tokenRes.token;
    const r = await post('/initialize', { eventId, tickets }, token);
    
    if (r.error) {
      document.getElementById('init-result').textContent = '❌ Error: ' + r.error;
    } else {
      document.getElementById('init-result').textContent = '✅ Event created successfully!\nEvent ID: ' + r.eventId + '\nTickets: ' + r.tickets;
      document.getElementById('status-event-id').value = eventId;
    }
  } catch (err) {
    document.getElementById('init-result').textContent = '❌ Error: ' + err.message;
  }
});

// Admin - Get Event Status
document.getElementById('status-btn').addEventListener('click', async () => {
  const eventId = document.getElementById('status-event-id').value;
  if (!eventId) {
    document.getElementById('status-result').textContent = 'Please enter an Event ID';
    return;
  }

  try {
    const r = await fetch('/status/' + encodeURIComponent(eventId)).then(r => r.json());
    
    if (r.error) {
      document.getElementById('status-result').textContent = 'Error: ' + r.error;
    } else {
      const statusText = `Event ID: ${r.eventId}
Total Tickets: ${r.total}
Available: ${r.available}
Booked: ${r.total - r.available}
Waiting List: ${r.waitingList}`;
      document.getElementById('status-result').textContent = statusText;
    }
  } catch (err) {
    document.getElementById('status-result').textContent = 'Error: ' + err.message;
  }
});

// Admin - Cancel Booking
document.getElementById('cancel-btn').addEventListener('click', async () => {
  const eventId = document.getElementById('cancel-event-id').value;
  const userId = document.getElementById('cancel-user-id').value;
  const token = document.getElementById('cancel-token').value;

  if (!eventId || !userId || !token) {
    document.getElementById('cancel-result').textContent = 'Please fill in all fields';
    return;
  }

  try {
    const r = await post('/cancel', { eventId, userId }, token);
    
    if (r.error) {
      document.getElementById('cancel-result').textContent = '❌ Error: ' + r.error;
    } else if (r.reassignedTo) {
      document.getElementById('cancel-result').textContent = '✅ Booking cancelled. Ticket reassigned to: ' + r.reassignedTo;
    } else {
      document.getElementById('cancel-result').textContent = '✅ Booking cancelled successfully';
    }
  } catch (err) {
    document.getElementById('cancel-result').textContent = '❌ Error: ' + err.message;
  }
});

// User - Book Ticket
document.getElementById('book-btn').addEventListener('click', async () => {
  const userId = document.getElementById('book-user-id').value;
  const email = document.getElementById('book-user-email').value;
  const phone = document.getElementById('book-user-phone').value;
  const quantity = Number(document.getElementById('book-quantity').value || 1);

  if (!userId || !email || !selectedEvent) {
    document.getElementById('book-result').textContent = 'Please fill in all fields';
    return;
  }

  try {
    const fullUserId = `${userId}-${email}`;
    const r = await post('/book', {
      eventId: selectedEvent.id,
      userId: fullUserId
    });

    if (r.assigned) {
      document.getElementById('book-result').textContent = '✅ Booking successful! Ticket assigned.';
      setTimeout(() => {
        document.getElementById('booking-modal').classList.remove('active');
      }, 1500);
    } else if (r.assigned === false) {
      document.getElementById('book-result').textContent = '⏳ Added to waiting list. You\'ll be notified when a ticket becomes available.';
    } else {
      document.getElementById('book-result').textContent = '❌ ' + (r.error || r.message || 'Booking failed');
    }
  } catch (err) {
    document.getElementById('book-result').textContent = '❌ Error: ' + err.message;
  }
});

// Search functionality
document.getElementById('search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

document.querySelector('.btn-search').addEventListener('click', performSearch);

function performSearch() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const eventsGrid = document.getElementById('events-grid');
  const filteredEvents = sampleEvents.filter(event =>
    event.title.toLowerCase().includes(query) ||
    event.location.toLowerCase().includes(query) ||
    event.category.toLowerCase().includes(query)
  );

  eventsGrid.innerHTML = '';
  if (filteredEvents.length === 0) {
    eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No events found matching your search.</p>';
    return;
  }

  filteredEvents.forEach(event => {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.onclick = () => openBookingModal(event);

    eventCard.innerHTML = `
      <img src="${event.image}" alt="${event.title}" class="event-image" />
      <div class="event-card-content">
        <div class="event-date">${event.date}</div>
        <h3 class="event-title">${event.title}</h3>
        <div class="event-location">📍 ${event.location}</div>
        <div class="event-price">${event.price}</div>
      </div>
    `;

    eventsGrid.appendChild(eventCard);
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeSampleEvents();
});
