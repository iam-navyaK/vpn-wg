

## 📡 Private Network Implementation with WireGuard VPN and Traffic Analysis

This project demonstrates the setup and management of a **private network** using **WireGuard VPN**, including secure peer-to-peer connections, subnet routing via **IP forwarding** and **NAT**, and traffic analysis for network monitoring and debugging.

---

### 🚀 Features

* ✅ Configured a **WireGuard VPN server** on Linux
* 🔐 Established **secure encrypted tunnels** between local and remote devices
* 🌐 Enabled **IP forwarding** and **NAT** (Network Address Translation) for internal subnet routing
* 🛠️ Conducted **network traffic analysis** to:

  * Debug connectivity issues
  * Inspect routing tables and firewall rules
  * Log and interpret data packets

---

### 🏗️ Architecture Overview

```
[Peer A] ─────┐
              │ Encrypted Tunnel via WireGuard
[Peer B] ─────┤──────────────► [VPN Server] ───► [Internal Network / Internet]
              │
[Peer C] ─────┘
```

---

### ⚙️ Tech Stack

* 🔧 **WireGuard** – lightweight, fast VPN tunnel implementation
* 🐧 **Linux (Ubuntu/Debian)** – server and client systems
* 📶 **iptables** – for NAT and firewall rules
* 📈 **tcpdump, Wireshark** – for traffic analysis and debugging

---

### 📌 Setup Instructions

1. **Install WireGuard**

   ```bash
   sudo apt update
   sudo apt install wireguard
   ```

2. **Generate Keys**

   ```bash
   wg genkey | tee privatekey | wg pubkey > publickey
   ```

3. **Configure Server (e.g., `/etc/wireguard/wg0.conf`)**

   ```ini
   [Interface]
   PrivateKey = <server-private-key>
   Address = 10.0.0.1/24
   ListenPort = 51820
   PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
   PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
   ```

4. **Enable IP Forwarding**

   ```bash
   echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

5. **Start the VPN**

   ```bash
   sudo wg-quick up wg0
   ```

---

### 🔍 Traffic Analysis

* **Inspect active connections:**

  ```bash
  sudo wg show
  ```

* **Log and analyze packets:**

  ```bash
  sudo tcpdump -i wg0
  ```

* **Wireshark**: Capture and visually analyze traffic for patterns and anomalies.

---

### 📊 Results

* Successfully created a **secure private network** across devices.
* Verified **seamless connectivity and subnet routing**.
* Identified and resolved **latency and route propagation issues** through deep packet inspection and trace logging.

---


