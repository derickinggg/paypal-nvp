import urllib.parse
from typing import Any, Dict, List, Optional

import httpx


class PayPalNVPClient:
    def __init__(
        self,
        user: str,
        password: str,
        signature: str,
        mode: str = "sandbox",
        version: str = "204",
    ) -> None:
        self.user = user
        self.password = password
        self.signature = signature
        self.version = version
        if mode not in {"sandbox", "live"}:
            raise ValueError("mode must be 'sandbox' or 'live'")
        self.mode = mode
        self.endpoint = (
            "https://api-3t.sandbox.paypal.com/nvp"
            if self.mode == "sandbox"
            else "https://api-3t.paypal.com/nvp"
        )

    def _base_params(self) -> Dict[str, str]:
        return {
            "USER": self.user,
            "PWD": self.password,
            "SIGNATURE": self.signature,
            "VERSION": self.version,
        }

    async def _send_request(self, method: str, params: Dict[str, Any]) -> Dict[str, str]:
        payload: Dict[str, Any] = {"METHOD": method}
        payload.update(self._base_params())
        payload.update(params)

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(self.endpoint, data=payload)
            response.raise_for_status()

        parsed_pairs = urllib.parse.parse_qsl(
            response.text, keep_blank_values=True, strict_parsing=False
        )
        return {k: v for k, v in parsed_pairs}

    async def transaction_search(
        self,
        start_date_iso_z: str,
        end_date_iso_z: Optional[str] = None,
        email: Optional[str] = None,
        transaction_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Dict[str, Any]:
        params: Dict[str, Any] = {"STARTDATE": start_date_iso_z}
        if end_date_iso_z:
            params["ENDDATE"] = end_date_iso_z
        if email:
            params["EMAIL"] = email
        if transaction_id:
            params["TRANSACTIONID"] = transaction_id
        if status:
            params["STATUS"] = status

        result = await self._send_request("TransactionSearch", params)
        return result

    @staticmethod
    def parse_transaction_search(result: Dict[str, str]) -> List[Dict[str, str]]:
        # Extract indexed keys like L_TRANSACTIONID0, L_AMT0, etc.
        indexed_records: Dict[int, Dict[str, str]] = {}
        for key, value in result.items():
            if not key.startswith("L_"):
                continue
            # Find trailing index
            idx = None
            # Scan backwards to find numeric suffix
            for i in range(len(key) - 1, -1, -1):
                if not key[i].isdigit():
                    # first non-digit from the end
                    suffix = key[i + 1 :]
                    if suffix.isdigit():
                        idx = int(suffix)
                    break
            if idx is None:
                continue
            bare_key = key[: -(len(str(idx)))]
            records_for_index = indexed_records.setdefault(idx, {})
            records_for_index[bare_key] = value

        # Normalize keys and order by index
        normalized: List[Dict[str, str]] = []
        for idx in sorted(indexed_records.keys()):
            rec = indexed_records[idx]
            normalized.append(
                {
                    "timestamp": rec.get("L_TIMESTAMP", ""),
                    "type": rec.get("L_TYPE", ""),
                    "email": rec.get("L_EMAIL", ""),
                    "name": rec.get("L_NAME", ""),
                    "transaction_id": rec.get("L_TRANSACTIONID", ""),
                    "status": rec.get("L_STATUS", ""),
                    "amount": rec.get("L_AMT", ""),
                    "currency": rec.get("L_CURRENCYCODE", ""),
                    "fee": rec.get("L_FEEAMT", ""),
                    "net": rec.get("L_NETAMT", ""),
                }
            )
        return normalized