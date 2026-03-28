import time

from fastapi import Request


async def logging_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    latency = (time.perf_counter() - start) * 1000
    response.headers["X-Process-Time-ms"] = f"{latency:.2f}"
    return response
