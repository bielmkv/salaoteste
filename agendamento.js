

const availableTimesPerDay = {
  sunday: [],
  monday: ['09:00','10:00','11:00','14:00','15:00'],
  tuesday: ['09:00','10:00','11:00','14:00','15:00'],
  wednesday: ['09:00','10:00','11:00','14:00','15:00'],
  thursday: ['09:00','10:00','11:00','14:00','15:00'],
  friday: ['09:00','10:00','11:00','14:00','15:00'],
  saturday: ['10:00','11:00','14:00','15:00'],
};

const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

let selectedService = '';
let selectedDate = '';
let selectedTime = '';

document.addEventListener('DOMContentLoaded', () => {

  // CALENDÁRIO
  flatpickr("#date", {
    dateFormat: "Y-m-d",
    minDate: "today",
    maxDate: new Date().fp_incr(30),
    disable: [date => date.getDay() === 0],
    locale: "pt",
    onChange: async (_, dateStr) => {
      selectedDate = dateStr;
      await loadTimes(dateStr);
    }
  });

  // SERVIÇOS
  document.querySelectorAll('.service-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.service-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedService = btn.dataset.service;
    });
  });

  // NAVEGAÇÃO
  document.querySelectorAll('.btn-next').forEach(btn =>
    btn.addEventListener('click', nextStep)
  );

  document.querySelectorAll('.btn-back').forEach(btn =>
    btn.addEventListener('click', prevStep)
  );

  document.querySelector('.btn-confirm').addEventListener('click', confirmAppointment);
});

async function loadTimes(date) {
  const grid = document.getElementById('timeGrid');
  grid.innerHTML = '';
  selectedTime = '';

  const booked = await getBookedTimes(date);
  const day = days[new Date(date).getDay()];
  const available = availableTimesPerDay[day] || [];

  available.forEach(time => {
    if (!booked[time]) {
      const btn = document.createElement('button');
      btn.className = 'time-btn';
      btn.textContent = time;

      btn.onclick = () => {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTime = time;
      };

      grid.appendChild(btn);
    }
  });
}

function nextStep() {
  const current = document.querySelector('.step-content.active');
  const step = Number(current.id.split('-')[1]);

  if (step === 1 && !selectedService) return alert('Selecione um serviço');
  if (step === 2 && (!selectedDate || !selectedTime)) return alert('Selecione data e horário');

  current.classList.remove('active');
  document.getElementById(`step-${step+1}`).classList.add('active');
  document.getElementById(`step-indicator-${step+1}`).classList.add('active');

  if (step + 1 === 3) {
    resumeService.textContent = selectedService;
    resumeDate.textContent = new Date(selectedDate).toLocaleDateString('pt-BR');
    resumeTime.textContent = selectedTime;
  }
}

function prevStep() {
  const current = document.querySelector('.step-content.active');
  const step = Number(current.id.split('-')[1]);

  current.classList.remove('active');
  document.getElementById(`step-${step-1}`).classList.add('active');
}

async function confirmAppointment() {
  const name = nameInput.value = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const notes = document.getElementById('notes').value;

  if (!name || !phone || !email) return alert('Preencha os campos');

  await saveAppointment(selectedDate, selectedTime, {
    name, phone, email, notes, service: selectedService
  });

  const msg =
`✨ NOVO AGENDAMENTO ✨
👤 ${name}
📅 ${new Date(selectedDate).toLocaleDateString('pt-BR')}
⏰ ${selectedTime}
💅 ${selectedService}`;

  window.open(`https://wa.me/5513997305044?text=${encodeURIComponent(msg)}`, '_blank');
  location.reload();
}
