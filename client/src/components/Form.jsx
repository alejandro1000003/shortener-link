import { useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import normalizeUrl from 'normalize-url';

import '../styles/form.css';

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl('');

    try {
      // Normaliza con http si falta protocolo
      const formattedUrl = normalizeUrl(originalUrl, {
        defaultProtocol: 'http:',
        forceHttps: false,
        stripWWW: false,
      });

      if (!isValidUrl(formattedUrl)) {
        setError('URL no válida');
        return;
      }

      const res = await axios.post('https://shortener-link-ll8e.onrender.com/api/shorten', {
        originalUrl: formattedUrl,
      });

      setShortUrl(res.data.shortUrl || 'Error');
    } catch (err) {
      console.error('Error acortando la URL', err);
      setError('Error al acortar');
    }
  };

  return (
    <div className={`grid-container ${!shortUrl ? 'alone' : ''}`}>
      <div className="a">
        <h2>Shorten your URL's</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="shorten_url"
            id="url"
            name="originalUrl"
            placeholder="https://example.com"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
          />
          <button type="submit" className="shorten_button">Shorten</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      {shortUrl && (
        <>
          <div className="b">
            <h2>Result</h2>
            <div className="shortURL">
              <span>{shortUrl}</span>
              <button className="shortURL_button" onClick={handleCopy}>📋</button>
              {copied && <span style={{ marginLeft: '8px', color: 'green' }}>copiado</span>}
            </div>
          </div>

          <div className="c">
            <QRCode className="codigo-qr" value={shortUrl} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
