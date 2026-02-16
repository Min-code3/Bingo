import { supabase } from './supabase';

/** 도쿄/한국 시간(+09:00)으로 ISO 형식 타임스탬프 반환 */
export function nowTokyo(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }).replace(' ', 'T') + '+09:00';
}

export interface LogEvent {
  action_type: string;
  target?: string;
  page_url?: string;
  element_type?: string;
  element_text?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an event to the user_logs table
 * This function fails silently to not disrupt the user experience
 */
export async function logEvent(userId: string | undefined, event: LogEvent): Promise<void> {
  // Skip logging if no userId yet (user not initialized)
  if (!userId) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔴 Logger: No userId yet, skipping log');
    }
    return;
  }

  try {
    // Supabase user를 가져와서 user_id는 UUID로 사용
    const { data: { user } } = await supabase.auth.getUser();

    const logData = {
      user_id: user?.id || null, // Supabase UUID (Foreign Key 호환)
      custom_user_id: userId, // 커스텀 ID ("990", "me" 등)
      action_type: event.action_type,
      target: event.target,
      page_url: event.page_url || window.location.href,
      metadata: {
        timestamp_kst: nowTokyo(), // 항상 도쿄/서울 시간 추가
        ...event.metadata,
        element_type: event.element_type,
        element_text: event.element_text,
      },
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Logger:', event.action_type, '→', event.target || event.element_type);
    }

    // TEMPORARY: Log data being sent (for debugging 400 errors)
    console.log('🔍 Sending to Supabase:', JSON.stringify(logData, null, 2));

    const { error } = await supabase
      .from('user_logs')
      .insert(logData);

    if (error) {
      // Always log errors (even in production, for debugging)
      console.error('❌ Supabase error:', error);
      console.error('❌ Failed data:', logData);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Logged successfully');
      }
    }
  } catch (error) {
    // Silently fail - don't disrupt user experience
    if (process.env.NODE_ENV === 'development') {
      console.warn('❌ Error logging event:', error);
    }
  }
}

/**
 * Extract useful information from a clicked element
 * Uses fallback strategy: ID > aria-label > alt > data-* > class > text content
 * Also searches parent elements for context (e.g., data-cell-id)
 */
export function extractElementInfo(element: HTMLElement): {
  target: string;
  element_type: string;
  element_text: string;
} {
  const tagName = element.tagName.toLowerCase();
  const className = element.className || '';
  const id = element.id || '';

  // Search up to 5 levels for data-cell-id or other useful attributes
  let contextElement: HTMLElement | null = element;
  let cellId = '';
  let dataIndex = '';

  for (let i = 0; i < 5 && contextElement; i++) {
    if (contextElement.dataset?.cellId) {
      cellId = contextElement.dataset.cellId;
      break;
    }
    if (contextElement.dataset?.index) {
      dataIndex = contextElement.dataset.index;
    }
    contextElement = contextElement.parentElement;
  }

  // Try multiple strategies to get a meaningful name
  let displayName = '';

  // Priority 1: ID
  if (id) {
    displayName = `#${id}`;
  }
  // Priority 2: Cell ID from parent (MOST IMPORTANT for bingo cells)
  else if (cellId) {
    displayName = `[${cellId}]`;
  }
  // Priority 3: aria-label (for accessibility)
  else if (element.getAttribute('aria-label')) {
    displayName = element.getAttribute('aria-label')!;
  }
  // Priority 4: alt text (for images)
  else if (tagName === 'img' && (element as HTMLImageElement).alt) {
    displayName = (element as HTMLImageElement).alt;
  }
  // Priority 5: data-index
  else if (dataIndex) {
    displayName = `[index-${dataIndex}]`;
  }
  // Priority 6: First meaningful class name
  else if (className) {
    const classes = className.split(' ').filter(c => c && !c.startsWith('css-') && !c.includes('module'));
    if (classes.length > 0) {
      displayName = `.${classes[0]}`;
    }
  }

  // Extract text content (limit to 100 chars)
  let text = element.textContent?.trim().substring(0, 100) || '';
  if (tagName === 'img') {
    text = (element as HTMLImageElement).alt || text;
  }

  // Build target string
  let target = tagName;
  if (displayName) {
    target += displayName;
  } else if (text && text.length < 30) {
    // Use text if it's short enough and we have nothing else
    target += `["${text}"]`;
  }

  // For links, add the href
  if (tagName === 'a') {
    const href = (element as HTMLAnchorElement).href;
    if (href) {
      target += ` → ${href}`;
    }
  }

  // For buttons, add the type
  if (tagName === 'button') {
    const type = (element as HTMLButtonElement).type;
    if (type && type !== 'button') {
      target += ` [${type}]`;
    }
  }

  return {
    target,
    element_type: tagName,
    element_text: text,
  };
}

