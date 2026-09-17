/**
 * Robust Cross-Platform Clipboard Utility
 * Handles modern navigator.clipboard API, insecure contexts, and iframe/mobile fallbacks.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern async Clipboard API if available and document has focus
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // 2. Fallback to execCommand('copy') via temporary textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.contain = 'strict';
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.fontSize = '12pt'; // Prevent auto-zoom on iOS
    
    const selection = document.getSelection();
    const originalRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 999999);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (originalRange && selection) {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }

    return successful;
  } catch {
    return false;
  }
}
