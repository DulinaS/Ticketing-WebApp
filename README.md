# 🎟️ EventSphere – Distributed Ticketing Platform

EventSphere is a **production-style, event-driven microservices ticketing system** designed to demonstrate real-world backend engineering practices. The project is built using **microservices architecture**, **Apache Kafka** for asynchronous communication, **Docker** for containerization, and **Kubernetes** for orchestration.

---

## 🚀 Key Features

- Microservices-based architecture with independent services
- Event-driven communication using **Apache Kafka**
- JWT-based authentication and **Role-Based Access Control (RBAC)**
- Ticket and order lifecycle management
- Automated order expiry and background processing
- Event-driven notification system
- Audit logging for traceability
- Analytics and reporting dashboards
- Dockerized services with Kubernetes orchestration
- CI-ready setup with GitHub Actions support

---

## 🏗️ System Architecture

```
        Client (React / Next.js)
                  │
                  ▼
     Ingress Controller (Kubernetes)
                  │
                  ▼
┌────────────────────────────────────────┐
│          Microservices Layer           │
│----------------------------------------│
│ Auth | Tickets | Orders | Payments     │
│ Notifications | Audit | Analytics      │
└────────────────────────────────────────┘
                  │
                  ▼
       Apache Kafka (Event Bus)
```

Each microservice owns its **own database** and communicates asynchronously via Kafka events, ensuring **loose coupling** and scalability.

---

## 🧩 Microservices Overview

### 🔐 Auth Service
- User registration and authentication
- JWT-based authorization
- User roles: `ADMIN`, `SELLER`, `BUYER`, `SUPPORT`

---

### 🎫 Ticket Service
- Ticket creation and management
- Ticket lifecycle handling

**Ticket States:**
```
DRAFT → PUBLISHED → RESERVED → SOLD → CANCELLED
```

Business rules ensure price immutability after reservation and safe concurrent updates.

---

### 📦 Order Service
- Ticket reservation and order creation
- Order expiry management

**Order States:**
```
CREATED → AWAITING_PAYMENT → COMPLETED → CANCELLED → EXPIRED
```

Uses delayed events to automatically release tickets when orders expire.

---

### 💳 Payment Service
- Payment processing simulation
- Refund handling

**Payment States:**
```
PENDING → PAID → FAILED → REFUNDED
```

Designed to support idempotent processing and safe retries.

---

### 📢 Notification Service
- Event-driven notification handling
- Consumes Kafka events
- Sends mock email notifications (console/log based)

Triggered for:
- Ticket purchases
- Order cancellations / expiry
- Refunds and updates

---

### 📝 Audit Log Service
- Maintains immutable audit records
- Tracks all critical system actions

Provides traceability and accountability across the system.

---

### 📊 Analytics Service
- Aggregates event data from Kafka
- Generates real-time and historical insights

Examples:
- Tickets sold vs available
- Revenue per event
- Orders per day

---

## 🔄 Event-Driven Architecture (Kafka)

**Why Kafka?**
- Durable event storage
- Horizontal scalability
- Event replayability
- Industry-standard messaging system

**Design Decisions:**
- One topic per event type
- Consumer groups per microservice
- Retry topics and dead-letter queues (DLQ)
- Idempotent event handlers

---

## 🔐 Security

- JWT-based authentication
- Role-based authorization (RBAC)
- Service-level validation
- Kubernetes Secrets for sensitive configuration

---

## ⚙️ Infrastructure & DevOps

### Containerization
- Docker for all services
- Independent builds and deployments

### Orchestration
- Kubernetes (local cluster using Docker Desktop / Minikube)
- Deployments, Services, Ingress configuration

### CI/CD
- GitHub Actions pipeline
- Automated testing and image builds

---

## 📈 Observability

- Health check endpoints for all services
- Structured logging
- Correlation IDs for distributed request tracing

(Optional):
- Prometheus & Grafana integration

---

## 🖥️ Frontend

- Built with React / Next.js
- Role-based dashboards
- Admin moderation views
- Analytics visualizations

The UI is intentionally kept clean and functional, prioritizing backend architecture and system design.

---

## 🧪 Local Development Setup

### Prerequisites
- Docker
- Kubernetes (Docker Desktop / Minikube)
- Node.js
- Skaffold

### Start the Application
```bash
skaffold dev
```

This command builds images, deploys services to Kubernetes, and enables live reload for development.

---

## 📚 Technology Stack

| Category | Technology |
|--------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express |
| Messaging | Apache Kafka |
| Databases | MongoDB (per service) |
| Containerization | Docker |
| Orchestration | Kubernetes |
| CI/CD | GitHub Actions |

---

## 🎓 Learning Outcomes

- Designing scalable microservices systems
- Implementing event-driven architecture
- Managing distributed consistency
- Kubernetes-based deployments
- Production-grade backend engineering practices

---

## 🏁 Project Status

✅ Core functionality complete  
🚧 Continuous enhancements in progress

---

## 👤 Author

**Dulina Senarathna**  
Computer Engineering Undergraduate  

---

⭐ If you find this project insightful, feel free to explore the codebase and architecture.
