import time
from collections import defaultdict, deque

from fastapi import Request
from starlette.responses import JSONResponse

REQUEST_LIMIT = 100
WINDOW_SECONDS = 60

_requests: dict[str, deque[float]] = defaultdict(deque)


async def rate_limiter(request: Request, call_next):
    now = time.time()
    client = request.client.host if request.client else "unknown"
    key = f"{client}:{request.url.path}"

    queue = _requests[key]
    while queue and now - queue[0] > WINDOW_SECONDS:
        queue.popleft()

    if len(queue) >= REQUEST_LIMIT:
        return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})

    queue.append(now)
    return await call_next(request)
