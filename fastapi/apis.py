from base import BaseApi, pln

class HelloWorld(BaseApi):
    def main(self):
        pln('Main')
        print(self.args)
        print(self.kwargs)
        return {"Hello": "World"}

