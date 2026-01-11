# Data Anonymization System - Backend API

## Installation

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Create a `.env` file in the backend directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the FastAPI server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Endpoints

- `POST /api/datasets/upload` - Upload Excel/CSV dataset
- `GET /api/datasets` - Get all user datasets
- `GET /api/datasets/{id}` - Get specific dataset
- `POST /api/configs` - Create anonymization configuration
- `GET /api/configs` - Get all configurations
- `POST /api/process` - Process anonymization
- `GET /api/results` - Get all results
- `GET /api/results/{id}` - Get specific result
- `GET /api/stats` - Get user statistics

## Implemented Techniques

1. **K-Anonymity** - Ensures each record is indistinguishable from at least k-1 others
2. **L-Diversity** - Ensures diversity of sensitive attributes
3. **T-Closeness** - Maintains distribution of sensitive attributes
4. **Differential Privacy** - Adds calibrated noise to protect individual privacy
5. **Generalization** - Replaces specific values with broader categories
6. **Suppression** - Masks or removes sensitive values
