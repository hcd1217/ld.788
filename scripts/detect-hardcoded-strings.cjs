const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

/**
 * Hardcoded Strings Detection Script
 * Detects hardcoded strings in React components that should use translations
 */

const SRC_DIR = path.join(__dirname, '../src');

// Command line options
const isVerbose = process.argv.includes('--verbose');
const showSuggestions = process.argv.includes('--suggestions');
const onlyErrors = process.argv.includes('--errors-only');

// Patterns to exclude (technical strings that shouldn't be translated)
const EXCLUSION_PATTERNS = [
  /^[a-z-]+$/, // CSS class names, HTML attributes
  /^[A-Z_]+$/, // Constants
  /^\d+$/, // Numbers
  /^[a-zA-Z]+:[a-zA-Z]+$/, // CSS properties
  /^#[\da-fA-F]{3,6}$/, // Hex colors
  /^(sm|md|lg|xl|xs)$/, // Mantine sizes
  /^(left|right|center|top|bottom)$/, // Positioning
  /^(flex|block|inline|grid)$/, // Display values
  /^(auto|none|hidden|visible)$/, // CSS values
  /^(primary|secondary|success|error|warning|info)$/, // Color variants
  /^(solid|outline|filled|subtle|light|gradient)$/, // Mantine variants
  /^(horizontal|vertical)$/, // Orientation
  /^(start|end|center|between|around|evenly)$/, // Flex alignment
  /^(wrap|nowrap)$/, // Flex wrap
  /^(static|relative|absolute|fixed|sticky)$/, // Position values
  /^(normal|bold|lighter|bolder|\d+)$/, // Font weights
  /^(px|em|rem|%|vh|vw|vmin|vmax)$/, // CSS units
  /^(ease|linear|ease-in|ease-out|ease-in-out)$/, // Transition timing
  /^(fade|slide|scale|rotate)$/, // Animation types
  /^(ltr|rtl)$/, // Text direction
  /^(serif|sans-serif|monospace)$/, // Font families
  /^(uppercase|lowercase|capitalize)$/, // Text transform
  /^(underline|overline|line-through)$/, // Text decoration
  /^(left|right|center|justify)$/, // Text align
  /^(baseline|top|middle|bottom)$/, // Vertical align
  /^(normal|italic|oblique)$/, // Font style
  /^(pre|pre-wrap|pre-line|normal|nowrap)$/, // White space
  /^(break-all|break-word|normal)$/, // Word break
  /^(clip|ellipsis)$/, // Text overflow
  /^(visible|hidden|scroll|auto)$/, // Overflow
  /^(border-box|content-box)$/, // Box sizing
  /^(row|column|row-reverse|column-reverse)$/, // Flex direction
  /^(stretch|flex-start|flex-end|center|baseline)$/, // Align items
  /^(stretch|flex-start|flex-end|center|space-between|space-around)$/, // Align content
  /^(React|Component|Props|State|JSX|TSX)$/, // React terms
  /^(src|alt|href|id|key|className|style|onClick|onChange|onSubmit|onFocus|onBlur|onMouseEnter|onMouseLeave)$/, // HTML/React attributes
  /^(div|span|p|h1|h2|h3|h4|h5|h6|ul|ol|li|a|img|input|button|form|label|select|option|textarea)$/, // HTML elements
  /^(get|post|put|delete|patch|head|options)$/i, // HTTP methods
  /^(json|xml|html|csv|pdf|xlsx|png|jpg|jpeg|gif|svg|mp4|mp3|wav)$/i, // File formats
  /^(utf-8|iso-8859-1|windows-1252)$/i, // Character encodings
  /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i, // Days (might be translated)
  /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i, // Months (might be translated)
  /^(am|pm)$/i, // Time indicators (might be translated)
  /^(true|false|null|undefined)$/, // JavaScript literals
  /^(function|const|let|var|if|else|for|while|switch|case|default|break|continue|return|try|catch|finally|throw|new|delete|typeof|instanceof)$/, // JavaScript keywords
  /^(public|private|protected|static|readonly|abstract|async|await|class|interface|type|enum|namespace|module|import|export|from|as|default)$/, // TypeScript keywords
  /^(useState|useEffect|useContext|useReducer|useCallback|useMemo|useRef|useImperativeHandle|useLayoutEffect|useDebugValue|useTranslation)$/, // React hooks
  /^(React\.Fragment|React\.StrictMode|React\.Suspense|React\.memo|React\.forwardRef|React\.lazy|React\.createContext|React\.createElement|React\.cloneElement)$/, // React APIs
  /^(console\.log|console\.error|console\.warn|console\.info|console\.debug|console\.table|console\.group|console\.groupEnd|console\.time|console\.timeEnd)$/, // Console methods
  /^(localStorage|sessionStorage|indexedDB|document|window|navigator|location|history|screen|performance)$/, // Browser APIs
  /^(JSON\.stringify|JSON\.parse|Object\.keys|Object\.values|Object\.entries|Array\.isArray|Array\.from|Array\.of|String\.fromCharCode|Number\.isNaN|Number\.isFinite|Number\.parseInt|Number\.parseFloat|Math\.[a-zA-Z]+|Date\.now|Date\.parse|RegExp|Error|TypeError|ReferenceError|SyntaxError|RangeError|URIError|EvalError)$/, // JavaScript built-ins
  /^(fetch|XMLHttpRequest|FormData|URLSearchParams|URL|Blob|File|FileReader|WebSocket|EventSource|AbortController|Headers|Request|Response)$/, // Web APIs
  /^(setTimeout|setInterval|clearTimeout|clearInterval|requestAnimationFrame|cancelAnimationFrame|requestIdleCallback|cancelIdleCallback)$/, // Timing APIs
  /^(addEventListener|removeEventListener|dispatchEvent|preventDefault|stopPropagation|stopImmediatePropagation)$/, // Event APIs
  /^(querySelector|querySelectorAll|getElementById|getElementsByClassName|getElementsByTagName|createElement|createTextNode|appendChild|removeChild|insertBefore|replaceChild|cloneNode|getAttribute|setAttribute|removeAttribute|hasAttribute|classList|style|innerHTML|textContent|value|checked|selected|disabled|readonly|required|placeholder|title|alt|src|href|target|rel|type|name|id|className)$/, // DOM APIs
  /^(offsetWidth|offsetHeight|offsetLeft|offsetTop|clientWidth|clientHeight|clientLeft|clientTop|scrollWidth|scrollHeight|scrollLeft|scrollTop|getBoundingClientRect|getComputedStyle)$/, // DOM measurements
  /^(focus|blur|click|submit|reset|select|scroll|resize|load|unload|beforeunload|DOMContentLoaded|readystatechange|visibilitychange|online|offline|storage|popstate|hashchange|pagehide|pageshow|orientationchange|devicemotion|deviceorientation)$/, // DOM events
  /^(keydown|keyup|keypress|mousedown|mouseup|mouseover|mouseout|mouseenter|mouseleave|mousemove|contextmenu|dblclick|wheel|touchstart|touchend|touchmove|touchcancel|pointerdown|pointerup|pointermove|pointerover|pointerout|pointerenter|pointerleave|pointercancel|dragstart|dragend|dragover|dragenter|dragleave|drop|cut|copy|paste|input|change|invalid|submit|reset|select|focus|blur|focusin|focusout|scroll|resize|load|unload|beforeunload|error|abort|canplay|canplaythrough|durationchange|emptied|ended|loadeddata|loadedmetadata|loadstart|pause|play|playing|progress|ratechange|seeked|seeking|stalled|suspend|timeupdate|volumechange|waiting)$/, // More DOM events
  /^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Enter|Escape|Tab|Space|Backspace|Delete|Insert|Home|End|PageUp|PageDown|F1|F2|F3|F4|F5|F6|F7|F8|F9|F10|F11|F12|Shift|Control|Alt|Meta|CapsLock|NumLock|ScrollLock|PrintScreen|Pause|ContextMenu)$/, // Keyboard keys
  /^(button|checkbox|radio|text|password|email|url|tel|search|number|range|date|datetime-local|month|week|time|color|file|hidden|image|submit|reset)$/, // Input types
  /^(application\/json|application\/xml|application\/pdf|application\/zip|application\/octet-stream|text\/plain|text\/html|text\/css|text\/javascript|text\/csv|image\/png|image\/jpg|image\/jpeg|image\/gif|image\/svg\+xml|image\/webp|audio\/mp3|audio\/wav|audio\/ogg|video\/mp4|video\/webm|video\/ogg)$/, // MIME types
  /^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)$/, // HTTP methods
  /^(1xx|2xx|3xx|4xx|5xx|\d{3})$/, // HTTP status codes
  /^(cache-control|content-type|content-length|content-encoding|content-disposition|etag|expires|last-modified|location|set-cookie|authorization|user-agent|accept|accept-language|accept-encoding|referer|origin|host|connection|upgrade|pragma|vary|server|date|age|x-.*|www-authenticate|proxy-authenticate|proxy-authorization)$/i, // HTTP headers
  /^(localhost|127(?:\.0){2}\.1|(?:0\.){3}0|:{2}1|(?:\d{1,3}\.){3}\d{1,3}|[a-f\d:]+:{2}[a-f\d:]*|[a-zA-Z\d-]+\.[a-zA-Z]{2,})$/, // IP addresses and hostnames
  /^(http|https|ftp|ftps|ssh|sftp|telnet|smtp|pop3|imap|ldap|ldaps|file|data|javascript|mailto|tel|sms|geo|magnet|bitcoin|ethereum|monero|litecoin|dogecoin|bitcoin-cash|zcash|dash|ripple|stellar|cardano|polkadot|chainlink|uniswap|sushi|pancake|compound|aave|maker|synthetix|yearn|curve|balancer|1inch|0x|kyber|bancor|loopring|zrx|omg|bat|ant|gnt|rep|zec|xmr|etc|bch|ltc|xrp|ada|dot|link|uni|cake|comp|mkr|snx|yfi|crv|bal|inch):/i, // URL schemes
  /^(ws|wss|mqtt|mqtts|coap|coaps|rtsp|rtmp|rtmps|sip|sips|xmpp|irc|ircs|news|nntp|gopher|dict|ldap|ldaps|pop|pops|imap|imaps|smtp|smtps|snmp|tftp|nfs|afp|smb|cifs|ftp|ftps|ssh|sftp|telnet|rlogin|rsh|finger|whois|dns|mdns|dhcp|bootp|ntp|syslog|radius|tacacs|kerberos|x11|vnc|rdp|ica|spice|nx|xdmcp|cups|ipp|lpd|lpr|rsync|cvs|svn|git|hg|bzr|darcs|fossil|monotone|arch|tla|bitkeeper|perforce|clearcase|vss|tfs|bazaar|mercurial|subversion|concurrent-versions-system|revision-control-system|source-code-control-system|version-control-system|distributed-version-control-system|centralized-version-control-system):/i, // More URL schemes
  /^(android|ios|windows|macos|linux|unix|freebsd|openbsd|netbsd|dragonfly|solaris|aix|hpux|irix|osf|tru64|qnx|beos|haiku|amiga|atari|commodore|apple|microsoft|google|mozilla|opera|safari|chrome|firefox|edge|internet-explorer|netscape|konqueror|lynx|elinks|w3m|curl|wget|httpie|postman|insomnia|thunderbird|outlook|mail|evolution|kmail|mutt|pine|elm|sylpheed|claws|seamonkey|seamonkey-mail|icedove|iceweasel|abrowser|gnuzilla|icecat|waterfox|pale-moon|basilisk)$/i, // Operating systems and applications
];

