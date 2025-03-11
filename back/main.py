from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apis.urls import apis
from core.conf.settings import allow_origins, allow_credentials, allow_methods, allow_headers

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=allow_methods,
    allow_headers=allow_headers
)

app.include_router(apis, prefix="/api")

# uvicorn main:app --host 0.0.0.0 --port 8000 --reload

""" 
tengo 2 contenedores conectados con red

el back es con fastapi y el front con react

dr network inspect reapi_app-net
...
"Containers": {
            "522dbd4e81652ccaa435d3619e9ddcf00abe01afa822419f936fc66aa909f111": {
                "Name": "reapif",
                "EndpointID": "484f5627888d17672e8733f70d71b6d3191dcefd80968f34d43e56328018a9e6",
                "MacAddress": "02:42:c0:a8:10:02",
                "IPv4Address": "192.168.16.2/20",
                "IPv6Address": ""
            },
            "92d16ccd5bdb44b75dd4794089530dd7a4aef101e3662290d0f73a3c77c578a8": {
                "Name": "reapib",
                "EndpointID": "c6530ac936f1ed4eb5da753e655419bbcca55e563b66130c87a97ddc02f43cf0",
                "MacAddress": "02:42:c0:a8:10:03",
                "IPv4Address": "192.168.16.3/20",
                "IPv6Address": ""
            }
        },
...

desde el contenedor de front si hago curl me deja sin problema
```
dr exec -it reapif zsh
➜  app curl http://reapib:8000/api/base/hh
{"Hello":"World"}#
➜  app 
```

pero si entro desde el navegador al puerto expuesto del front y hago la misma peticion no me deja
```
functions.jsx:26 
GET http://reapib:8000/api/base/hh net::ERR_NAME_NOT_RESOLVED
```

pero si en lugar de apuntar a http://reapib:8000/api/base/hh pongo la ip que me da en el network inspect si me deja

http://192.168.16.3:8000/api/base/hh

el puerto del back no esta expuesto y no se debe de exponer
como puedo hacer para hacer las llamadas desde react sin tener que poner la ip del back porque son dinamicas y no puedo estar actualizando el codigo o las variables cada que cambien

"""