/**
 * Check if a URL is external (takes user away from the site)
 */
function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Log event with sendBeacon for external links (guaranteed delivery before navigation)
 * Uses Supabase REST API with proper auth headers
 */
export async function logEventWithBeacon(
  userId: string | undefined,
  event: LogEvent
): Promise<void> {
  if (!userId) return;

  try {
    // Supabase user를 가져와서 user_id는 UUID로 사용
    const { data: { user } } = await supabase.auth.getUser();

    const logData = {
      user_id: user?.id || null, // Supabase UUID (Foreign Key 호환)
      custom_user_id: userId, // 커스텀 ID ("990", "me" 등)
      action_type: event.action_type,
      target: event.target,
      page_url: event.page_url || window.location.href,
      metadata: {
        timestamp_kst: nowTokyo(), // 항상 도쿄/서울 시간 추가
        ...event.metadata,
        element_type: event.element_type,
        element_text: event.element_text,
      },
    };

    // Get the session for auth token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Build request with proper headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      'Authorization': `Bearer ${token}`,
    });

    // Create FormData for sendBeacon (it accepts FormData or Blob)
    const beaconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_logs`;

    // Try sendBeacon first (most reliable for page exits)
    const blob = new Blob([JSON.stringify(logData)], { type: 'application/json' });

    // Note: sendBeacon doesn't support custom headers, so we'll use fetch with keepalive
    // This is more reliable for our use case with Supabase auth
    const sent = await fetch(beaconUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(logData),
      keepalive: true, // This ensures the request completes even if page unloads
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(
        sent.ok ? '🚀 External link logged:' : '❌ External link log failed:',
        event.action_type,
        '→',
        event.target
      );
    }
  } catch (error) {
    // Fallback to regular logging
    if (process.env.NODE_ENV === 'development') {
      console.warn('❌ Beacon fallback to regular log:', error);
    }
    await logEvent(userId, event);
  }
}

/**
 * Log a click event
 */
export function logClick(
  userId: string | undefined,
  element: HTMLElement,
  customActionType?: string
): void {
  // Skip logging for meaningless clicks (body, html, etc.)
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'body' || tagName === 'html') {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔴 Logger: Skipped body/html click');
    }
    return;
  }

  const elementInfo = extractElementInfo(element);

  logEvent(userId, {
    action_type: customActionType || 'click',
    ...elementInfo,
    metadata: {
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      scroll_y: window.scrollY,
      timestamp_client: nowTokyo(),
    },
  });
}

/**
 * Log external link click with beacon for guaranteed delivery
 */
export async function logExternalLink(
  userId: string | undefined,
  element: HTMLAnchorElement
): Promise<void> {
  const elementInfo = extractElementInfo(element);

  await logEventWithBeacon(userId, {
    action_type: 'external_link',
    ...elementInfo,
    metadata: {
      href: element.href,
      target: element.target,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      timestamp_client: nowTokyo(),
    },
  });
}

/**
 * Log a page view event
 */
export function logPageView(userId: string | undefined, pageUrl?: string): void {
  logEvent(userId, {
    action_type: 'page_view',
    target: pageUrl || window.location.pathname,
    page_url: pageUrl || window.location.href,
    metadata: {
      referrer: document.referrer,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      user_agent: navigator.userAgent,
      timestamp_client: nowTokyo(),
    },
  });
}

/**
 * Log a custom event
 */
export function logCustomEvent(
  userId: string | undefined,
  actionType: string,
  details?: Partial<LogEvent>
): void {
  logEvent(userId, {
    action_type: actionType,
    ...details,
  });
}
