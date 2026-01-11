# Data Anonymization System

A comprehensive, public-access system for anonymizing sensitive data using advanced privacy-preserving techniques including K-Anonymity, L-Diversity, T-Closeness, and Differential Privacy.

## Features

- **Multiple Anonymization Techniques**
  - K-Anonymity: Ensure records are indistinguishable from k-1 others
  - L-Diversity: Maintain diversity in sensitive attributes
  - T-Closeness: Preserve distribution of sensitive attributes
  - Differential Privacy: Add calibrated noise for mathematical privacy guarantees
  - Generalization: Convert specific values to broader categories
  - Suppression: Hide or remove sensitive information

- **User-Friendly Interface**
  - Drag & drop file upload
  - Interactive 3-step configuration wizard
  - Real-time data preview
  - Detailed results with visual metrics
  - Comprehensive documentation
  - **No login required - fully public access**

- **Data Management**
  - Secure database storage with Supabase
  - LocalStorage for configuration persistence
  - Public shared data access
  - Audit logging for all operations

- **Analytics & Insights**
  - Detailed technique explanations
  - Information loss metrics
  - Before/after comparisons
  - Downloadable anonymized datasets

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Supabase for authentication and database
- Lucide React for icons

### Backend
- FastAPI (Python)
- Pandas for data processing
- NumPy for numerical operations
- Scikit-learn for algorithms

### Database
- Supabase (PostgreSQL)
- Row Level Security enabled
- JSONB for flexible data storage

## Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Supabase account

### 1. Clone and Setup Frontend

```bash
# Install dependencies
npm install

# Create .env file with your Supabase credentials
# (Already configured if using this template)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env .env

# Run the API server
python main.py
```

The API will run on `http://localhost:8000`

### 3. Run Frontend

```bash
# In the project root
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage Guide

### Step 1: Upload Dataset
- Navigate to "Upload Data"
- Drag and drop an Excel (.xlsx, .xls) or CSV file
- Maximum file size: 50MB
- Preview your data before proceeding

### Step 2: Configure Anonymization

#### Column Mapping
Classify each column:
- **Identifier**: Direct identifiers (ID, email, SSN) - will be removed
- **Quasi-Identifier**: Can identify when combined (age, zip code)
- **Sensitive**: Private information (salary, medical condition)
- **Non-Sensitive**: Public information

#### Select Techniques
Choose anonymization method for each column:
- **Generalization**: Convert exact values to ranges
- **Suppression**: Hide or mask values
- **Differential Privacy**: Add random noise
- **None**: Keep original values

#### Set Parameters
- **K Value**: Minimum group size (recommended: 5-10)
- **L Value**: Minimum diversity in sensitive attributes (recommended: 3-5)
- **T Value**: Distribution distance threshold (0.1-1.0)
- **Epsilon**: Privacy budget for differential privacy (0.1-10)

### Step 3: Process & Review Results
- Click "Process & View Results"
- Review detailed metrics:
  - K-Anonymity level achieved
  - L-Diversity score
  - Information loss percentage
  - Processing time
- See exactly what each technique did
- Download anonymized dataset

## Sample Dataset

A sample dataset is provided in `backend/sample_dataset.csv` with:
- 20 records
- 6 columns (id, name, age, zipcode, salary, medical_condition)
- Mix of identifiers, quasi-identifiers, and sensitive attributes

## API Endpoints

- `POST /api/datasets/upload` - Upload dataset
- `GET /api/datasets` - List all datasets
- `GET /api/datasets/{id}` - Get specific dataset
- `POST /api/configs` - Create configuration
- `GET /api/configs` - List configurations
- `POST /api/process` - Process anonymization
- `GET /api/results` - List results
- `GET /api/results/{id}` - Get specific result
- `GET /api/stats` - Get user statistics

API documentation available at `http://localhost:8000/docs`

## Architecture

### Data Flow
1. User uploads Excel/CSV file
2. File is validated and stored in Supabase
3. User configures anonymization parameters
4. Configuration is saved (database + localStorage)
5. Backend processes data with selected techniques
6. Results are stored with detailed metrics
7. User reviews results and downloads anonymized data

### Database Schema
- `datasets` - Uploaded data files
- `anonymization_configs` - User configurations
- `anonymization_results` - Processed results
- `audit_logs` - Operation logs

### Security Features
- Public access policies for ease of use
- Encrypted data at rest and in transit
- Shared data storage
- Audit logging
- LocalStorage for configuration persistence

## Privacy Techniques Explained

### K-Anonymity
Ensures each record is identical to at least k-1 others based on quasi-identifiers.

### L-Diversity
Ensures each group has at least L distinct values for sensitive attributes.

### T-Closeness
Maintains that the distribution of sensitive attributes in each group is close to the overall distribution.

### Differential Privacy
Adds calibrated random noise to provide mathematical privacy guarantees.

### Generalization
Replaces specific values with broader categories (e.g., age 28 → "25-30").

### Suppression
Hides or removes sensitive information completely.

## Legal Compliance

This system implements techniques recognized by major privacy regulations:
- **GDPR** (General Data Protection Regulation)
- **HIPAA** (Health Insurance Portability and Accountability Act)
- **CCPA** (California Consumer Privacy Act)

Note: While the system provides strong anonymization capabilities, compliance depends on your specific use case and parameters. Consult with a privacy expert for your particular requirements.

## Troubleshooting

### Backend Issues
- Make sure Python 3.9+ is installed
- Activate virtual environment before running
- Check that port 8000 is available
- Verify Supabase credentials in .env

### Frontend Issues
- Clear browser cache and localStorage
- Check that backend is running on port 8000
- Verify Supabase credentials in .env
- Run `npm install` to ensure all dependencies are installed

### CORS Errors
- Ensure backend is running
- Check that CORS is configured for localhost
- Verify API URLs in frontend code

## Contributing

This is a complete, production-ready system. Future enhancements could include:
- Additional anonymization techniques (bucketization, anatomization)
- Support for more file formats (JSON, Parquet)
- Batch processing of multiple files
- Advanced visualization and reporting
- API rate limiting
- Multi-language support

## License

MIT License

## Support

For issues or questions:
1. Check the Documentation page in the app
2. Review the FAQ section
3. Examine the detailed technique explanations
4. Check browser console for errors
5. Review backend logs for processing issues

## Acknowledgments

Built with modern privacy-preserving techniques based on academic research and industry best practices.
