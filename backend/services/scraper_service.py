import os
import requests
from langchain_openai import ChatOpenAI

SEARCH_API_KEY = "770c8d30c32868e1ca74c91adadb0a2121e52bab"
SAVE_FOLDER = "./downloads"
if not os.path.exists(SAVE_FOLDER):
    os.makedirs(SAVE_FOLDER)

def get_pdf_links(query):
    """Searches Google for PDFs using an API (no browser opened)."""
    url = "https://google.serper.dev/search"
    payload = {"q": f"{query} filetype:pdf", "num": 10}
    headers = {'X-API-KEY': SEARCH_API_KEY, 'Content-Type': 'application/json'}
    
    response = requests.post(url, json=payload, headers=headers)
    results = response.json().get('organic', [])
    return [item['link'] for item in results if item['link'].endswith('.pdf')]

def download_pdf(url, folder):
    """Downloads a file from a URL to a folder."""
    try:
        file_name = url.split("/")[-1]
        path = os.path.join(folder, file_name)
        response = requests.get(url, timeout=10)
        with open(path, 'wb') as f:
            f.write(response.content)
        print(f"Successfully downloaded: {file_name}")
    except Exception as e:
        print(f"Failed to download {url}: {e}")

def ai_query_web(q, fold):
    linklist = get_pdf_links(q)
    for link in linklist:
        download_pdf(link, fold)

if __name__ == "__main__":
    user_input = input("PDF Finder: ")
    links = get_pdf_links(user_input)
    
    for link in links:
        download_pdf(link, SAVE_FOLDER)
    


