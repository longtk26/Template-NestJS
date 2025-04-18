// Usage in our codebase
function handleExternalData(data: any): void {
  // Type checking required before usage
  processString(data);
}
function processString(data: string): void {
  console.log(`Processing string: ${data}`);
}
function processArray(data: unknown[]): void {
  console.log(`Processing array: ${data}`);
}
