/**
 * Main JavaScript file for Smart AI Financial Analyzer
 */

// Initialize tooltips and popovers
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === "#") return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Chart.js global setup for dark theme
    if(window.Chart) {
        Chart.defaults.color = '#AAAAAA';
        Chart.defaults.borderColor = '#2D2D2D';
        
        // Custom color scheme for charts
        Chart.defaults.plugins.legend.labels.color = '#F5F5F5';
        Chart.defaults.plugins.tooltip.backgroundColor = '#1E1E1E';
        Chart.defaults.plugins.tooltip.titleColor = '#F5F5F5';
        Chart.defaults.plugins.tooltip.bodyColor = '#F5F5F5';
        Chart.defaults.plugins.tooltip.borderColor = '#2D2D2D';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
    }
    
    // Initialize various page-specific components
    initializeDashboard();
    initializeInvestments();
    initializeRiskAnalysis();
    initializeAIChat();
    initializeDocuments();
});

/**
 * Initialize Dashboard page elements
 */
function initializeDashboard() {
    // Return if not on dashboard page
    if (!document.getElementById('dashboard-overview')) return;
    
    // Portfolio Distribution Chart
    const portfolioCtx = document.getElementById('portfolio-distribution-chart');
    if (portfolioCtx) {
        new Chart(portfolioCtx, {
            type: 'doughnut',
            data: {
                labels: ['Equity', 'Fixed Income', 'Gold', 'Cash'],
                datasets: [{
                    data: [60, 25, 10, 5],
                    backgroundColor: [
                        '#2D81FF', // Primary blue
                        '#6D35E3', // Secondary purple
                        '#FF9A3C', // Accent orange
                        '#4CAF50'  // Success green
                    ],
                    borderWidth: 2,
                    borderColor: '#121212'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Monthly Income/Expense Chart
    const incomeExpenseCtx = document.getElementById('income-expense-chart');
    if (incomeExpenseCtx) {
        new Chart(incomeExpenseCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Income',
                        data: [120000, 118000, 125000, 123000, 128000, 130000],
                        backgroundColor: '#4CAF50',
                        borderColor: '#4CAF50',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: [95000, 98000, 94000, 96000, 97000, 93000],
                        backgroundColor: '#F44336',
                        borderColor: '#F44336',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(45, 45, 45, 0.5)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(45, 45, 45, 0.5)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
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
    // Return if not on investments page
    if (!document.getElementById('investments-overview')) return;
    
    // Investment Growth Chart
    const growthCtx = document.getElementById('investment-growth-chart');
    if (growthCtx) {
        new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Portfolio Value',
                        data: [600000, 630000, 620000, 670000, 690000, 710000, 740000, 760000, 790000, 810000, 850000, 890000],
                        borderColor: '#2D81FF',
                        backgroundColor: 'rgba(45, 129, 255, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Benchmark (Nifty 50)',
                        data: [600000, 610000, 615000, 640000, 655000, 670000, 690000, 705000, 730000, 750000, 780000, 800000],
                        borderColor: '#6D35E3',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(45, 45, 45, 0.5)'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(45, 45, 45, 0.5)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Investment Returns Chart
    const returnsCtx = document.getElementById('investment-returns-chart');
    if (returnsCtx) {
        new Chart(returnsCtx, {
            type: 'bar',
            data: {
                labels: ['Equity MF', 'Stocks', 'Bonds', 'Gold ETF', 'PPF', 'Bank FD'],
                datasets: [
                    {
                        label: 'Annual Returns (%)',
                        data: [12.5, 15.2, 6.8, 8.1, 7.1, 4.5],
                        backgroundColor: [
                            '#2D81FF', 
                            '#4CAF50', 
                            '#6D35E3', 
                            '#FF9A3C', 
                            '#2196F3', 
                            '#FFC107'
                        ],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(45, 45, 45, 0.5)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(45, 45, 45, 0.5)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Handle file upload preview
    const fileUpload = document.getElementById('investment-file');
    const fileLabel = document.querySelector('.custom-file-label');
    
    if(fileUpload && fileLabel) {
        fileUpload.addEventListener('change', function() {
            const fileName = this.files[0] ? this.files[0].name : 'Choose file';
            fileLabel.textContent = fileName;
        });
    }
}

/**
 * Initialize Risk Analysis page elements
 */
function initializeRiskAnalysis() {
    // Return if not on risk analysis page
    if (!document.getElementById('risk-analysis-form')) return;
    
    // Update risk visualization based on form values
    function updateRiskVisualization() {
        const riskTolerance = document.getElementById('risk-tolerance').value;
        const riskScore = calculateRiskScore();
        const riskMeter = document.getElementById('risk-meter-marker');
        
        if(riskMeter) {
            // Position the marker (0-100%)
            const position = (riskScore / 100) * 100;
            riskMeter.style.left = `${position}%`;
            
            // Update risk category text
            const riskCategory = document.getElementById('risk-category');
            if(riskCategory) {
                let category = '';
                let color = '';
                
                if(riskScore < 30) {
                    category = 'Conservative';
                    color = '#4CAF50'; // Green
                } else if(riskScore < 50) {
                    category = 'Moderately Conservative';
                    color = '#8BC34A'; // Light Green
                } else if(riskScore < 70) {
                    category = 'Moderate';
                    color = '#FFC107'; // Yellow
                } else if(riskScore < 85) {
                    category = 'Moderately Aggressive';
                    color = '#FF9800'; // Orange
                } else {
                    category = 'Aggressive';
                    color = '#F44336'; // Red
                }
                
                riskCategory.textContent = category;
                riskCategory.style.color = color;
            }
        }
    }
    
    // Calculate risk score based on form values
    function calculateRiskScore() {
        const age = parseInt(document.getElementById('age').value) || 35;
        const investmentHorizon = parseInt(document.getElementById('investment-horizon').value) || 5;
        const riskTolerance = parseInt(document.getElementById('risk-tolerance').value) || 5;
        const emergencyFund = parseInt(document.getElementById('emergency-fund').value) || 3;
        const incomeStability = parseInt(document.getElementById('income-stability').value) || 5;
        
        // Simple weighted calculation for risk score (0-100)
        // Age: younger = higher score
        const ageScore = Math.max(0, 100 - (age * 1.5));
        
        // Investment Horizon: longer = higher score
        const horizonScore = Math.min(100, investmentHorizon * 10);
        
        // Risk Tolerance: direct mapping (1-10) -> (10-100)
        const toleranceScore = riskTolerance * 10;
        
        // Emergency Fund: more months = higher score
        const emergencyScore = Math.min(100, emergencyFund * 15);
        
        // Income Stability: more stable = higher score
        const stabilityScore = incomeStability * 10;
        
        // Weighted average
        const weightedScore = (
            (ageScore * 0.2) +
            (horizonScore * 0.25) +
            (toleranceScore * 0.3) +
            (emergencyScore * 0.15) +
            (stabilityScore * 0.1)
        );
        
        return Math.round(weightedScore);
    }
    
    // Setup event listeners for form inputs
    const formInputs = document.querySelectorAll('#risk-analysis-form input, #risk-analysis-form select');
    formInputs.forEach(input => {
        input.addEventListener('change', updateRiskVisualization);
        input.addEventListener('input', updateRiskVisualization);
    });
    
    // Initialize visualization
    updateRiskVisualization();
    
    // Handle form submission
    const form = document.getElementById('risk-analysis-form');
    if(form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analyzing...';
            submitBtn.disabled = true;
            
            // Gather form data
            const formData = {
                age: parseInt(document.getElementById('age').value),
                investmentHorizon: parseInt(document.getElementById('investment-horizon').value),
                riskTolerance: parseInt(document.getElementById('risk-tolerance').value),
                emergencyFund: parseInt(document.getElementById('emergency-fund').value),
                incomeStability: parseInt(document.getElementById('income-stability').value)
            };
            
            // Submit to API
            fetch('/api/v1/risk/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Show results section
                document.getElementById('risk-analysis-form-container').classList.add('d-none');
                document.getElementById('risk-analysis-results').classList.remove('d-none');
                
                // Update results UI
                document.getElementById('result-risk-score').textContent = data.riskScore;
                document.getElementById('result-risk-category').textContent = data.riskCategory;
                
                // Update asset allocation chart
                const allocationCtx = document.getElementById('asset-allocation-chart');
                if(allocationCtx && data.assetAllocation) {
                    new Chart(allocationCtx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Equities', 'Fixed Income', 'Gold', 'Cash'],
                            datasets: [{
                                data: [
                                    data.assetAllocation.equities,
                                    data.assetAllocation.fixedIncome,
                                    data.assetAllocation.gold,
                                    data.assetAllocation.cash
                                ],
                                backgroundColor: [
                                    '#2D81FF', // Primary blue
                                    '#6D35E3', // Secondary purple
                                    '#FF9A3C', // Accent orange
                                    '#4CAF50'  // Success green
                                ],
                                borderWidth: 2,
                                borderColor: '#121212'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom'
                                }
                            }
                        }
                    });
                }
                
                // Update recommendations
                const recommendationsList = document.getElementById('recommendations-list');
                if(recommendationsList && data.recommendations) {
                    recommendationsList.innerHTML = '';
                    data.recommendations.forEach(recommendation => {
                        const li = document.createElement('li');
                        li.className = 'list-group-item';
                        li.textContent = recommendation;
                        recommendationsList.appendChild(li);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during risk analysis. Please try again.');
            })
            .finally(() => {
                // Restore button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
    
    // Handle "try again" button
    const tryAgainBtn = document.getElementById('try-again-button');
    if(tryAgainBtn) {
        tryAgainBtn.addEventListener('click', function() {
            document.getElementById('risk-analysis-form-container').classList.remove('d-none');
            document.getElementById('risk-analysis-results').classList.add('d-none');
        });
    }
}

/**
 * Initialize AI Chat interface
 */
function initializeAIChat() {
    // Return if not on AI chat page
    if (!document.getElementById('chat-container')) return;
    
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if(chatForm && chatInput && chatMessages) {
        chatForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const message = chatInput.value.trim();
            if(!message) return;
            
            // Clear input
            chatInput.value = '';
            
            // Add user message to chat
            addMessage('user', message);
            
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator message assistant';
            typingIndicator.innerHTML = '<span></span><span></span><span></span>';
            chatMessages.appendChild(typingIndicator);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Send message to API
            fetch('/api/v1/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Remove typing indicator
                chatMessages.removeChild(typingIndicator);
                
                // Add AI response
                addMessage('assistant', data.response);
            })
            .catch(error => {
                console.error('Error:', error);
                
                // Remove typing indicator
                chatMessages.removeChild(typingIndicator);
                
                // Add error message
                addMessage('assistant', 'Sorry, I encountered an error. Please try again later.');
            });
        });
        
        // Helper function to add a message to the chat
        function addMessage(role, content) {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${role}`;
            
            // Format links in message
            const formattedContent = content.replace(
                /(https?:\/\/[^\s]+)/g, 
                '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
            );
            
            messageEl.innerHTML = formattedContent;
            chatMessages.appendChild(messageEl);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
}

/**
 * Initialize Documents page elements
 */
function initializeDocuments() {
    // Return if not on documents page
    if (!document.getElementById('documents-container')) return;
    
    // Handle file upload preview
    const fileUpload = document.getElementById('document-file');
    const fileLabel = document.querySelector('.custom-file-label');
    
    if(fileUpload && fileLabel) {
        fileUpload.addEventListener('change', function() {
            const fileName = this.files[0] ? this.files[0].name : 'Choose file';
            fileLabel.textContent = fileName;
        });
    }
    
    // Handle document upload form
    const uploadForm = document.getElementById('document-upload-form');
    if(uploadForm) {
        uploadForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Check if file is selected
            if(fileUpload.files.length === 0) {
                alert('Please select a file to upload');
                return;
            }
            
            // Show loading state
            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...';
            submitBtn.disabled = true;
            
            // Prepare form data
            const formData = new FormData();
            formData.append('file', fileUpload.files[0]);
            
            // Upload file
            fetch('/api/v1/documents/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Show success message
                alert('Document uploaded successfully. It will be analyzed in the background.');
                
                // Reset form
                uploadForm.reset();
                fileLabel.textContent = 'Choose file';
                
                // Refresh document list
                location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during document upload. Please try again.');
            })
            .finally(() => {
                // Restore button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
}