document.addEventListener('DOMContentLoaded', function() {
    const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
    const navButtons = document.querySelector('.nav-buttons');
    
    if (navButtons && isSignedIn) {
        navButtons.innerHTML = `
            <a href="workspace.html" class="btn btn-workspace">Workspace</a>
        `;
    }
});

const style = document.createElement('style');
style.textContent = `
    .btn-workspace {
        background-color: #38ae60;
        color: #F4F1EC;
        border: 2px solid #38ae60;
        margin-left: 10px;
        font-weight: 400;
        border-radius: 25px;
        padding: 6px 18px;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
    }
    
    .btn-workspace:hover {
        background-color: transparent;
        color: #38ae60;
        transform: scale(1.05);
    }
    
    @media (max-width: 992px) {
        .btn-workspace {
            width: 100%;
            text-align: center;
            margin-left: 0 !important;
            margin-top: 10px;
        }
    }
`;
document.head.appendChild(style);

