export { };
console.log('--- DEBUG START ---');
console.log('CWD:', process.cwd());
console.log('Bun version:', Bun.version);

console.log('Bun version:', Bun.version);

try {
    const vite = await import('vite');
    console.log('Vite imported. Creating server...');
    const server = await vite.createServer({
        configFile: './vite.config.ts',
        root: process.cwd(),
        server: {
            port: 5315
        }
    });
    await server.listen();
    console.log('Server started on port 5315');
    server.printUrls();
} catch (e) {
    console.error('SERVER FATAL ERROR:', e);
    process.exit(1);
}
