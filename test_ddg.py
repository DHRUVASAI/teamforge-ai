import urllib.request
import urllib.parse
import json

query = urllib.parse.quote("site:espncricinfo.com/cricketers Virat Kohli")
url = f"https://api.duckduckgo.com/?q={query}&format=json"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except Exception as e:
    print(e)