// Common UI strings that are likely user-facing and should be translated
const UI_STRING_PATTERNS = [
  /^[A-Z][a-z]/, // Starts with capital letter
  /\s/, // Contains spaces
  /[.!?]$/, // Ends with punctuation
  /\b(welcome|hello|hi|bye|goodbye|thanks|thank you|please|sorry|error|success|warning|info|loading|save|cancel|ok|yes|no|submit|delete|edit|add|remove|create|update|view|show|hide|open|close|start|stop|pause|resume|play|next|previous|back|forward|up|down|left|right|home|about|contact|help|support|settings|profile|account|login|logout|register|sign up|sign in|sign out|forgot password|reset password|change password|remember me|terms|privacy|policy|cookies|accept|decline|agree|disagree|confirm|deny|allow|block|enable|disable|on|off|true|false|active|inactive|available|unavailable|online|offline|connected|disconnected|public|private|visible|hidden|enabled|disabled|valid|invalid|required|optional|recommended|suggested|popular|featured|new|old|recent|latest|updated|modified|created|deleted|added|removed|imported|exported|uploaded|downloaded|shared|liked|disliked|favorite|unfavorite|bookmark|unbookmark|subscribe|unsubscribe|follow|unfollow|like|unlike|share|comment|reply|report|flag|unblock|mute|unmute|pin|unpin|archive|unarchive|restore|refresh|reload|retry|undo|redo|cut|copy|paste|select all|deselect|clear|reset|apply|minimize|maximize|fullscreen|exit|quit|restart|shutdown|sleep|hibernate|wake up|lock|unlock|encrypt|decrypt|compress|decompress|zip|unzip|extract|import|export|upload|download|sync|backup|migrate|transfer|move|rename|duplicate|clone|merge|split|join|combine|separate|group|ungroup|sort|filter|search|find|replace|match|compare|diff|patch|commit|push|pull|fetch|rebase|branch|tag|release|deploy|build|compile|run|execute|test|debug|benchmark|analyze|optimize|refactor|document|annotate|highlight|mark|label|categorize|classify|organize|structure|format|style|theme|color|font|size|width|height|length|distance|duration|time|date|timestamp|timezone|locale|language|translation|localization|internationalization|accessibility|usability|user experience|user interface|responsive|mobile|tablet|desktop|laptop|phone|device|browser|client|server|database|api|endpoint|request|response|status|code|message|description|title|name|value|key|id|uuid|hash|token|session|cookie|cache|storage|memory|disk|network|connection|bandwidth|speed|performance|latency|throughput|capacity|usage|quota|limit|threshold|minimum|maximum|average|median|mode|range|variance|deviation|correlation|regression|classification|clustering|recommendation|prediction|forecasting|optimization|automation|integration|deployment|monitoring|logging|reporting|analytics|statistics|metrics|kpi|roi|conversion|engagement|retention|churn|acquisition|growth|revenue|profit|loss|cost|price|discount|tax|fee|commission|subscription|license|permission|role|privilege|access|authorization|authentication|security|encryption|decryption|signature|certificate|password)\b/i,
];

