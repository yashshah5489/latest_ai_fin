# Smart AI Financial Analyzer

An India-focused AI financial analyzer with dark theme, simplified interface, and comprehensive API functionality.

## Features

- **AI Financial Advisor**: Get personalized financial advice powered by GROQ language model
- **Document Analysis**: Upload and analyze financial documents (PDF, Excel, CSV)
- **Investment Tracking**: Monitor your investment portfolio with Indian market context
- **Risk Analysis**: Evaluate your risk tolerance and get tailored asset allocation recommendations
- **Financial News**: Stay updated with India-focused financial news via Tavily API

## Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping
- **Langchain + GROQ**: For AI capabilities and financial analysis
- **Tavily**: For retrieving financial news and market data
- **PyPDF**: For PDF document processing and analysis

### Frontend
- **Jinja2 Templates**: Server-side templating with FastAPI
- **Bootstrap 5**: Responsive UI framework
- **Chart.js**: Interactive financial charts and visualizations
- **FontAwesome**: Beautiful icons for enhanced UI

## Project Structure

```
├── api/                  # API endpoints and routers
├── backend/
│   ├── core/             # Application configuration
│   ├── models/           # Database models
│   └── services/         # Business logic services
├── frontend/
│   ├── static/           # Static assets (CSS, JS, images)
│   └── templates/        # Jinja2 HTML templates
├── app.py                # Main application entry point
├── run.py                # Script to run the application
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Python 3.10 or later
- PostgreSQL or SQLite (configurable)
- GROQ API key (for AI capabilities)
- Tavily API key (for financial news)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/smart-ai-financial-analyzer.git
   cd smart-ai-financial-analyzer
   ```

2. Install dependencies
   ```
   pip install -r requirements.txt
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   # Edit .env file with your GROQ and Tavily API keys
   ```

4. Run the application
   ```
   python run.py
   ```

5. Access the application
   Open your browser and navigate to `http://localhost:8000`

## API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Integration with Node.js Application

This Python application is designed to coexist with a Node.js Express application running on port 5000. It provides AI and data processing capabilities while preserving the original Node.js functionality.

## License

This project is licensed under the MIT License - see the LICENSE file for details.