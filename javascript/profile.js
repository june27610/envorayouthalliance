
document.addEventListener('DOMContentLoaded', function() {

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('envoraCurrentUser') || 'null');
        } catch(e) {
            return null;
        }
    }
    
    function getGamificationData() {
        try {
            return JSON.parse(localStorage.getItem('envoraGamification') || '{"coins":0,"badges":[],"completedQuizzes":[],"completedChallenges":[]}');
        } catch(e) {
            return {coins: 0, badges: [], completedQuizzes: [], completedChallenges: []};
        }
    }
    

    const user = getCurrentUser();
    const gamification = getGamificationData();
    
    if (user) {

        document.getElementById('profileName').textContent = user.fullname || user.username || 'User';
        document.getElementById('profileEmail').textContent = user.email || 'No email';
        
        if (user.joinDate) {
            const joinDate = new Date(user.joinDate);
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            const formattedDate = `Member since ${monthNames[joinDate.getMonth()]} ${joinDate.getFullYear()}`;
            document.getElementById('profileJoinDate').textContent = formattedDate;
        }
        
        // Update stats from gamification
        document.querySelector('.stat-item .stat-value').textContent = (gamification.coins || 0).toLocaleString();
        const badgesCount = (gamification.badges || []).length;
        document.querySelectorAll('.stat-item .stat-value')[1].textContent = badgesCount;
        
        // Calculate progress
        const totalQuizzes = 9;
        const totalChallenges = 6;
        const completedQuizzes = (gamification.completedQuizzes || []).length;
        const completedChallenges = (gamification.completedChallenges || []).length;
        const totalCompleted = completedQuizzes + completedChallenges;
        const totalPossible = totalQuizzes + totalChallenges;
        const progress = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        document.querySelectorAll('.stat-item .stat-value')[2].textContent = progress + '%';
        
        // Update form fields
        document.getElementById('fullName').value = user.fullname || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('bio').value = user.bio || '';
    }
    
    let goalIdCounter = 4; 

    // Add new goal
    document.getElementById('addGoalBtn')?.addEventListener('click', function() {
        const goalsList = document.getElementById('goalsList');
        const newGoal = createGoalItem(goalIdCounter++, 'New Goal', 'Target: December 2025');
        goalsList.appendChild(newGoal);
        saveGoals();
    });

    // Delete goal
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-delete')) {
            const goalItem = e.target.closest('.goal-item');
            if (confirm('Are you sure you want to delete this goal?')) {
                goalItem.remove();
                saveGoals();
            }
        }
    });

    // Save profile changes
    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const bio = document.getElementById('bio').value;

            if (!fullName || !email) {
                alert('Please fill in at least Full Name and Email.');
                return;
            }

            // Update current user
            if (user) {
                user.fullname = fullName;
                user.email = email;
                user.phone = phone;
                user.bio = bio;
                localStorage.setItem('envoraCurrentUser', JSON.stringify(user));
                
                // Update in users array
                const users = JSON.parse(localStorage.getItem('envoraUsers') || '[]');
                const userIndex = users.findIndex(u => u.email === user.email);
                if (userIndex !== -1) {
                    users[userIndex] = { ...users[userIndex], ...user };
                    localStorage.setItem('envoraUsers', JSON.stringify(users));
                }
            }

            // Update profile header
            document.getElementById('profileName').textContent = fullName;
            document.getElementById('profileEmail').textContent = email;

            alert('Profile updated successfully!');
        });
    });

    // Create goal item element
    function createGoalItem(id, text, date) {
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        goalItem.innerHTML = `
            <div class="goal-content">
                <input type="text" class="goal-input" value="${text}" data-goal-id="${id}">
            </div>
            <div class="goal-actions">
                <button class="btn-icon" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn-icon btn-delete" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        return goalItem;
    }
    
    function saveGoals() {
        const goals = [];
        document.querySelectorAll('.goal-item').forEach(item => {
            const input = item.querySelector('.goal-input');
            goals.push({
                id: input.dataset.goalId,
                text: input.value,
            });
        });
        localStorage.setItem('userGoals', JSON.stringify(goals));
    }

    // Auto-save goals when edited
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('goal-input')) {
            saveGoals();
        }
    });

    // Load saved goals on page load
    const savedGoals = localStorage.getItem('userGoals');
    if (savedGoals) {
        try {
            const goals = JSON.parse(savedGoals);
            const goalsList = document.getElementById('goalsList');
            goalsList.innerHTML = '';
            goals.forEach(goal => {
                const goalItem = createGoalItem(goal.id, goal.text, goal.date);
                goalsList.appendChild(goalItem);
            });
            if (goals.length > 0) {
                goalIdCounter = Math.max(...goals.map(g => parseInt(g.id))) + 1;
            }
        } catch (e) {
            console.error('Error loading goals:', e);
        }
    }
});
