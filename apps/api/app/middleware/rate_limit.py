import time
from collections import deque
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

# (max_requests, window_seconds)
_ROUTE_LIMITS: list[tuple[str, int, int]] = [
    ("/cases/generate", 5, 60),
    ("/auth/register", 10, 60),
    ("/auth/login", 20, 60),
]
_GLOBAL_LIMIT = (100, 60)

_buckets: dict[str, deque[float]] = {}


def _key(ip: str, route: str) -> str:
    return f"{ip}:{route}"


def _check(key: str, limit: int, window: int) -> bool:
    now = time.monotonic()
    q = _buckets.setdefault(key, deque())
    cutoff = now - window
    while q and q[0] < cutoff:
        q.popleft()
    if len(q) >= limit:
        return False
    q.append(now)
    return True


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable):
        if request.method == "OPTIONS":
            return await call_next(request)

        ip = request.client.host if request.client else "unknown"
        path = request.url.path

        global_key = _key(ip, "__global__")
        if not _check(global_key, *_GLOBAL_LIMIT):
            return JSONResponse({"detail": "Rate limit exceeded"}, status_code=429)

        for route_prefix, limit, window in _ROUTE_LIMITS:
            if path.startswith(route_prefix):
                route_key = _key(ip, route_prefix)
                if not _check(route_key, limit, window):
                    return JSONResponse({"detail": f"Rate limit exceeded for {route_prefix}"}, status_code=429)
                break

        return await call_next(request)
