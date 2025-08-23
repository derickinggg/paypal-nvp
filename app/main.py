from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Form, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import Field
from pydantic_settings import BaseSettings

from app.paypal_nvp import PayPalNVPClient


class Settings(BaseSettings):
    paypal_user: Optional[str] = Field(default=None, validation_alias="PAYPAL_USER")
    paypal_password: Optional[str] = Field(default=None, validation_alias="PAYPAL_PWD")
    paypal_signature: Optional[str] = Field(default=None, validation_alias="PAYPAL_SIGNATURE")
    paypal_mode: str = Field(default="sandbox", validation_alias="PAYPAL_MODE")
    paypal_version: str = Field(default="204", validation_alias="PAYPAL_API_VERSION")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

app = FastAPI(title="PayPal NVP Activity Viewer")

# Static directory placeholder if needed later
app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")


def _ensure_iso_z(date_str: str, end_of_day: bool = False) -> str:
    # date_str expected format YYYY-MM-DD
    if end_of_day:
        return f"{date_str}T23:59:59Z"
    return f"{date_str}T00:00:00Z"


def _get_client_or_error() -> Optional[PayPalNVPClient]:
    if not (settings.paypal_user and settings.paypal_password and settings.paypal_signature):
        return None
    return PayPalNVPClient(
        user=settings.paypal_user,
        password=settings.paypal_password,
        signature=settings.paypal_signature,
        mode=settings.paypal_mode,
        version=settings.paypal_version,
    )


@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> HTMLResponse:
    has_creds = bool(
        settings.paypal_user and settings.paypal_password and settings.paypal_signature
    )
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "has_creds": has_creds,
            "transactions": [],
            "error": None,
        },
    )


@app.post("/search", response_class=HTMLResponse)
async def search(
    request: Request,
    start_date: str = Form(..., description="YYYY-MM-DD"),
    end_date: str = Form(..., description="YYYY-MM-DD"),
    email: Optional[str] = Form(None),
    transaction_id: Optional[str] = Form(None),
) -> HTMLResponse:
    client = _get_client_or_error()
    if client is None:
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "has_creds": False,
                "transactions": [],
                "error": "Missing PayPal API credentials. Set them in environment variables.",
            },
        )

    try:
        start_iso = _ensure_iso_z(start_date, end_of_day=False)
        end_iso = _ensure_iso_z(end_date, end_of_day=True)
        result = await client.transaction_search(
            start_date_iso_z=start_iso,
            end_date_iso_z=end_iso,
            email=email or None,
            transaction_id=transaction_id or None,
        )
        ack = result.get("ACK", "")
        if ack not in {"Success", "SuccessWithWarning"}:
            error_long = result.get("L_LONGMESSAGE0") or result.get("L_SHORTMESSAGE0") or "Unknown error"
            return templates.TemplateResponse(
                "index.html",
                {
                    "request": request,
                    "has_creds": True,
                    "transactions": [],
                    "error": f"PayPal error: {error_long}",
                },
            )
        transactions = PayPalNVPClient.parse_transaction_search(result)
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "has_creds": True,
                "transactions": transactions,
                "error": None,
            },
        )
    except Exception as exc:  # noqa: BLE001
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "has_creds": True,
                "transactions": [],
                "error": f"Unexpected error: {exc}",
            },
        )


@app.get("/api/activity")
async def api_activity(
    start_date: str = Query(..., description="YYYY-MM-DD"),
    end_date: str = Query(..., description="YYYY-MM-DD"),
    email: Optional[str] = Query(None),
    transaction_id: Optional[str] = Query(None),
) -> JSONResponse:
    client = _get_client_or_error()
    if client is None:
        return JSONResponse(
            status_code=400,
            content={"error": "Missing PayPal API credentials"},
        )

    start_iso = _ensure_iso_z(start_date, end_of_day=False)
    end_iso = _ensure_iso_z(end_date, end_of_day=True)

    result = await client.transaction_search(
        start_date_iso_z=start_iso,
        end_date_iso_z=end_iso,
        email=email or None,
        transaction_id=transaction_id or None,
    )
    ack = result.get("ACK", "")
    if ack not in {"Success", "SuccessWithWarning"}:
        return JSONResponse(
            status_code=400,
            content={
                "ack": ack,
                "error": result.get("L_LONGMESSAGE0") or result.get("L_SHORTMESSAGE0") or "Unknown error",
                "raw": result,
            },
        )

    transactions = PayPalNVPClient.parse_transaction_search(result)
    return JSONResponse(
        content={
            "ack": ack,
            "count": len(transactions),
            "transactions": transactions,
        }
    )


@app.post("/api/nvp/execute")
async def nvp_execute(
    method: str = Form(...),
    # Accept arbitrary fields as params via Form by prefixing with 'param_'
    request: Request = None,
    override_user: Optional[str] = Form(None),
    override_pwd: Optional[str] = Form(None),
    override_signature: Optional[str] = Form(None),
    override_mode: Optional[str] = Form(None),
    override_version: Optional[str] = Form(None),
) -> JSONResponse:
    form = await request.form()
    params: Dict[str, Any] = {}
    for key, value in form.items():
        if isinstance(value, list):
            continue
        if key.startswith("param_"):
            # param_STARTDATE => STARTDATE
            nvp_key = key[len("param_") :]
            params[nvp_key] = value

    client = None
    if override_user and override_pwd and override_signature:
        client = PayPalNVPClient(
            user=override_user,
            password=override_pwd,
            signature=override_signature,
            mode=override_mode or settings.paypal_mode,
            version=override_version or settings.paypal_version,
        )
    else:
        client = _get_client_or_error()
        if client is None:
            return JSONResponse(status_code=400, content={"error": "Missing credentials"})

    try:
        result = await client.call(method, params)
        return JSONResponse(content={"ack": result.get("ACK"), "result": result})
    except Exception as exc:  # noqa: BLE001
        return JSONResponse(status_code=500, content={"error": str(exc)})