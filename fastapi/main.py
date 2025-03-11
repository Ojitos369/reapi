from typing import Union
from fastapi import FastAPI, Request
from apis import HelloWorld

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/hh")
async def hh(request: Request):
    try:
        data = await request.json()
    except:
        data = {}
    r = HelloWorld(request=request, post_data=data).run()
    return r

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

