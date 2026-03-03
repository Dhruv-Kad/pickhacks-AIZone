import os
import requests
import urllib.parse

SEARCH_API_KEY = "3b98fbc57de1326aaf0c02fd03e419ec4f3b9ab3"
SAVE_FOLDER = "./pdfs"

if not os.path.exists(SAVE_FOLDER):
    os.makedirs(SAVE_FOLDER)

def get_pdf_links(query: str):
    """Searches Google for PDFs using Serper API."""
    url = "https://google.serper.dev/search"
    payload = {"q": f"{query} filetype:pdf", "num": 3}
    headers = {'X-API-KEY': SEARCH_API_KEY, 'Content-Type': 'application/json'}
    
    response = requests.post(url, json=payload, headers=headers)
    results = response.json().get('organic', [])
    return [item['link'] for item in results if item['link'].endswith('.pdf')]

def download_pdf(url, folder):
    """Downloads a file from a URL to a folder, ensuring it's a valid PDF."""
    try:
<<<<<<< HEAD
        clean_url = url.split("?")[0]
        file_name = urllib.parse.unquote(clean_url.split("/")[-1])
        if not file_name.lower().endswith('.pdf'):
            file_name += '.pdf'
            
=======
        file_name = url.split("/")[-1]
        file_name = file_name.replace("%","")
>>>>>>> refs/remotes/origin/trunk
        path = os.path.join(folder, file_name)
        
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, timeout=10, headers=headers)
        
        content_type = response.headers.get('Content-Type', '').lower()
        if response.status_code == 200 and 'application/pdf' in content_type:
            with open(path, 'wb') as f:
                f.write(response.content)
            print(f"Successfully downloaded: {file_name}")
        else:
            print(f"Skipped {url}: Server did not return a valid PDF document.")
            
    except Exception as e:
        print(f"Failed to download {url}: {e}")

def ai_query_web(q: str, fold: str):
    """Main entry point for tool call."""
    linklist = get_pdf_links(q)
<<<<<<< HEAD
    for link in linklist[:3]:
        download_pdf(link, fold)
=======
    n = 2
    for link in linklist:
        if n>0:
            download_pdf(link,fold)
        n -= 1


if __name__ == "__main__":
    user_input = input("PDF Finder: ")
    links = get_pdf_links(user_input)
    
    download_pdf(links[0], SAVE_FOLDER)
    


>>>>>>> refs/remotes/origin/trunk
