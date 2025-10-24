import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use local file from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.mjs`;

export const processPDF = async (file) => {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    console.log('PDF loaded, pages:', pdf.numPages);
    
    // Extract text from all pages
    let fullText = '';
    const pages = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extract text items and join them
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      
      pages.push({
        pageNumber: pageNum,
        text: pageText
      });
      
      fullText += pageText + '\n\n';
      
      // Log progress for large PDFs
      if (pageNum % 10 === 0) {
        console.log(`Processed ${pageNum}/${pdf.numPages} pages`);
      }
    }
    
    // Get PDF metadata
    const metadata = await pdf.getMetadata();
    
    return {
      fullText: fullText.trim(),
      pages: pages,
      metadata: {
        numPages: pdf.numPages,
        info: metadata.info,
        title: metadata.info?.Title || file.name,
        author: metadata.info?.Author || 'Unknown',
        subject: metadata.info?.Subject || '',
        keywords: metadata.info?.Keywords || ''
      }
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF: ' + error.message);
  }
};

// Helper function to get excerpt from specific page
export const getPageExcerpt = (pages, pageNumber, charLimit = 500) => {
  const page = pages.find(p => p.pageNumber === pageNumber);
  if (!page) return null;
  
  return page.text.length > charLimit 
    ? page.text.substring(0, charLimit) + '...'
    : page.text;
};

// Helper function to search for text in pages
export const searchInPages = (pages, searchTerm) => {
  const results = [];
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  pages.forEach(page => {
    if (page.text.toLowerCase().includes(lowerSearchTerm)) {
      const index = page.text.toLowerCase().indexOf(lowerSearchTerm);
      const start = Math.max(0, index - 50);
      const end = Math.min(page.text.length, index + searchTerm.length + 50);
      
      results.push({
        pageNumber: page.pageNumber,
        excerpt: '...' + page.text.substring(start, end) + '...',
        matchIndex: index
      });
    }
  });
  
  return results;
};