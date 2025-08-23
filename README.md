# PayPal NVP Activity Viewer

A minimal FastAPI web app to view PayPal account activity using the Classic NVP API (`TransactionSearch`). Credentials are read from environment variables and never exposed to the client.

## Prerequisites
- Python 3.10+

## Setup
1. Clone or open this project.
2. Create and populate your `.env` from the example:
   ```bash
   cp .env.example .env
   # Fill in PAYPAL_USER, PAYPAL_PWD, PAYPAL_SIGNATURE
   # Set PAYPAL_MODE to sandbox or live
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Run
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Then open `http://localhost:8000` in your browser.

## Usage
- Enter a start and end date (UTC) and optionally filter by payer email or transaction ID.
- The app calls PayPal's `TransactionSearch` and displays results in a table.
- A JSON API is also available at `/api/activity` with the same query parameters.

## Environment Variables
- `PAYPAL_USER` — API username
- `PAYPAL_PWD` — API password
- `PAYPAL_SIGNATURE` — API signature
- `PAYPAL_MODE` — `sandbox` or `live` (default: `sandbox`)
- `PAYPAL_API_VERSION` — NVP version (default: `204`)

## Notes
- This app does not log your credentials.
- For production, serve behind a reverse proxy and disable `--reload`. 