function log(message, force = false) {
  if (isVerbose || force) {
    console.log(message);
  }
}

function isExcluded(str) {
  return EXCLUSION_PATTERNS.some((pattern) => pattern.test(str));
}

function isLikelyUIString(str) {
  // Must be at least 2 characters and not excluded
  if (str.length < 2 || isExcluded(str)) {
    return false;
  }

  // Check for UI string patterns
  return UI_STRING_PATTERNS.some((pattern) => pattern.test(str));
}

function extractStringLiterals(content) {
  const strings = [];
  const lines = content.split('\n');

  for (const [i, line] of lines.entries()) {
    const lineNumber = i + 1;

    // Match string literals in JSX attributes and content
    const stringMatches = [
      ...line.matchAll(/"([^"\\]|\\.)*"/g), // Double quotes
      ...line.matchAll(/'([^'\\]|\\.)*'/g), // Single quotes
      ...line.matchAll(/`([^`\\]|\\.)*`/g), // Template literals
    ];

    for (const match of stringMatches) {
      const fullMatch = match[0];
      const stringContent = fullMatch.slice(1, -1); // Remove quotes

      // Skip empty strings and template literals with expressions
      if (!stringContent || fullMatch.includes('${')) {
        continue;
      }

      // Check if it's likely a UI string
      if (isLikelyUIString(stringContent)) {
        strings.push({
          content: stringContent,
          line: lineNumber,
          column: match.index + 1,
          fullMatch,
          context: line.trim(),
        });
      }
    }
  }

  return strings;
}

function hasTranslationImport(content) {
  return (
    content.includes('useTranslation') ||
    (content.includes('import') && content.includes('useTranslation'))
  );
}

function generateTranslationKey(str, context) {
  // Simple heuristic to suggest translation keys
  const words = str
    .toLowerCase()
    .replaceAll(/[^a-z\d\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 0);

  if (words.length === 0) return null;

  // Suggest category based on context
  let category = 'common';
  if (
    context.includes('auth') ||
    context.includes('login') ||
    context.includes('register')
  ) {
    category = 'auth';
  } else if (
    context.includes('error') ||
    context.includes('invalid') ||
    context.includes('required')
  ) {
    category = 'validation';
  } else if (
    context.includes('success') ||
    context.includes('failed') ||
    context.includes('notification')
  ) {
    category = 'notifications';
  }

  const key = words.join('');
  return `${category}.${key}`;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(SRC_DIR, filePath);

  // Check if file imports useTranslation
  const hasTranslation = hasTranslationImport(content);

  // Extract hardcoded strings
  const hardcodedStrings = extractStringLiterals(content, filePath);

  if (hardcodedStrings.length === 0) {
    return null; // No issues found
  }

  return {
    file: relativePath,
    hasTranslation,
    hardcodedStrings,
    issues: hardcodedStrings.length,
  };
}

function scanDirectory(dir) {
  const results = [];
  const files = fs.readdirSync(dir, {withFileTypes: true});

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      results.push(...scanDirectory(fullPath));
    } else if (
      file.isFile() &&
      (file.name.endsWith('.tsx') || file.name.endsWith('.jsx'))
    ) {
      try {
        const analysis = analyzeFile(fullPath);
        if (analysis) {
          results.push(analysis);
        }
      } catch (error) {
        console.error(`Error analyzing ${fullPath}:`, error.message);
      }
    }
  }

  return results;
}

function generateReport(results) {
  const totalFiles = results.length;
  const totalIssues = results.reduce((sum, result) => sum + result.issues, 0);
  const filesWithoutTranslation = results.filter(
    (r) => !r.hasTranslation,
  ).length;

  console.log('🔍 Hardcoded Strings Detection Report');
  console.log('=====================================');
  console.log(`📊 Summary: ${totalIssues} issues found in ${totalFiles} files`);
  console.log(
    `⚠️  Files without translation imports: ${filesWithoutTranslation}`,
  );
  console.log('');

  // Sort by number of issues (descending)
  const sortedResults = results.sort((a, b) => b.issues - a.issues);

  for (const result of sortedResults) {
    const statusIcon = result.hasTranslation ? '✅' : '❌';
    const translationStatus = result.hasTranslation
      ? 'has useTranslation'
      : 'missing useTranslation';

    console.log(
      `${statusIcon} ${result.file} (${result.issues} issues, ${translationStatus})`,
    );

    if (!onlyErrors) {
      for (const str of result.hardcodedStrings) {
        console.log(`   📍 Line ${str.line}:${str.column} - "${str.content}"`);
        console.log(`      Context: ${str.context}`);

        if (showSuggestions) {
          const suggestedKey = generateTranslationKey(str.content, result.file);
          if (suggestedKey) {
            console.log(`      💡 Suggested key: ${suggestedKey}`);
            console.log(`      💡 Replace with: {t('${suggestedKey}')}`);
          }
        }

        console.log('');
      }
    }
  }
}

function main() {
  console.log('🔍 Starting hardcoded strings detection...');

  if (!fs.existsSync(SRC_DIR)) {
    throw new Error(`❌ Source directory not found: ${SRC_DIR}`);
  }

  log('📂 Scanning React components...');
  const results = scanDirectory(SRC_DIR);

  if (results.length === 0) {
    console.log(
      '✅ No hardcoded strings found! All components are properly internationalized.',
    );
    return;
  }

  generateReport(results);

  console.log('💡 Tips:');
  console.log(
    '  - Import useTranslation hook in components with hardcoded strings',
  );
  console.log('  - Replace hardcoded strings with t("key") calls');
  console.log('  - Add corresponding translations to locale files');
  console.log('  - Use --suggestions flag to see suggested translation keys');
  console.log('  - Use --errors-only flag to see only file summaries');
}

if (require.main === module) {
  main();
}
