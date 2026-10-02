export function listenWithFallback(app, preferredPort, { onFallback, onListening } = {}) {
  let port = preferredPort;

  const start = () => {
    const server = app.listen(port, () => onListening?.(port));
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE' && port < preferredPort + 20) {
        const busy = port;
        port += 1;
        onFallback?.(busy, port);
        setTimeout(start, 80);
        return;
      }
      throw error;
    });
  };

  start();
}
