class ParkingSystem {
    constructor() {
        this.slots = 20;
        this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        this.initializeSlots();
        this.setupEventListeners();
        this.renderBookings();
        // Initialize EmailJS with your public key
        emailjs.init("JdRepF3qg5_MGi7Z1");
    }

    initializeSlots() {
        const slotContainer = document.getElementById('slotContainer');
        slotContainer.innerHTML = '';

        for (let i = 1; i <= this.slots; i++) {
            const slot = document.createElement('div');
            slot.className = 'parking-slot available';
            slot.dataset.slot = i;
            slot.textContent = `Slot ${i}`;
            slot.addEventListener('click', () => this.selectSlot(slot));
            slotContainer.appendChild(slot);
        }

        this.updateSlotStatus();
    }

    selectSlot(slot) {
        if (slot.classList.contains('occupied')) return;

        document.querySelectorAll('.parking-slot').forEach(s => {
            s.classList.remove('selected');
        });
        slot.classList.add('selected');
    }

    updateSlotStatus() {
        const currentDate = new Date().toISOString().split('T')[0];
        const slots = document.querySelectorAll('.parking-slot');

        slots.forEach(slot => {
            slot.classList.remove('occupied');
            slot.classList.add('available');
        });

        this.bookings.forEach(booking => {
            if (booking.date === currentDate) {
                const slot = document.querySelector(`[data-slot="${booking.slotNumber}"]`);
                if (slot) {
                    slot.classList.remove('available');
                    slot.classList.add('occupied');
                }
            }
        });
    }

    setupEventListeners() {
        const form = document.getElementById('parkingForm');
        form.addEventListener('submit', (e) => this.handleBooking(e));
    }

    handleBooking(e) {
        e.preventDefault();

        const selectedSlot = document.querySelector('.parking-slot.selected');
        if (!selectedSlot) {
            alert('Please select a parking slot');
            return;
        }

        const booking = {
            id: Date.now(),
            vehicleNumber: document.getElementById('vehicleNumber').value,
            vehicleType: document.getElementById('vehicleType').value,
            date: document.getElementById('entryDate').value,
            time: document.getElementById('entryTime').value,
            duration: document.getElementById('duration').value,
            slotNumber: selectedSlot.dataset.slot
        };

        // Add email field to the form
        const userEmail = document.getElementById('userEmail').value;

        // Send email using EmailJS
        const emailParams = {
            to_email: userEmail,
            booking_id: booking.id,
            vehicle_number: booking.vehicleNumber,
            vehicle_type: booking.vehicleType,
            date: booking.date,
            time: booking.time,
            duration: booking.duration,
            slot_number: booking.slotNumber,
            total_amount: this.calculateAmount(booking.duration, booking.vehicleType)
        };

        emailjs.send("gaurav_service", "template_pj9oa1v", emailParams)
            .then(() => {
                this.bookings.push(booking);
                localStorage.setItem('bookings', JSON.stringify(this.bookings));
                this.updateSlotStatus();
                this.renderBookings();
                e.target.reset();
                selectedSlot.classList.remove('selected');
                alert('Booking successful! A confirmation email has been sent.');
            })
            .catch((error) => {
                console.error('Email sending failed:', error);
                alert('Booking successful but email sending failed. Please check your email address.');
            });
    }

    calculateAmount(duration, vehicleType) {
        const baseRates = {
            car: 50,
            bike: 30,
            truck: 80
        };
        return baseRates[vehicleType] * parseInt(duration);
    }

    renderBookings() {
        const bookingsList = document.getElementById('bookingsList');
        bookingsList.innerHTML = '';

        this.bookings.sort((a, b) => new Date(b.date) - new Date(a.date));

        this.bookings.forEach(booking => {
            const bookingItem = document.createElement('div');
            bookingItem.className = 'booking-item';
            bookingItem.innerHTML = `
                <h3>Booking #${booking.id}</h3>
                <div class="booking-details">
                    <p>Vehicle Number: ${booking.vehicleNumber}</p>
                    <p>Vehicle Type: ${booking.vehicleType}</p>
                    <p>Date: ${booking.date}</p>
                    <p>Time: ${booking.time}</p>
                    <p>Duration: ${booking.duration} hours</p>
                    <p>Slot Number: ${booking.slotNumber}</p>
                </div>
            `;
            bookingsList.appendChild(bookingItem);
        });
    }
}

// Initialize the parking system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ParkingSystem();
});