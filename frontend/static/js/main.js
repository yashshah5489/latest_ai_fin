/**
 * Smart AI Financial Analyzer - Main JavaScript File
 * 
 * This file contains common JavaScript functionality used across the application.
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeCommon();
    
    // Initialize page-specific functions based on current page
    const currentPath = window.location.pathname;
    
    if (currentPath === '/dashboard' || currentPath === '/dashboard/') {
        initializeDashboard();
    } else if (currentPath === '/investments' || currentPath === '/investments/') {
        initializeInvestments();
    } else if (currentPath === '/risk-analysis' || currentPath === '/risk-analysis/') {
        initializeRiskAnalysis();
    } else if (currentPath === '/ai-advisor' || currentPath === '/ai-advisor/') {
        initializeAIChat();
    } else if (currentPath === '/documents' || currentPath === '/documents/') {
        initializeDocuments();
    }
});

/**
 * Initialize common elements and functionality
 */
function initializeCommon() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Bootstrap popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    popoverTriggerList.forEach(popoverTriggerEl => {
        new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Handle sidebar toggle on mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    // Format currency values
    formatCurrency();
}

/**
 * Format currency values with Indian Rupee symbol and formatting
 */
function formatCurrency() {
    const currencyElements = document.querySelectorAll('.format-currency');
    
    currencyElements.forEach(element => {
        const value = parseFloat(element.textContent);
        if (!isNaN(value)) {
            // Format with Indian Rupee (₹) and Indian number formatting (e.g., 1,23,456.78)
            element.textContent = formatIndianRupee(value);
        }
    });
}

/**
 * Format a number as Indian Rupee
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount with ₹ symbol
 */
function formatIndianRupee(amount) {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    
    return formatter.format(amount);
}

/**
 * Format a number as percentage
 * @param {number} value - Value to format (e.g., 0.25 for 25%)
 * @returns {string} Formatted percentage with % symbol
 */
function formatPercentage(value) {
    return (value * 100).toFixed(2) + '%';
}

/**
 * Initialize Dashboard page elements
 */
function initializeDashboard() {
    console.log('Dashboard page initialized');
    
    // Financial summary charts
    const portfolioChartElement = document.getElementById('portfolioGrowthChart');
    if (portfolioChartElement) {
        const ctx = portfolioChartElement.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Portfolio Value',
                    data: [120000, 122000, 125000, 123000, 128000, 132000, 135000, 134000, 138000, 142000, 145000, 150000],
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '₹ ' + context.raw.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#d1d5db'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '₹ ' + value.toLocaleString('en-IN');
                            },
                            color: '#d1d5db'
                        },
                        grid: {
                            color: 'rgba(209, 213, 219, 0.1)'
                        }
                    }
                }
            }
        });
    }
}

/**
 * Initialize Investments page elements
 */
function initializeInvestments() {
    console.log('Investments page initialized');
}

/**
 * Initialize Risk Analysis page elements
 */
function initializeRiskAnalysis() {
    console.log('Risk Analysis page initialized');
    
    const riskToleranceSlider = document.getElementById('risk_tolerance');
    const riskToleranceValue = document.getElementById('riskToleranceValue');
    
    if (riskToleranceSlider && riskToleranceValue) {
        riskToleranceSlider.addEventListener('input', function() {
            updateRiskVisualization();
        });
        
        // Initialize with default value
        updateRiskVisualization();
    }
    
    function updateRiskVisualization() {
        const value = riskToleranceSlider.value;
        let riskLabel = '';
        
        if (value <= 3) {
            riskLabel = 'Conservative';
        } else if (value <= 6) {
            riskLabel = 'Moderate';
        } else {
            riskLabel = 'Aggressive';
        }
        
        riskToleranceValue.textContent = `${riskLabel} (${value})`;
    }
    
    // Risk score calculation
    const riskForm = document.getElementById('riskForm');
    
    if (riskForm) {
        riskForm.addEventListener('submit', function(event) {
            calculateRiskScore();
        });
    }
    
    function calculateRiskScore() {
        // This function would calculate and display the risk score based on inputs
        // For demonstration purposes only - actual calculation would be done server-side
        console.log('Risk score calculated');
    }
}

/**
 * Initialize AI Chat interface
 */
function initializeAIChat() {
    console.log('AI Chat initialized');
    
    const chatForm = document.getElementById('chatForm');
    const userMessageInput = document.getElementById('userMessage');
    const chatMessages = document.getElementById('chatMessages');
    
    if (chatForm && userMessageInput && chatMessages) {
        // Scroll to bottom of chat container
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Handle form submission
        chatForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const userMessage = userMessageInput.value.trim();
            if (!userMessage) return;
            
            // Add user message to chat
            addMessage('user', userMessage);
            
            // Clear input
            userMessageInput.value = '';
            
            // In a real implementation, this would send the message to the server
            // and receive a response from the AI. For demonstration, we'll simulate
            // a response after a brief delay.
            
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = `
                <div class="message-avatar">
                    <i class="bi bi-robot"></i>
                </div>
                <div class="message-content">
                    <div class="d-flex align-items-center px-2">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            `;
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Simulate AI response after delay
            setTimeout(() => {
                // Remove typing indicator
                typingIndicator.remove();
                
                // Sample response - in a real app, this would come from the server
                const aiResponse = "I'd be happy to help you with your financial questions. Please note that this is just a demonstration, and in the actual application, responses would be powered by our AI financial advisor.";
                
                // Add AI response
                addMessage('assistant', aiResponse);
            }, 1500);
        });
        
        function addMessage(role, content) {
            const messageElement = document.createElement('div');
            messageElement.className = `chat-message ${role}`;
            
            const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            messageElement.innerHTML = `
                <div class="message-avatar">
                    <i class="bi bi-${role === 'user' ? 'person-circle' : 'robot'}"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">
                        <p>${content}</p>
                    </div>
                    <div class="message-time">${currentTime}</div>
                </div>
            `;
            
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
}

/**
 * Initialize Documents page elements
 */
function initializeDocuments() {
    console.log('Documents page initialized');
    
    // File input preview functionality
    const fileInput = document.getElementById('documentFile');
    const preview = document.getElementById('documentPreview');
    
    if (fileInput && preview) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const previewName = preview.querySelector('.preview-name');
                const previewSize = preview.querySelector('.preview-size');
                const previewIcon = preview.querySelector('.preview-icon');
                
                if (previewName && previewSize && previewIcon) {
                    preview.classList.remove('d-none');
                    previewName.textContent = file.name;
                    previewSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
                    
                    // Set the icon based on file type
                    if (file.type.includes('pdf')) {
                        previewIcon.className = 'bi bi-file-earmark-pdf fs-1 me-3 text-danger';
                    } else if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
                        previewIcon.className = 'bi bi-file-earmark-excel fs-1 me-3 text-success';
                    } else if (file.type.includes('word') || file.type.includes('document')) {
                        previewIcon.className = 'bi bi-file-earmark-word fs-1 me-3 text-primary';
                    } else {
                        previewIcon.className = 'bi bi-file-earmark-text fs-1 me-3 text-secondary';
                    }
                }
            } else {
                preview.classList.add('d-none');
            }
        });
    }
}