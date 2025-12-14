
document.addEventListener('DOMContentLoaded', function() {
    const donationForm = document.getElementById('donationForm');
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    const thankYouModal = new bootstrap.Modal(document.getElementById('thankYouModal'));

    donationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const donorName = document.getElementById('donorName').value.trim();
        const donorEmail = document.getElementById('donorEmail').value.trim();
        const donorPhone = document.getElementById('donorPhone').value.trim();
        const donationAmount = document.getElementById('donationAmount').value;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        const donorNotes = document.getElementById('donorNotes').value.trim();

        if (!paymentMethod) {
            alert('Please select a payment method.');
            return;
        }

        if (parseFloat(donationAmount) < 1000) {
            alert('Minimum donation amount is 1,000 MMK.');
            return;
        }

        document.getElementById('confirmName').textContent = donorName;
        document.getElementById('confirmEmail').textContent = donorEmail;
        document.getElementById('confirmPhone').textContent = donorPhone;
        document.getElementById('confirmAmount').textContent = formatCurrency(donationAmount) + ' MMK';
        document.getElementById('confirmPayment').textContent = paymentMethod.value;

        if (donorNotes) {
            document.getElementById('confirmNotes').textContent = donorNotes;
            document.getElementById('confirmNotesRow').style.display = 'flex';
        } else {
            document.getElementById('confirmNotesRow').style.display = 'none';
        }

        confirmationModal.show();
    });

    document.getElementById('confirmDonateBtn').addEventListener('click', function() {
        confirmationModal.hide();

        donationForm.reset();
        setTimeout(function() {
            thankYouModal.show();
        }, 300);
    });

    document.getElementById('thankYouModal').addEventListener('hidden.bs.modal', function() {
        donationForm.reset();
    });

    function formatCurrency(amount) {
        return parseFloat(amount).toLocaleString('en-US');
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#donate-form') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});





