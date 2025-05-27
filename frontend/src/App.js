  import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Button, Table, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'inter-ui/inter.css';

//const API_BASE = 'http://localhost:5000/api';
const API_BASE='https://vpn-wg.onrender.com/api';

function App() {
  const [wgStatus, setWgStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [pingResult, setPingResult] = useState('');
  const [peerIPs, setPeerIPs] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!showDetails) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [showDetails]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/wg-status`);
      setWgStatus(res.data.output);
      const ips = Array.from(new Set((res.data.output.match(/\b10\.\d+\.\d+\.\d+/g) || [])));
      const filteredIps = ips.filter(ip => ip !== '10.0.0.1');
      setPeerIPs(filteredIps);
    } catch (err) {
      setWgStatus('Error fetching status');
      setPeerIPs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVpnAction = async (action) => {
    setActionMsg(`Running ${action}...`);
    try {
      const res = await axios.post(`${API_BASE}/vpn/${action}`);
      setActionMsg(res.data.message);
      fetchStatus();
    } catch (err) {
      setActionMsg(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handlePing = async (ip) => {
    if (!ip) return setPingResult('Invalid IP address');
    setPingResult(`Pinging ${ip}...`);
    try {
      const res = await axios.get(`${API_BASE}/ping/${ip}`);
      setPingResult(res.data.output);
    } catch (err) {
      setPingResult(`Ping error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="text-center fw-bold mb-4 heading-text">⚙️ WireGuard VPN Control Panel</h1>

      {!showDetails ? (
        <>
          <Row className="justify-content-center mb-4">
            <Col xs="auto">
              <Button variant="success" onClick={() => handleVpnAction('start')} className="me-2">Start</Button>
              <Button variant="danger" onClick={() => handleVpnAction('stop')} className="me-2">Stop</Button>
              <Button variant="warning" onClick={() => handleVpnAction('restart')}>Restart</Button>
            </Col>
          </Row>

          {actionMsg && <Alert variant="info" className="text-center">{actionMsg}</Alert>}

          <Card className="mb-4 shadow">
            <Card.Body>
              <Card.Title>Status</Card.Title>
              {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
              ) : (
                <pre className="status-output">{wgStatus}</pre>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow">
            <Card.Body>
              <Card.Title>Ping Clients</Card.Title>
              {peerIPs.length === 0 ? (
                <p>No connected peers found.</p>
              ) : (
                <Table bordered hover size="sm">
                  <thead>
                    <tr><th>Peer IP</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {peerIPs.map(ip => (
                      <tr key={ip}>
                        <td>{ip}</td>
                        <td>
                          <Button size="sm" variant="info" onClick={() => handlePing(ip)}>Ping</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              {pingResult && (
                <>
                  <h5 className="mt-3">Ping Result</h5>
                  <pre className="ping-output">{pingResult}</pre>
                </>
              )}
            </Card.Body>
          </Card>

          <div className="text-center">
            <Button variant="primary" onClick={() => setShowDetails(true)}>Next</Button>
          </div>
        </>
      ) : (
        <>
       <Card className="mb-4 shadow fade-in">
  <Card.Body>
    <h2 className="text-center text-primary">🚀 Dive Into the WireGuard VPN Project</h2>
    <ul className="mt-3">
      <li>✅ Set up a secure WireGuard VPN server for private communication between devices.</li>
      <li>🔄 Enabled IP forwarding and NAT for smooth data flow across subnets.</li>
      <li>🔧 Managed routing and analyzed traffic to debug and optimize network performance.</li>
      <li>🚀 Result: Created a secure, reliable VPN network for remote access and device communication.</li>
    </ul>
  </Card.Body>
</Card>

          <Card className="mb-4 shadow fade-in">
            <Card.Body>
              <h5 className="mb-3  ">📄 Example Configuration</h5>
              <pre>{`[Interface]
PrivateKey = SERVER_PRIVATE_KEY
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = CLIENT_PUBLIC_KEY
AllowedIPs = 10.0.0.2/32
PersistentKeepalive = 25`}</pre>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow fade-in">
            <Card.Body>
              <h5>🔍 WireGuard Server Configuration Explained</h5>
              <ul>
  <li><strong>PrivateKey:</strong> This is the server's private key used for encryption and identification. Keep it secret.</li>
  <li><strong>Address:</strong> The IP address assigned to the WireGuard interface (e.g., <code>10.0.0.1/24</code>).</li>
  <li><strong>ListenPort:</strong> The port on which the server listens for incoming WireGuard connections (usually <code>51820</code>).</li>
  <li><strong>PostUp:</strong> A command that runs after the interface is up. Commonly used to set firewall rules (e.g., iptables for NAT).</li>
  <li><strong>PostDown:</strong> A command that runs after the interface is down. Used to remove rules set by PostUp.</li>
  <li><strong>[Peer]:</strong> Section for each client (peer) that connects to the server.</li>
  <ul>
    <li><strong>PublicKey:</strong> The public key of the client.</li>
    <li><strong>AllowedIPs:</strong> The IPs that the client is allowed to use (usually <code>10.0.0.2/32</code> for a single client).</li>
  </ul>
</ul>

            </Card.Body>
          </Card>

          <Card className="mb-4 shadow fade-in">
  <Card.Body>
    <h5>🧩 Setup Steps</h5>
    <ul>
      <li>Install WireGuard and generate keys</li>
      <li>Configure server & clients with IP forwarding and NAT</li>
      <li>Start the WireGuard service</li>
      <li>Test connectivity and debug with ping & tcpdump</li>
    </ul>
  </Card.Body>
</Card>


          <Card className="mb-4 shadow fade-in">
  <Card.Body>
    <h5>
      🟢🔴MADE BY - koya navya keerthana -{" "}
      <a href="https://www.linkedin.com/in/navya-keerthana-k/" target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>{" "}
      |{" "}
      <a href="https://github.com/iam-navyaK" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
    </h5>
  </Card.Body>
</Card>

          <div className="text-center">
            <Button variant="secondary" onClick={() => setShowDetails(false)}>Back</Button>
          </div>
        </>
      )}
    </Container>
  );
}

export default App;