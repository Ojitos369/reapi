import os

from ojitos369.errors import CatchErrors as CE
from ojitos369.utils import get_d, print_line_center, printwln as pln

port = os.environ.get('EMAIL_PORT', None)
email_settings = {
    'smtp_server': os.environ.get('EMAIL_HOST', None),
    'port': int(port) if port else None,
    'sender': os.environ.get('EMAIL_HOST_USER', None),
    'receiver': 'ojitos369@gmail.com',
    'user': os.environ.get('EMAIL_HOST_USER', None),
    'password': os.environ.get('EMAIL_HOST_PASSWORD', None),
}

class MYE(Exception):
    pass

prod_mode = True if str(os.environ.get('RUN_PROD_MODE', True)).title() == 'True' else False
ce = ce = CE(name_project = 'REAPI BASE', email_settings = email_settings)

