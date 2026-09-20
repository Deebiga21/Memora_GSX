import pymupdf # PyMuPDF
from sqlalchemy.orm import Session
from ..models import DocumentPage

def extract_and_store_pdf_pages(db: Session, document_id: int, file_path: str) -> int:
    """
    Extracts text from PDF page-by-page and stores each as a DocumentPage.
    Tracks word count, character count, and empty pages.
    Returns the total page count.
    """
    try:
        # Use new standard pymupdf
        doc = pymupdf.open(file_path)
        page_count = len(doc)
        
        for page_num in range(page_count):
            page = doc.load_page(page_num)
            text = page.get_text("text").strip()
            
            char_count = len(text)
            word_count = len(text.split()) if char_count > 0 else 0
            
            # Store every page, even if text is empty
            doc_page = DocumentPage(
                document_id=document_id,
                page_number=page_num + 1,  # 1-indexed
                text=text if text else "",
                character_count=char_count,
                word_count=word_count
            )
            db.add(doc_page)
            
        db.commit()
        return page_count
    except Exception as e:
        print(f"Error extracting PDF: {str(e)}")
        raise e

def get_document_chunks(db: Session, document_id: int, chunk_size: int = 5) -> list[tuple[int, int, str]]:
    """
    Retrieves document pages from the DB and groups them into chunks.
    Returns a list of tuples: (start_page, end_page, combined_text)
    """
    pages = db.query(DocumentPage).filter(DocumentPage.document_id == document_id).order_by(DocumentPage.page_number).all()
    
    chunks = []
    current_text = []
    start_page = None
    last_page = None
    
    for i, page in enumerate(pages):
        if start_page is None:
            start_page = page.page_number
            
        if page.text:
            current_text.append(f"--- PAGE {page.page_number} ---\n{page.text}")
            
        last_page = page.page_number
        
        # When we hit chunk size or end of document
        if (i + 1) % chunk_size == 0 or (i + 1) == len(pages):
            combined = "\n\n".join(current_text)
            chunks.append((start_page, last_page, combined))
            current_text = []
            start_page = None
            
    return chunks
