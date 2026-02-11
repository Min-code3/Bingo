'use client';

import { useEffect } from 'react';
import { useBingoState } from './useBingoState';
import { logClick, logPageView } from '@/lib/logger';

/**
 * Global Logger Component
 * Tracks all user interactions silently in the background
 * - Logs all clicks with detailed element information
 * - Logs page views on navigation
 * - Fails silently to not disrupt user experience
 */
export default function GlobalLogger() {
  const { userId } = useBingoState();

  useEffect(() => {
    // Don't set up listeners until we have a userId
    if (!userId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏳ GlobalLogger: Waiting for userId...');
      }
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🟢 GlobalLogger: Initialized with userId:', userId);
      console.log('🎯 GlobalLogger: Click tracking active');
    }

    // Log initial page view
    logPageView(userId);

    // Global click listener
    const handleClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // Find the most relevant parent element (button, link, etc.)
      let element = target;
      let depth = 0;
      const maxDepth = 5; // Don't traverse too far up

      // Track special element types
      let isBingoCell = false;
      let isBackButton = false;
      let isExternalLink = false;
      let linkElement: HTMLAnchorElement | null = null;

      // Traverse up to find interactive elements and detect special cases
      while (element && depth < maxDepth) {
        const tagName = element.tagName?.toLowerCase();
        const classList = element.classList;

        // Detect bingo cell
        if (
          classList.contains('bingo-cell') ||
          classList.contains('flip-card') ||
          classList.contains('food-place-card')
        ) {
          isBingoCell = true;
        }

        // Detect back button
        if (
          classList.contains('back-btn') ||
          element.textContent?.includes('←') ||
          element.textContent?.includes('Back') ||
          element.textContent?.includes('뒤로')
        ) {
          isBackButton = true;
        }

        // Detect external link
        if (tagName === 'a') {
          const href = (element as HTMLAnchorElement).href;
          if (href) {
            linkElement = element as HTMLAnchorElement;
            // Check if it's external (Google Maps, etc.)
            try {
              const url = new URL(href);
              if (url.origin !== window.location.origin) {
                isExternalLink = true;
              }
            } catch {
              // Invalid URL, ignore
            }
          }
        }

        // Stop at interactive elements
        if (
          tagName === 'a' ||
          tagName === 'button' ||
          element.onclick !== null ||
          element.getAttribute('role') === 'button' ||
          classList.contains('clickable') ||
          classList.contains('upload-btn') ||
          classList.contains('bingo-cell')
        ) {
          break;
        }

        element = element.parentElement as HTMLElement;
        depth++;
      }

      const finalElement = element || target;

      // Handle external links with sendBeacon (must be synchronous)
      if (isExternalLink && linkElement) {
        // Use sendBeacon for guaranteed delivery before navigation
        const { logExternalLink } = await import('@/lib/logger');
        await logExternalLink(userId, linkElement);
        return; // External link logging is complete
      }

      // Handle back button
      if (isBackButton) {
        logClick(userId, finalElement, 'navigation_back');
        return;
      }

      // Handle bingo cell click
      if (isBingoCell) {
        // Try to extract cell ID or index
        let cellId = finalElement.dataset.cellId || '';
        if (!cellId) {
          // Look for cell config in nearby elements
          const cellLabel = finalElement.querySelector('.cell-label')?.textContent;
          const cellIcon = finalElement.querySelector('.cell-icon')?.textContent;
          cellId = cellLabel || cellIcon || 'unknown';
        }

        logClick(userId, finalElement, 'bingo_click');
        return;
      }

      // Default click logging
      logClick(userId, finalElement);
    };

    // Attach listener to document
    document.addEventListener('click', handleClick, { capture: true, passive: true });

    // Log page views on navigation (for SPA routing)
    let lastUrl = window.location.href;
    const checkUrlChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        logPageView(userId, currentUrl);
      }
    };

    // Check for URL changes periodically (for Next.js router)
    const urlCheckInterval = setInterval(checkUrlChange, 1000);

    // Cleanup
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔴 GlobalLogger: Cleaning up listeners');
      }
      document.removeEventListener('click', handleClick, { capture: true });
      clearInterval(urlCheckInterval);
    };
  }, [userId]);

  // This component renders nothing
  return null;
}
